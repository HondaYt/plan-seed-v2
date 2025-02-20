import { STEPS_ORDER } from "@/constants/steps";
import { useCallback } from "react";
import { updateDoc, doc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { ProjectState } from "@/types/project";

export const useProjectProgress = (projectId: string) => {
	const updateProgress = useCallback(
		async (step: string) => {
			const projectRef = doc(db, "projects", projectId);

			// パスから正しいステップ名を抽出
			const stepName = step.split("/").pop() || "genre";
			const currentStepIndex = STEPS_ORDER.indexOf(
				stepName as (typeof STEPS_ORDER)[number],
			);

			if (currentStepIndex === -1) {
				console.warn(`Unknown step: ${stepName}`);
				return;
			}

			// 現在のステップを含むすべての前のステップを完了としてマーク
			const completedSteps = STEPS_ORDER.slice(0, currentStepIndex + 1);

			await updateDoc(projectRef, {
				"status.currentStep": stepName,
				"status.completedSteps": arrayUnion(...completedSteps),
				"status.lastUpdated": new Date(),
			});
		},
		[projectId],
	);

	// 次のステップと状態を取得する関数
	const getNextStepWithState = useCallback(async () => {
		const projectRef = doc(db, "projects", projectId);
		const projectDoc = await getDoc(projectRef);
		const data = projectDoc.data();
		const status = data?.status;
		const state = data?.state as ProjectState | undefined;

		if (!state) return { nextStep: "genre", state };

		// 各ステップの完了状態をチェック
		if (!state.genre) {
			return { nextStep: "genre", state };
		}

		if (!state.keywords?.length) {
			return { nextStep: "mind-map", state };
		}

		if (!state.concept) {
			return { nextStep: "concept", state };
		}

		if (
			!state.target?.ageMin ||
			!state.target?.ageMax ||
			!state.target?.gender
		) {
			return { nextStep: "target", state };
		}

		if (!state.scene?.when || !state.scene?.where) {
			return { nextStep: "scene", state };
		}

		if (!state.features?.length) {
			return { nextStep: "features", state };
		}

		// メイン機能が選択されていない場合は features/detail に遷移
		if (state.mainFeatureIndex === undefined || state.mainFeatureIndex < 0) {
			return { nextStep: "features/detail", state };
		}

		// すべてのステップが完了している場合
		return {
			nextStep: "result",
			state,
		};
	}, [projectId]);

	return { updateProgress, getNextStepWithState };
};

"use client";

import { useEffect, useState } from "react";
import {
	useParams,
	useRouter,
	useSearchParams,
	usePathname,
} from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { updateProjectState, getProjectState } from "@/lib/firebase/projects";
import type { ProjectState } from "@/types/project";
import styles from "./layout.module.css";
import { PlanningContext } from "@/contexts/PlanningContext";
import { useProjectProgress } from "@/hooks/useProjectProgress";

const initialState: ProjectState = {
	genre: "",
	keywords: [],
	concept: "",
	target: {
		ageMin: "",
		ageMax: "",
		gender: "",
		occupation: "",
		personality: "",
	},
	scene: {
		when: "",
		where: "",
	},
	features: [],
	mainFeatureIndex: -1,
};

const getGenderLabel = (gender: string): string => {
	switch (gender) {
		case "male":
			return "男性";
		case "female":
			return "女性";
		case "other":
			return "その他";
		default:
			return gender;
	}
};

export default function ProjectLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const params = useParams();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { user } = useAuth();
	const projectId = params.uid as string;
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [state, setState] = useState<ProjectState>(initialState);
	const [isOpen, setIsOpen] = useState(true);
	const [isSidebarVisible, setIsSidebarVisible] = useState(true);
	const { updateProgress } = useProjectProgress(projectId);

	// サイドバーの表示制御
	useEffect(() => {
		setIsSidebarVisible(!pathname.includes("/result"));
	}, [pathname]);

	// URLパラメータの変更を監視して状態を更新
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isAuthorized) {
			const newState = { ...state };
			let hasChanges = false;

			// ジャンル
			const genre = searchParams.get("genre");
			if (genre && genre !== state.genre) {
				newState.genre = genre;
				hasChanges = true;
			}

			// words パラメータの処理
			const words = searchParams.get("words");
			if (words) {
				const wordsArray = decodeURIComponent(words).split(",");
				if (JSON.stringify(wordsArray) !== JSON.stringify(state.keywords)) {
					newState.keywords = wordsArray;
					hasChanges = true;
				}
			}

			// キーワード
			const keywords = searchParams.get("keywords");
			if (keywords) {
				const keywordArray = decodeURIComponent(keywords).split(",");
				if (JSON.stringify(keywordArray) !== JSON.stringify(state.keywords)) {
					newState.keywords = keywordArray;
					hasChanges = true;
				}
			}

			// コンセプト
			const concept = searchParams.get("concept");
			if (concept) {
				const decodedConcept = decodeURIComponent(concept);
				if (decodedConcept !== state.concept) {
					newState.concept = decodedConcept;
					hasChanges = true;
				}
			}

			// ターゲット
			const ageMin = searchParams.get("ageMin");
			const ageMax = searchParams.get("ageMax");
			const gender = searchParams.get("gender");
			const occupation = searchParams.get("occupation");
			const personality = searchParams.get("personality");

			if (ageMin || ageMax || gender || occupation || personality) {
				newState.target = {
					...state.target,
					ageMin: ageMin || state.target.ageMin,
					ageMax: ageMax || state.target.ageMax,
					gender: gender || state.target.gender,
					occupation: occupation
						? decodeURIComponent(occupation)
						: state.target.occupation,
					personality: personality
						? decodeURIComponent(personality)
						: state.target.personality,
				};
				hasChanges = true;
			}

			// シーン
			const when = searchParams.get("when");
			const where = searchParams.get("where");

			if (when || where) {
				newState.scene = {
					...state.scene,
					when: when ? decodeURIComponent(when) : state.scene.when,
					where: where ? decodeURIComponent(where) : state.scene.where,
				};
				hasChanges = true;
			}

			// 機能リスト
			const featuresParam = searchParams.get("features");
			if (featuresParam) {
				const features = decodeURIComponent(featuresParam).split(",");
				if (JSON.stringify(features) !== JSON.stringify(state.features)) {
					newState.features = features;
					hasChanges = true;
				}
			}

			// メイン機能
			const mainFeatureIndex = searchParams.get("mainFeatureIndex");
			if (mainFeatureIndex) {
				const index = Number.parseInt(mainFeatureIndex, 10);
				if (index !== state.mainFeatureIndex) {
					newState.mainFeatureIndex = index;
					hasChanges = true;
				}
			}

			// 変更があった場合のみ状態を更新
			if (hasChanges) {
				setState(newState);
			}
		}
	}, [searchParams, isAuthorized]);

	// パスの変更を監視して進捗を更新
	useEffect(() => {
		if (!isAuthorized || !pathname) return;

		// /planning/[uid]/[step] の形式からstepを抽出
		const pathParts = pathname.split("/");
		const currentStep = pathParts[pathParts.length - 1];

		console.log("Path changed:", {
			pathname,
			currentStep,
		});

		updateProgress(currentStep);
	}, [pathname, isAuthorized, updateProgress]);

	// プロジェクトの権限チェックとステートの初期読み込み
	useEffect(() => {
		const checkAccessAndLoadState = async () => {
			if (!user) {
				router.push("/auth");
				return;
			}

			try {
				const projectDoc = await getDoc(doc(db, "projects", projectId));
				if (!projectDoc.exists()) {
					router.push("/dashboard");
					return;
				}

				const projectData = projectDoc.data();
				if (
					projectData.userId !== user.uid &&
					!projectData.sharedWith?.includes(user.uid)
				) {
					router.push("/dashboard");
					return;
				}

				// プロジェクトの状態を読み込む
				const savedState = await getProjectState(projectId);
				if (savedState) {
					setState(savedState);
				}

				setIsAuthorized(true);
				setIsLoading(false);
			} catch (error) {
				console.error("Error checking project access:", error);
				router.push("/dashboard");
			}
		};

		checkAccessAndLoadState();
	}, [projectId, user, router]);

	// stateが更新されたらFirebaseに保存
	useEffect(() => {
		if (isAuthorized && !isLoading) {
			const saveState = async () => {
				try {
					await updateProjectState(projectId, state);
				} catch (error) {
					console.error("Error saving project state:", error);
				}
			};

			saveState();
		}
	}, [state, projectId, isAuthorized, isLoading]);

	if (isLoading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loading}>読み込み中...</div>
			</div>
		);
	}

	if (!isAuthorized) {
		return null;
	}

	return (
		<PlanningContext.Provider value={{ state, setState }}>
			<div className={styles.planningLayout}>
				{isSidebarVisible && (
					<div className={`${styles.sideBar} ${!isOpen ? styles.closed : ""}`}>
						<button
							type="button"
							className={styles.toggleButton}
							onClick={() => setIsOpen(!isOpen)}
							aria-label={isOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
						>
							{isOpen ? "<" : ">"}
						</button>
						<div className={styles.sideBarContent}>
							<h3>現在の選択</h3>
							{state.genre && <p>ジャンル: {state.genre}</p>}
							{state.keywords.length > 0 && (
								<div>
									<p>キーワード:</p>
									<ul className={styles.keywordList}>
										{state.keywords.map((keyword) => (
											<li key={keyword}>{keyword}</li>
										))}
									</ul>
								</div>
							)}
							{state.concept && (
								<div>
									<p>企画コンセプト:</p>
									<p className={styles.concept}>{state.concept}</p>
								</div>
							)}
							{(state.target.ageMin ||
								state.target.ageMax ||
								state.target.gender ||
								state.target.occupation) && (
								<div>
									<p>ターゲット:</p>
									<div className={styles.targetInfo}>
										{(state.target.ageMin || state.target.ageMax) && (
											<p>
												年齢: {state.target.ageMin}歳 〜 {state.target.ageMax}歳
											</p>
										)}
										{state.target.gender && (
											<p>性別: {getGenderLabel(state.target.gender)}</p>
										)}
										{state.target.occupation && (
											<p>職業: {state.target.occupation}</p>
										)}
										{state.target.personality && (
											<p>性格: {state.target.personality}</p>
										)}
									</div>
								</div>
							)}
							{(state.scene.when || state.scene.where) && (
								<div>
									<p>使用場面:</p>
									<div className={styles.sceneInfo}>
										{state.scene.when && <p>いつ: {state.scene.when}</p>}
										{state.scene.where && <p>どこで: {state.scene.where}</p>}
									</div>
								</div>
							)}
							{state.features.length > 0 && (
								<div>
									<p>機能一覧:</p>
									<ul className={styles.featureList}>
										{state.features.map((feature, index) => (
											<li
												key={feature}
												className={
													index === state.mainFeatureIndex
														? styles.mainFeature
														: ""
												}
											>
												{feature}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
				)}
				<div
					className={`${styles.mainContent} ${
						!isOpen || !isSidebarVisible ? styles.expanded : ""
					}`}
				>
					{children}
				</div>
			</div>
		</PlanningContext.Provider>
	);
}

"use client";

import { Suspense, useState } from "react";
import styles from "./page.module.css";
import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import { useContext } from "react";
import { PlanningContext } from "@/contexts/PlanningContext";
import type { ProjectState } from "@/types/project";

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

function ResultContent() {
	const { state } = useContext(PlanningContext) as { state: ProjectState };
	const [copySuccess, setCopySuccess] = useState(false);

	const handleCopy = async () => {
		try {
			const content = `
# 企画概要

## 基本情報
${state?.genre ? `**ジャンル:** ${state.genre}` : ""}
${state?.keywords?.length > 0 ? `**キーワード:** ${state.keywords.join(", ")}` : ""}
${state?.concept ? `**企画コンセプト:**\n${state.concept}` : ""}

## ターゲット
${state?.target?.ageMin || state?.target?.ageMax ? `**年齢層:** ${state.target.ageMin}歳 〜 ${state.target.ageMax}歳` : ""}
${state?.target?.gender ? `**性別:** ${getGenderLabel(state.target.gender)}` : ""}
${state?.target?.occupation ? `**職業:** ${state.target.occupation}` : ""}
${state?.target?.personality ? `**性格:** ${state.target.personality}` : ""}

## 使用シーン
${state?.scene?.when ? `**利用タイミング:**\n${state.scene.when}` : ""}
${state?.scene?.where ? `**利用場所:**\n${state.scene.where}` : ""}

## 機能
${
	state?.mainFeatureIndex >= 0 && state.features[state.mainFeatureIndex]
		? `### メイン機能\n${state.features[state.mainFeatureIndex]}`
		: ""
}
${
	state?.features?.length > 0
		? `### その他の機能\n${state.features
				.filter((_, index) => index !== state.mainFeatureIndex)
				.map((feature) => `- ${feature}`)
				.join("\n")}`
		: ""
}
`.trim();

			await navigator.clipboard.writeText(content);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("コピーに失敗しました:", err);
		}
	};

	if (!state) {
		return <div>データが見つかりません</div>;
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1>企画概要</h1>
			</div>

			<section className={styles.section}>
				<h2>基本情報</h2>
				<div className={styles.content}>
					{state.genre && <p>ジャンル: {state.genre}</p>}
					{state.keywords?.length > 0 && (
						<div className={styles.keywords}>
							<p>キーワード:</p>
							<ul>
								{state.keywords.map((keyword) => (
									<li key={keyword}>{keyword}</li>
								))}
							</ul>
						</div>
					)}
					{state.concept && (
						<div className={styles.concept}>
							<p>企画コンセプト:</p>
							<p>{state.concept}</p>
						</div>
					)}
				</div>
			</section>

			<section className={styles.section}>
				<h2>ターゲット</h2>
				<div className={styles.content}>
					{(state.target?.ageMin || state.target?.ageMax) && (
						<p>
							年齢層: {state.target.ageMin}歳 〜 {state.target.ageMax}歳
						</p>
					)}
					{state.target?.gender && (
						<p>性別: {getGenderLabel(state.target.gender)}</p>
					)}
					{state.target?.occupation && <p>職業: {state.target.occupation}</p>}
					{state.target?.personality && <p>性格: {state.target.personality}</p>}
				</div>
			</section>

			<section className={styles.section}>
				<h2>使用シーン</h2>
				<div className={styles.content}>
					{state.scene?.when && <p>利用タイミング: {state.scene.when}</p>}
					{state.scene?.where && <p>利用場所: {state.scene.where}</p>}
				</div>
			</section>

			<section className={styles.section}>
				<h2>機能</h2>
				<div className={styles.content}>
					{state.mainFeatureIndex >= 0 &&
						state.features[state.mainFeatureIndex] && (
							<div className={styles.mainFeature}>
								<h3>メイン機能</h3>
								<p>{state.features[state.mainFeatureIndex]}</p>
							</div>
						)}
					{state.features?.length > 0 && (
						<div className={styles.features}>
							<h3>その他の機能</h3>
							{state.features
								.filter((_, index) => index !== state.mainFeatureIndex)
								.map((feature) => (
									<p key={feature}>{feature}</p>
								))}
						</div>
					)}
				</div>
			</section>

			<div className={styles.buttonContainer}>
				<button
					type="button"
					onClick={handleCopy}
					className={styles.copyButton}
					aria-label="内容をコピー"
				>
					{copySuccess ? "コピーしました！" : "コピー"}
				</button>
				<LinkBtn href={"/dashboard"}>はじめからする</LinkBtn>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<main className={styles.main}>
			<Suspense fallback={<div>Loading...</div>}>
				<ResultContent />
			</Suspense>
		</main>
	);
}

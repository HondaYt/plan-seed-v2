"use client";

import { useState, useEffect, Suspense } from "react";
import styles from "./page.module.css";
import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import { useSearchParams } from "next/navigation";

type Feature = {
	id: string;
	text: string;
	isSelected: boolean;
};

type State = {
	input: string;
	list: Feature[];
};

function FeatureContent() {
	const [state, setState] = useState<State>({
		input: "",
		list: [],
	});
	const [targetUrl, setTargetUrl] = useState("features/detail");

	const handleAdd = () => {
		if (state.input.trim() === "") return;
		setState({
			...state,
			list: [
				...state.list,
				{
					id: `feature-${state.list.length}`,
					text: state.input.trim(),
					isSelected: false,
				},
			],
			input: "",
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			handleAdd();
		}
	};

	const handleToggleSelect = (id: string) => {
		const newList = state.list.map((item) =>
			item.id === id ? { ...item, isSelected: !item.isSelected } : item,
		);

		// 選択されたアイテムを先頭に移動
		const selectedItems = newList.filter((item) => item.isSelected);
		const unselectedItems = newList.filter((item) => !item.isSelected);

		setState({
			...state,
			list: [...selectedItems, ...unselectedItems],
		});
	};

	return (
		<div className={styles.main}>
			<div className={styles.titleContainer}>
				<h2 className={styles.pageTitle}>
					次はブレーンストーミングです!
					<br />
					企画に必要な機能や要素をたくさん出していきましょう！
				</h2>
			</div>
			<div className={styles.container}>
				<h2>機能・要素の設定</h2>
				<div className={styles.inputGroup}>
					<input
						type="text"
						className={styles.input}
						value={state.input}
						onChange={(e) => {
							setState({
								...state,
								input: e.target.value,
							});
						}}
						onKeyDown={handleKeyDown}
					/>
					<button
						type="button"
						className={styles.addButton}
						onClick={handleAdd}
					>
						追加
					</button>
				</div>

				<div className={styles.subText}>
					<h3>お気に入りのアイデアを選択しましょう！（複数可）</h3>
				</div>
				<div className={styles.featureList}>
					{state.list.map((item) => (
						<button
							key={item.id}
							type="button"
							className={`${styles.featureItem} ${
								item.isSelected ? styles.selected : ""
							}`}
							onClick={() => handleToggleSelect(item.id)}
							aria-pressed={item.isSelected}
						>
							{item.text}
						</button>
					))}
				</div>
				<Suspense fallback={<div>Loading...</div>}>
					<FeatureUrlHandler
						list={state.list}
						targetUrl={targetUrl}
						setTargetUrl={setTargetUrl}
					/>
				</Suspense>
			</div>
		</div>
	);
}

function FeatureUrlHandler({
	list,
	targetUrl,
	setTargetUrl,
}: {
	list: Feature[];
	targetUrl: string;
	setTargetUrl: (url: string) => void;
}) {
	const searchParams = useSearchParams();
	const hasSelectedFeatures = list.some((item) => item.isSelected);

	useEffect(() => {
		const selectedFeatures = list
			.filter((item) => item.isSelected)
			.map((item) => item.text);

		if (selectedFeatures.length > 0) {
			const params = new URLSearchParams();
			params.append("features", encodeURIComponent(selectedFeatures.join(",")));
			setTargetUrl(`features/detail?${params.toString()}`);
		} else {
			setTargetUrl("features/detail");
		}
	}, [list, setTargetUrl]);

	return (
		<LinkBtn disable={!hasSelectedFeatures} href={targetUrl}>
			次へ
		</LinkBtn>
	);
}

export default function Page() {
	return (
		<main className={styles.main}>
			<Suspense fallback={<div>Loading...</div>}>
				<FeatureContent />
			</Suspense>
		</main>
	);
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import styles from "./page.module.css";
import { LinkBtn } from "@/components/LinkBtn/LinkBtn";

function DetailContent() {
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
	const [targetUrl, setTargetUrl] = useState("/result");

	return (
		<DetailContentInner
			selectedIndex={selectedIndex}
			setSelectedIndex={setSelectedIndex}
			targetUrl={targetUrl}
			setTargetUrl={setTargetUrl}
		/>
	);
}

function DetailContentInner({
	selectedIndex,
	setSelectedIndex,
	targetUrl,
	setTargetUrl,
}: {
	selectedIndex: number;
	setSelectedIndex: (value: number) => void;
	targetUrl: string;
	setTargetUrl: (value: string) => void;
}) {
	const searchParams = useSearchParams();
	const featuresParam = searchParams.get("features");
	const features = featuresParam
		? decodeURIComponent(featuresParam).split(",")
		: [];

	useEffect(() => {
		if (selectedIndex >= 0) {
			const params = new URLSearchParams(searchParams.toString());
			params.set("mainFeatureIndex", selectedIndex.toString());
			setTargetUrl(`../result?${params.toString()}`);
		}
	}, [selectedIndex, searchParams, setTargetUrl]);

	return (
		<div className={styles.container}>
			<h1>メイン機能を選択</h1>
			<div className={styles.featureList}>
				{features.map((feature, index) => (
					<label key={index} className={styles.featureItem}>
						<input
							type="radio"
							name="mainFeature"
							value={index}
							checked={selectedIndex === index}
							onChange={(e) => setSelectedIndex(Number(e.target.value))}
							className={styles.radio}
						/>
						{feature}
					</label>
				))}
			</div>
			<div className={styles.buttonContainer}>
				<LinkBtn disable={selectedIndex < 0} href={targetUrl}>
					次へ進む
				</LinkBtn>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<main className={styles.main}>
			<Suspense fallback={<div>Loading...</div>}>
				<DetailContent />
			</Suspense>
		</main>
	);
}

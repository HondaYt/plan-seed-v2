"use client";

import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import styles from "./page.module.css";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function GenreOtherContent() {
	const [state, setState] = useState("");

	return (
		<main className={styles.main}>
			<input
				className={styles.input}
				type="text"
				value={state}
				onChange={(e) => {
					setState(e.target.value);
				}}
			/>
			<Suspense fallback={<div>Loading...</div>}>
				<GenreUrlHandler state={state} />
			</Suspense>
		</main>
	);
}

function GenreUrlHandler({ state }: { state: string }) {
	const searchParams = useSearchParams();

	return (
		<LinkBtn
			disable={state === ""}
			href={{
				pathname: "/planning/mind-map",
				query: { genre: `${state}` },
			}}
		>
			次へ進む
		</LinkBtn>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<GenreOtherContent />
		</Suspense>
	);
}

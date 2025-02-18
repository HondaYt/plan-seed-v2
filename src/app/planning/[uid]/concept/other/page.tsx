"use client";

import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import styles from "./page.module.css";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ConceptOtherContent />
		</Suspense>
	);
}

function ConceptOtherContent() {
	const [state, setState] = useState("");
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ConceptOtherContentInner state={state} setState={setState} />
		</Suspense>
	);
}

function ConceptOtherContentInner({
	state,
	setState,
}: {
	state: string;
	setState: (value: string) => void;
}) {
	const searchParams = useSearchParams();

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
			<LinkBtn
				disable={state === ""}
				href={{
					pathname: "/planning/target",
					query: { concept: `${state}` },
				}}
			>
				次へ進む
			</LinkBtn>
		</main>
	);
}

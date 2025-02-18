"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import { useParams } from "next/navigation";

type GenreBtnProps = {
	genre: string;
};

function GenreBtn(props: GenreBtnProps) {
	return (
		<Link
			className={styles.genreBtn}
			href={{
				pathname: "mind-map",
				query: { genre: `${props.genre}` },
			}}
		>
			{props.genre}
		</Link>
	);
}

export default function GenrePage() {
	const params = useParams();
	const projectId = params.uid as string;

	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<h2>企画のジャンルを選択してください</h2>
				<div className={styles.genres}>
					<GenreBtn genre="遊び" />
					<GenreBtn genre="勉強" />
					<GenreBtn genre="社会問題" />
				</div>
				<LinkBtn secondary href={"genre/other"}>
					自分で考える
				</LinkBtn>
			</main>
		</div>
	);
}

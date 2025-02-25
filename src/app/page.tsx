"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import { useAuth } from "@/contexts/AuthContext";

type FeatureItemProps = {
	iconSrc: string;
	title: string;
	description: string;
};

const FeatureItem = (props: FeatureItemProps) => {
	return (
		<div className={styles.featureItem}>
			<div className={styles.iconWrapper}>
				<img
					src={props.iconSrc}
					alt={props.title}
					className={styles.iconImage}
				/>
			</div>
			<h2 className={styles.featureTitle}>{props.title}</h2>
			<p className={styles.featureDescription}>{props.description}</p>
		</div>
	);
};

const featureItems = [
	{
		iconSrc: "/icons/idea.svg",
		title: "アイデア整理",
		description: "マインドマップで自由に発想を広げ、アイデアを整理できます",
	},
	{
		iconSrc: "/icons/target.svg",
		title: "ターゲット設定",
		description: "ユーザー像を具体的に設定し、ニーズを明確にします",
	},
	{
		iconSrc: "/icons/feature.svg",
		title: "機能定義",
		description: "必要な機能を洗い出し、優先順位をつけて整理します",
	},
];

export default function Page() {
	const { user } = useAuth();

	return (
		<>
			<header className={styles.header}>
				<div className={styles.userInfo}>
					<span>{user ? user.displayName : "ゲスト"}さん</span>
				</div>
			</header>
			<main className={styles.main}>
				<div className={styles.mv}>
					<Image
						src={"/logo.svg"}
						height={100}
						width={500}
						alt="Plan Seed"
						className={styles.logo}
						priority
					/>
					<p className={styles.catchphrase}>アイデアを育て、企画を実らせる</p>
				</div>

				<div className={styles.features}>
					{featureItems.map((featureItem, featureItemIdx) => (
						<FeatureItem
							key={featureItemIdx}
							title={featureItem.title}
							description={featureItem.description}
							iconSrc={featureItem.iconSrc}
						/>
					))}
				</div>

				<div className={styles.startSection}>
					<p className={styles.startText}>
						さあ、あなたの企画づくりを始めましょう！
					</p>
					<LinkBtn href={"/dashboard"}>はじめる</LinkBtn>
				</div>
			</main>
		</>
	);
}

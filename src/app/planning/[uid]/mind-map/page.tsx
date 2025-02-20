"use client";
import { useState, useEffect, Suspense } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ConvertibleInput } from "@/components/ConvertibleInput/ConvertibleInput";
import styles from "./page.module.css";
import { Tutorial } from "@/components/Tutorial/Tutorial";
import { Sidebar } from "@/components/MMSidebar/Sidebar";
import { useSearchParams } from "next/navigation";

type TreeNode = {
	id: number;
	text?: string;
	children: TreeNode[];
};

type LikedWord = {
	id: string;
	word: string;
	timestamp: number;
};

function MindMapContent() {
	const [textValue, setTextValue] = useState("");
	const [tree, setTree] = useState<TreeNode>({ id: 0, children: [] });
	const [nextId, setNextId] = useState(1);
	const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
	const [selectedLanguage, setSelectedLanguage] = useState<string>("ja");
	const [likedWords, setLikedWords] = useState<LikedWord[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showTutorial, setShowTutorial] = useState(true);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<MindMapContentInner
				textValue={textValue}
				setTextValue={setTextValue}
				tree={tree}
				setTree={setTree}
				nextId={nextId}
				setNextId={setNextId}
				usedWords={usedWords}
				setUsedWords={setUsedWords}
				selectedLanguage={selectedLanguage}
				setSelectedLanguage={setSelectedLanguage}
				likedWords={likedWords}
				setLikedWords={setLikedWords}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
				showTutorial={showTutorial}
				setShowTutorial={setShowTutorial}
			/>
		</Suspense>
	);
}

function MindMapContentInner({
	textValue,
	setTextValue,
	tree,
	setTree,
	nextId,
	setNextId,
	usedWords,
	setUsedWords,
	selectedLanguage,
	setSelectedLanguage,
	likedWords,
	setLikedWords,
	isLoading,
	setIsLoading,
	showTutorial,
	setShowTutorial,
}: {
	textValue: string;
	setTextValue: (value: string) => void;
	tree: TreeNode;
	setTree: Dispatch<SetStateAction<TreeNode>>;
	nextId: number;
	setNextId: Dispatch<SetStateAction<number>>;
	usedWords: Set<string>;
	setUsedWords: Dispatch<SetStateAction<Set<string>>>;
	selectedLanguage: string;
	setSelectedLanguage: (value: string) => void;
	likedWords: LikedWord[];
	setLikedWords: Dispatch<SetStateAction<LikedWord[]>>;
	isLoading: boolean;
	setIsLoading: (value: boolean) => void;
	showTutorial: boolean;
	setShowTutorial: (value: boolean) => void;
}) {
	const searchParams = useSearchParams();
	const genre = searchParams.get("genre") || "other";
	const keywordsParam = searchParams.get("keywords");
	const existingKeywords = keywordsParam
		? decodeURIComponent(keywordsParam).split(",")
		: [];

	useEffect(() => {
		if (existingKeywords.length > 0) {
			setUsedWords(new Set(existingKeywords));
			const existingLikedWords = existingKeywords.map((word, index) => ({
				id: String(index),
				word,
				timestamp: Date.now(),
			}));
			setLikedWords(existingLikedWords);
		}
	}, [existingKeywords, setUsedWords, setLikedWords]);

	useEffect(() => {
		const tutorialPreference = localStorage.getItem("hideTutorial");
		if (tutorialPreference === "true") {
			setShowTutorial(false);
		}
	}, [setShowTutorial]);

	const handleTutorialPreference = (hideForever: boolean) => {
		if (hideForever) {
			localStorage.setItem("hideTutorial", "true");
		}
		setShowTutorial(false);
	};

	const getAllWords = (node: TreeNode): string[] => {
		const words: string[] = [];
		if (node.text) words.push(node.text);
		for (const child of node.children) {
			words.push(...getAllWords(child));
		}
		return words;
	};

	const getAssociatedWord = async (word: string) => {
		try {
			setIsLoading(true);
			const currentWords = getAllWords(tree);
			if (textValue) currentWords.push(textValue);

			const response = await fetch("/api/mindMapGpt", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: word,
					usedWords: Array.from(usedWords),
					language: selectedLanguage,
					genre,
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error);

			setUsedWords((prev) => new Set([...prev, data.content]));
			return data.content;
		} catch (error) {
			console.error("エラーが発生しました:", error);
			return "エラー";
		} finally {
			setIsLoading(false);
		}
	};

	const handleButtonClick = async () => {
		if (textValue && !isLoading) {
			setUsedWords((prev) => new Set([...prev, textValue]));
			const associatedWord = await getAssociatedWord(textValue);
			const newChild = { id: nextId, text: associatedWord, children: [] };
			setNextId((prevId) => prevId + 1);
			setTree((prevTree) => ({
				...prevTree,
				children: [...prevTree.children, newChild],
			}));
		}
	};

	const handleChildClick = async (node: TreeNode) => {
		if (isLoading) return;

		const nodeText = node.text || `testText ${node.id}`;
		const associatedWord = await getAssociatedWord(nodeText);

		setTree((prevTree) => {
			const updateTree = (currentNode: TreeNode): TreeNode => {
				if (currentNode.id === node.id) {
					return {
						...currentNode,
						children: [
							...currentNode.children,
							{ id: nextId, text: associatedWord, children: [] },
						],
					};
				}
				return {
					...currentNode,
					children: currentNode.children.map(updateTree),
				};
			};
			setNextId((prevId) => prevId + 1);
			return updateTree(prevTree);
		});
	};

	const handleToggleLike = (node: TreeNode) => {
		const nodeId = String(node.id);
		const isLiked = likedWords.some((liked) => liked.id === nodeId);

		if (isLiked) {
			setLikedWords((prev) => prev.filter((word) => word.id !== nodeId));
		} else {
			const newLikedWord: LikedWord = {
				id: nodeId,
				word: node.text || `testText ${node.id}`,
				timestamp: Date.now(),
			};
			setLikedWords((prev) => [...prev, newLikedWord]);
		}
	};

	const renderNode = (node: TreeNode, isRoot = false) => (
		<div key={node.id} className={styles.parent}>
			{isRoot ? (
				<ConvertibleInput
					textValue={textValue}
					setTextValue={setTextValue}
					onButtonClick={handleButtonClick}
				/>
			) : (
				<div className={styles.nodeContainer}>
					<button
						className={styles.box}
						onClick={() => handleChildClick(node)}
						type="button"
					>
						{node.text || `testText ${node.id}`}
					</button>
					<button
						className={`${styles.likeButton} ${
							likedWords.some((liked) => liked.id === String(node.id))
								? styles.liked
								: ""
						}`}
						onClick={() => handleToggleLike(node)}
						type="button"
					>
						<span style={{ fontSize: "0.8em" }}>
							{likedWords.some((liked) => liked.id === String(node.id))
								? "♥"
								: "♡"}
						</span>
					</button>
				</div>
			)}
			<div className={styles.children}>
				{node.children.map((child) => renderNode(child))}
			</div>
		</div>
	);

	const tutorialSteps = [
		{
			target: "input",
			content: "まずは、ワードを入力しましょう。",
			image: "/tutorial/step1.jpg",
		},
		{
			target: "box",
			content: "ボックスをクリックすると関連するワードが生成されます",
			image: "/tutorial/step2.jpg",
		},
		{
			target: "like",
			content: "気に入ったワードにいいねをつけましょう",
			image: "/tutorial/step3.jpg",
		},
		{
			target: "result",
			content: "企画のゴールが出力されます",
			image: "/tutorial/step4.jpg",
		},
	];

	return (
		<Tutorial
			steps={tutorialSteps}
			isOpen={showTutorial}
			onClose={() => setShowTutorial(false)}
			onHideForever={() => handleTutorialPreference(true)}
		>
			<div className={styles.container}>
				<main className={`${styles.main} ${isLoading ? styles.loading : ""}`}>
					{renderNode(tree, true)}
				</main>
				<Sidebar
					inputText={textValue}
					likedWords={likedWords}
					onUnlike={(id) => handleToggleLike({ id: Number(id), children: [] })}
				/>
			</div>
		</Tutorial>
	);
}

export default function Page() {
	return <MindMapContent />;
}

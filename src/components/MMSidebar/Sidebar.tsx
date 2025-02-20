import { LinkBtn } from "@/components/LinkBtn/LinkBtn";
import styles from "./Sidebar.module.css";

interface LikedWord {
	id: string;
	word: string;
	timestamp: number;
}

type SidebarProps = {
	inputText: string;
	likedWords: LikedWord[];
	onUnlike: (id: string) => void;
};

export function Sidebar({ likedWords, inputText, onUnlike }: SidebarProps) {
	return (
		<div className={styles.sidebar}>
			<div>
				<h2>いいねした単語</h2>
				<ul className={styles.wordList}>
					{likedWords.map((word) => (
						<li key={word.id} className={styles.wordItem}>
							<span>{word.word}</span>
							<button
								type="button"
								onClick={() => onUnlike(word.id)}
								className={styles.unlikeButton}
							>
								×
							</button>
						</li>
					))}
				</ul>
			</div>
			<LinkBtn
				disable={likedWords.length === 0}
				href={{
					pathname: "concept",
					query: {
						keywords: [
							...(inputText ? [inputText] : []),
							...likedWords.map((w) => w.word),
						].join(","),
					},
				}}
			>
				次へ進む
			</LinkBtn>
		</div>
	);
}

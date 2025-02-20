import { useState } from "react";
import styles from "./UserSearch.module.css";
import type { UserSearchResult } from "@/lib/firebase/users";
import { searchUsers } from "@/lib/firebase/users";

interface UserSearchProps {
	onSelect: (user: UserSearchResult) => void;
}

export default function UserSearch({ onSelect }: UserSearchProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<UserSearchResult[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!searchTerm.trim()) return;

		setIsSearching(true);
		try {
			const users = await searchUsers(searchTerm.trim());
			setResults(users);
		} catch (error) {
			console.error("ユーザー検索に失敗しました:", error);
		} finally {
			setIsSearching(false);
		}
	};

	return (
		<div className={styles.userSearch}>
			<form onSubmit={handleSearch} className={styles.searchForm}>
				<input
					type="email"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="メールアドレスで検索"
					className={styles.searchInput}
				/>
				<button type="submit" className={styles.searchButton}>
					検索
				</button>
			</form>

			{isSearching ? (
				<div className={styles.loading}>検索中...</div>
			) : (
				<ul className={styles.resultList}>
					{results.map((user) => (
						<li key={user.uid} className={styles.resultItem}>
							<div className={styles.userInfo}>
								<span className={styles.userEmail}>{user.email}</span>
								{user.displayName && (
									<span className={styles.userName}>{user.displayName}</span>
								)}
							</div>
							<button
								type="button"
								onClick={() => onSelect(user)}
								className={styles.selectButton}
							>
								選択
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

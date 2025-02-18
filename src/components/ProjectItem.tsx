import { useEffect, useState } from "react";
import styles from "./ProjectItem.module.css";
import UserSearch from "./UserSearch";
import type { UserSearchResult } from "@/lib/firebase/users";
import { getUserInfo } from "@/lib/firebase/users";
import Link from "next/link";

type ProjectItemProps = {
	id: string;
	name: string;
	createdAt: Date;
	sharedWith?: string[];
	onUpdate: (id: string, name: string) => void;
	onShare: (id: string, userId: string) => void;
	onRemoveShare: (id: string, userId: string) => void;
	onDelete: (id: string) => void;
	userId: string;
	currentUserId: string;
};

// 新しい型を追加
type SharedUserInfo = {
	userId: string;
	email?: string;
	displayName?: string | null;
};

export default function ProjectItem({
	id,
	name,
	createdAt,
	sharedWith = [],
	onUpdate,
	onShare,
	onRemoveShare,
	onDelete,
	userId,
	currentUserId,
}: ProjectItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [editedName, setEditedName] = useState(name);
	const [sharedUsers, setSharedUsers] = useState<SharedUserInfo[]>([]);

	// 共有ユーザーの情報を取得
	useEffect(() => {
		const loadSharedUsers = async () => {
			const userInfoPromises = sharedWith.map(async (userId) => {
				const userInfo = await getUserInfo(userId);
				return {
					userId,
					email: userInfo?.email,
					displayName: userInfo?.displayName,
				};
			});
			const users = await Promise.all(userInfoPromises);
			setSharedUsers(users);
		};

		if (sharedWith.length > 0) {
			loadSharedUsers();
		} else {
			setSharedUsers([]);
		}
	}, [sharedWith]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editedName.trim() && editedName !== name) {
			onUpdate(id, editedName.trim());
		}
		setIsEditing(false);
	};

	const handleUserSelect = (user: UserSearchResult) => {
		if (user.uid === currentUserId) {
			alert("自分自身には共有できません");
			return;
		}
		if (sharedWith.includes(user.uid)) {
			alert("既に共有済みのユーザーです");
			return;
		}
		onShare(id, user.uid);
		setIsSharing(false);
	};

	const handleClick = (e: React.MouseEvent) => {
		// ボタンクリック時にリンクの遷移を防ぐ
		if (
			(e.target as HTMLElement).tagName === "BUTTON" ||
			(e.target as HTMLElement).closest("button")
		) {
			e.preventDefault();
		}
	};

	return (
		<Link href={`/planning/${id}/genre`}>
			<div className={styles.projectItem} onClick={handleClick}>
				{!isEditing ? (
					<>
						<div className={styles.projectHeader}>
							<h3 className={styles.headerTitle}>
								<div>
									<h3>{name}</h3>
									<span className={styles.projectType}>
										{userId === currentUserId ? "オーナー" : "ゲスト"}
									</span>
								</div>
							</h3>
							<div className={styles.projectActions}>
								{userId === currentUserId && (
									<>
										<button
											type="button"
											onClick={() => setIsEditing(true)}
											className={styles.editButton}
										>
											編集
										</button>
										<button
											type="button"
											onClick={() => setIsSharing(!isSharing)}
											className={styles.shareButton}
										>
											共有
										</button>
										<button
											type="button"
											onClick={() => {
												if (
													window.confirm("このプロジェクトを削除しますか？")
												) {
													onDelete(id);
												}
											}}
											className={styles.deleteButton}
										>
											削除
										</button>
									</>
								)}
							</div>
						</div>
						<p className={styles.projectDate}>
							作成日: {createdAt.toLocaleDateString()}
						</p>
						{isSharing && (
							<div className={styles.sharingSection}>
								<UserSearch onSelect={handleUserSelect} />
								{sharedUsers.length > 0 && (
									<div className={styles.sharedWith}>
										<h4>共有中のユーザー:</h4>
										<ul className={styles.sharedUserList}>
											{sharedUsers.map((user) => (
												<li
													key={`${id}-${user.userId}`}
													className={styles.sharedUserItem}
												>
													<div className={styles.userInfo}>
														<span className={styles.userEmail}>
															{user.email || "不明なユーザー"}
														</span>
														{user.displayName && (
															<span className={styles.userName}>
																{user.displayName}
															</span>
														)}
													</div>
													<button
														type="button"
														onClick={() => onRemoveShare(id, user.userId)}
														className={styles.removeShareButton}
													>
														削除
													</button>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</>
				) : (
					<form onSubmit={handleSubmit} className={styles.editForm}>
						<input
							type="text"
							value={editedName}
							onChange={(e) => setEditedName(e.target.value)}
							className={styles.editInput}
							// biome-ignore lint/a11y/noAutofocus: <explanation>
							autoFocus
						/>
						<div className={styles.editButtons}>
							<button type="submit" className={styles.saveButton}>
								保存
							</button>
							<button
								type="button"
								onClick={() => {
									setIsEditing(false);
									setEditedName(name);
								}}
								className={styles.cancelButton}
							>
								キャンセル
							</button>
						</div>
					</form>
				)}
			</div>
		</Link>
	);
}

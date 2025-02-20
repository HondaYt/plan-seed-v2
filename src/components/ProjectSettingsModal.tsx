import { useState } from "react";
import styles from "./ProjectSettingsModal.module.css";
import UserSearch from "./UserSearch";
import type { UserSearchResult } from "@/lib/firebase/users";
import type { SharedUserInfo } from "./ProjectItem";
import Image from "next/image";

interface ProjectSettingsModalProps {
	projectId: string;
	projectName: string;
	onClose: () => void;
	onUpdate: (id: string, name: string) => void;
	onShare: (id: string, userId: string) => void;
	onRemoveShare: (id: string, userId: string) => void;
	onDelete: (id: string) => void;
	sharedUsers: SharedUserInfo[];
	currentUserId: string;
}

export default function ProjectSettingsModal({
	projectId,
	projectName,
	onClose,
	onUpdate,
	onShare,
	onRemoveShare,
	onDelete,
	sharedUsers,
	currentUserId,
}: ProjectSettingsModalProps) {
	const [editedName, setEditedName] = useState(projectName);
	const [activeTab, setActiveTab] = useState<"edit" | "share">("edit");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (editedName.trim() && editedName !== projectName) {
			onUpdate(projectId, editedName.trim());
		}
		onClose();
	};

	const handleUserSelect = (user: UserSearchResult) => {
		if (user.uid === currentUserId) {
			alert("自分自身には共有できません");
			return;
		}
		if (sharedUsers.some((u) => u.userId === user.uid)) {
			alert("既に共有済みのユーザーです");
			return;
		}
		onShare(projectId, user.uid);
	};

	const handleOverlayClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleModalClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<div className={styles.overlay} onClick={handleOverlayClick}>
			<div className={styles.modal} onClick={handleModalClick}>
				<div className={styles.modalHeader}>
					<div className={styles.tabs}>
						<button
							type="button"
							className={`${styles.tab} ${activeTab === "edit" ? styles.active : ""}`}
							onClick={() => setActiveTab("edit")}
						>
							編集
						</button>
						<button
							type="button"
							className={`${styles.tab} ${activeTab === "share" ? styles.active : ""}`}
							onClick={() => setActiveTab("share")}
						>
							共有
						</button>
					</div>
					<button
						type="button"
						onClick={onClose}
						className={styles.closeButton}
					>
						<Image src="/icons/close.svg" width={16} height={16} alt="閉じる" />
					</button>
				</div>

				{activeTab === "edit" ? (
					<div className={styles.tabContent}>
						<form onSubmit={handleSubmit}>
							<div className={styles.formGroup}>
								<label htmlFor="projectName">プロジェクト名</label>
								<input
									id="projectName"
									type="text"
									value={editedName}
									onChange={(e) => setEditedName(e.target.value)}
									className={styles.input}
								/>
							</div>
							<div className={styles.buttonGroup}>
								<button type="submit" className={styles.submitButton}>
									保存
								</button>
								<button
									type="button"
									onClick={() => {
										if (window.confirm("このプロジェクトを削除しますか？")) {
											onDelete(projectId);
											onClose();
										}
									}}
									className={styles.deleteButton}
								>
									プロジェクトを削除
								</button>
							</div>
						</form>
					</div>
				) : (
					<div className={styles.tabContent}>
						<UserSearch onSelect={handleUserSelect} />
						{sharedUsers.length > 0 && (
							<div className={styles.sharedUsers}>
								<h4>共有中のユーザー:</h4>
								<ul className={styles.userList}>
									{sharedUsers.map((user) => (
										<li key={user.userId} className={styles.userItem}>
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
												onClick={() => onRemoveShare(projectId, user.userId)}
												className={styles.removeButton}
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
			</div>
		</div>
	);
}

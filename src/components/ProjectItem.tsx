import { useEffect, useState } from "react";
import styles from "./ProjectItem.module.css";
import UserSearch from "./UserSearch";
import type { UserSearchResult } from "@/lib/firebase/users";
import { getUserInfo } from "@/lib/firebase/users";
import Link from "next/link";
import Image from "next/image";
import ProjectSettingsModal from "./ProjectSettingsModal";

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

export type SharedUserInfo = {
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
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [sharedUsers, setSharedUsers] = useState<SharedUserInfo[]>([]);

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

	const handleClick = (e: React.MouseEvent) => {
		if (
			(e.target as HTMLElement).tagName === "BUTTON" ||
			(e.target as HTMLElement).closest("button")
		) {
			e.preventDefault();
		}
	};

	const handleSettingsClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsSettingsOpen(true);
	};

	return (
		<Link href={`/planning/${id}/genre`}>
			<div className={styles.projectItem} onClick={handleClick}>
				<div className={styles.projectHeader}>
					<h3 className={styles.headerTitle}>
						<div>
							<h3>{name}</h3>
							<span className={styles.projectType}>
								{userId === currentUserId ? "オーナー" : "ゲスト"}
							</span>
						</div>
					</h3>
					{userId === currentUserId && (
						<button
							type="button"
							onClick={handleSettingsClick}
							className={styles.settingsButton}
						>
							<Image src="/icons/more.svg" width={16} height={16} alt="設定" />
						</button>
					)}
				</div>
				<p className={styles.projectDate}>
					作成日: {createdAt.toLocaleDateString()}
				</p>
				{isSettingsOpen && (
					<ProjectSettingsModal
						projectId={id}
						projectName={name}
						onClose={() => setIsSettingsOpen(false)}
						onUpdate={onUpdate}
						onShare={onShare}
						onRemoveShare={onRemoveShare}
						onDelete={onDelete}
						sharedUsers={sharedUsers}
						currentUserId={currentUserId}
					/>
				)}
			</div>
		</Link>
	);
}

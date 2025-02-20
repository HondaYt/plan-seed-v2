import { useEffect, useState } from "react";
import styles from "./ProjectItem.module.css";
import UserSearch from "./UserSearch";
import type { UserSearchResult } from "@/lib/firebase/users";
import { getUserInfo } from "@/lib/firebase/users";
import Link from "next/link";
import Image from "next/image";
import ProjectSettingsModal from "./ProjectSettingsModal";
import { format } from "date-fns";
import type { Project, ProjectStatus } from "@/types/project";
import { useRouter } from "next/navigation";
import { STEPS_ORDER } from "@/constants/steps";
import { useProjectProgress } from "@/hooks/useProjectProgress";

type ProjectItemProps = {
	id: string;
	name: string;
	createdAt: Date;
	sharedWith?: string[];
	onUpdate: (id: string, name: string) => void;
	onShare: (id: string, userId: string) => void;
	onRemoveShare: (id: string, userId: string) => void;
	onDelete: (id: string) => void;
	onOpen: (project: Pick<Project, "id" | "status">) => void;
	userId: string;
	currentUserId: string;
	status?: ProjectStatus;
};

export type SharedUserInfo = {
	userId: string;
	email?: string;
	displayName?: string | null;
};

const ProjectItem: React.FC<ProjectItemProps> = ({
	id,
	name,
	createdAt,
	sharedWith = [],
	onUpdate,
	onShare,
	onRemoveShare,
	onDelete,
	onOpen,
	userId,
	currentUserId,
	status,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [sharedUsers, setSharedUsers] = useState<SharedUserInfo[]>([]);
	const router = useRouter();
	const { getNextStepWithState } = useProjectProgress(id);

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

	const handleSettingsClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsSettingsOpen(true);
	};

	const getProgressPercentage = (status: ProjectStatus | undefined) => {
		if (!status?.completedSteps) return 0;

		const totalSteps = STEPS_ORDER.length;
		console.log("Progress calculation:", {
			completed: status.completedSteps.length,
			total: totalSteps,
			percentage: Math.round((status.completedSteps.length / totalSteps) * 100),
		});

		return Math.round((status.completedSteps.length / totalSteps) * 100);
	};

	const handleProjectClick = async (e: React.MouseEvent) => {
		if (isSettingsOpen) {
			e.preventDefault();
			return;
		}

		e.preventDefault();

		const isSettingsButton = (e.target as HTMLElement).closest("button");
		if (isSettingsButton) return;

		if (!status) return;

		const { nextStep, state } = await getNextStepWithState();

		const queryParams = new URLSearchParams();
		if (state) {
			if (state.genre) queryParams.set("genre", state.genre);
			if (state.keywords.length > 0) {
				queryParams.set("keywords", state.keywords.join(","));
			}
			if (state.concept) queryParams.set("concept", state.concept);
			if (state.target) {
				if (state.target.ageMin) queryParams.set("ageMin", state.target.ageMin);
				if (state.target.ageMax) queryParams.set("ageMax", state.target.ageMax);
				if (state.target.gender) queryParams.set("gender", state.target.gender);
				if (state.target.occupation)
					queryParams.set("occupation", state.target.occupation);
				if (state.target.personality)
					queryParams.set("personality", state.target.personality);
			}
			if (state.scene) {
				if (state.scene.when) queryParams.set("when", state.scene.when);
				if (state.scene.where) queryParams.set("where", state.scene.where);
			}
			if (state.features.length > 0) {
				queryParams.set("features", state.features.join(","));
			}
			if (state.mainFeatureIndex >= 0) {
				queryParams.set("mainFeatureIndex", state.mainFeatureIndex.toString());
			}
		}

		const query = queryParams.toString();
		const url = `/planning/${id}/${nextStep}${query ? `?${query}` : ""}`;
		router.push(url);
	};

	const formatLastUpdated = (lastUpdated: Date | string | undefined) => {
		if (!lastUpdated) return "未更新";

		try {
			const date =
				typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
			return format(date, "yyyy/MM/dd HH:mm");
		} catch (error) {
			console.error("Invalid date:", lastUpdated);
			return "未更新";
		}
	};

	return (
		<>
			<Link
				href={`/planning/${id}/genre`}
				onClick={handleProjectClick}
				className={styles.projectLink}
			>
				<div className={styles.projectItem}>
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
								<Image
									src="/icons/more.svg"
									width={16}
									height={16}
									alt="設定"
								/>
							</button>
						)}
					</div>
					<p className={styles.projectDate}>
						作成日: {createdAt.toLocaleDateString()}
					</p>
					<div className={styles.progressBar}>
						<div
							className={styles.progressFill}
							style={{ width: `${getProgressPercentage(status)}%` }}
						/>
					</div>
					<span className={styles.lastUpdated}>
						最終更新: {formatLastUpdated(status?.lastUpdated)}
					</span>
				</div>
			</Link>
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
		</>
	);
};

export default ProjectItem;

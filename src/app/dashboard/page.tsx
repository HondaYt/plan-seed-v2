"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import AddProject from "@/components/AddProject";
import type { Project, ProjectStatus } from "@/types/project";
import {
	createProject,
	getUserProjects,
	updateProject,
	shareProject,
	removeProjectShare,
	softDeleteProject,
} from "@/lib/firebase/projects";
import ProjectItem from "@/components/ProjectItem";
import Image from "next/image";

export default function DashboardPage() {
	const { user, signOut } = useAuth();
	const router = useRouter();
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!user) {
			router.push("/auth");
		} else {
			loadProjects();
		}
	}, [user, router]);

	const loadProjects = async () => {
		if (!user) return;
		try {
			const userProjects = await getUserProjects(user.uid);
			setProjects(userProjects);
		} catch (error) {
			console.error("プロジェクトの読み込みに失敗しました:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddProject = async (projectName: string) => {
		if (!user) return;
		try {
			const newProject = await createProject(user.uid, projectName);
			setProjects([...projects, newProject]);
		} catch (error) {
			console.error("プロジェクトの作成に失敗しました:", error);
		}
	};

	const handleUpdateProject = async (projectId: string, newName: string) => {
		try {
			await updateProject(projectId, newName);
			setProjects(
				projects.map((project) =>
					project.id === projectId ? { ...project, name: newName } : project,
				),
			);
		} catch (error) {
			console.error("プロジェクトの更新に失敗しました:", error);
		}
	};

	const handleShareProject = async (projectId: string, userId: string) => {
		try {
			await shareProject(projectId, userId);
			await loadProjects();
		} catch (error) {
			console.error("プロジェクトの共有に失敗しました:", error);
		}
	};

	const handleRemoveShare = async (projectId: string, userId: string) => {
		try {
			await removeProjectShare(projectId, userId);
			await loadProjects();
		} catch (error) {
			console.error("プロジェクトの共有解除に失敗しました:", error);
		}
	};

	const handleDeleteProject = async (projectId: string) => {
		try {
			await softDeleteProject(projectId);
			setProjects(projects.filter((project) => project.id !== projectId));
		} catch (error) {
			console.error("プロジェクトの削除に失敗しました:", error);
		}
	};

	const handleSignOut = async () => {
		await signOut();
	};

	const handleProjectOpen = (project: Pick<Project, "id" | "status">) => {
		const currentStep = project.status.currentStep || "genre";
		router.push(`/planning/${project.id}/${currentStep}`);
	};

	if (!user) return null;

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<Image
					src={"/logo.svg"}
					height={60}
					width={300}
					alt="Plan Seed"
					className={styles.logo}
				/>
				<div className={styles.userSection}>
					<span className={styles.userName}>{user.displayName}</span>
					<button
						type="button"
						onClick={handleSignOut}
						className={styles.signOutButton}
					>
						ログアウト
					</button>
				</div>
			</header>
			<main className={styles.main}>
				<AddProject onAdd={handleAddProject} />
				{isLoading ? (
					<div className={styles.loading}>読み込み中...</div>
				) : (
					<div className={styles.projectList}>
						{projects.map((project) => {
							const projectWithStatus = {
								...project,
								status: project.status || {
									currentStep: "genre",
									completedSteps: [],
									lastUpdated: new Date(),
								},
							};
							return (
								<ProjectItem
									key={project.id}
									{...projectWithStatus}
									status={projectWithStatus.status}
									onUpdate={handleUpdateProject}
									onShare={handleShareProject}
									onRemoveShare={handleRemoveShare}
									currentUserId={user.uid}
									onDelete={handleDeleteProject}
									onOpen={handleProjectOpen}
								/>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}

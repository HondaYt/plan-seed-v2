import { db } from "./firebase";
import {
	collection,
	addDoc,
	query,
	where,
	getDocs,
	serverTimestamp,
	doc,
	updateDoc,
	arrayUnion,
	arrayRemove,
	getDoc,
} from "firebase/firestore";
import type { Project, ProjectState } from "@/types/project";

export const createProject = async (userId: string, name: string) => {
	try {
		const docRef = await addDoc(collection(db, "projects"), {
			name,
			userId,
			createdAt: serverTimestamp(),
			sharedWith: [],
			deletedAt: null,
		});
		return {
			id: docRef.id,
			name,
			userId,
			createdAt: new Date(),
			sharedWith: [],
			deletedAt: null,
		} as Project;
	} catch (error) {
		console.error("Error creating project:", error);
		throw error;
	}
};

export const getUserProjects = async (userId: string): Promise<Project[]> => {
	try {
		// 自分が所有しているプロジェクトを取得
		const ownedProjectsQuery = query(
			collection(db, "projects"),
			where("userId", "==", userId),
			where("deletedAt", "==", null),
		);

		// 自分と共有されているプロジェクトを取得
		const sharedProjectsQuery = query(
			collection(db, "projects"),
			where("sharedWith", "array-contains", userId),
			where("deletedAt", "==", null),
		);

		const [ownedSnapshot, sharedSnapshot] = await Promise.all([
			getDocs(ownedProjectsQuery),
			getDocs(sharedProjectsQuery),
		]);

		// 両方の結果を結合
		const projects = [
			...ownedSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt?.toDate() || new Date(),
				deletedAt: doc.data().deletedAt?.toDate() || null,
			})),
			...sharedSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				createdAt: doc.data().createdAt?.toDate() || new Date(),
				deletedAt: doc.data().deletedAt?.toDate() || null,
			})),
		] as Project[];

		return projects;
	} catch (error) {
		console.error("Error fetching projects:", error);
		throw error;
	}
};

export const updateProject = async (projectId: string, name: string) => {
	try {
		const projectRef = doc(db, "projects", projectId);
		await updateDoc(projectRef, {
			name,
			updatedAt: serverTimestamp(),
		});
		return {
			id: projectId,
			name,
			updatedAt: new Date(),
		};
	} catch (error) {
		console.error("Error updating project:", error);
		throw error;
	}
};

export const shareProject = async (projectId: string, userId: string) => {
	try {
		const projectRef = doc(db, "projects", projectId);
		const projectDoc = await getDoc(projectRef);

		if (!projectDoc.exists()) {
			throw new Error("Project not found");
		}

		const projectData = projectDoc.data();

		// 自分自身への共有を防ぐ
		if (projectData.userId === userId) {
			throw new Error("Cannot share with yourself");
		}

		// 既に共有済みのユーザーをチェック
		if (projectData.sharedWith?.includes(userId)) {
			throw new Error("Already shared with this user");
		}

		await updateDoc(projectRef, {
			sharedWith: arrayUnion(userId),
		});
	} catch (error) {
		console.error("Error sharing project:", error);
		throw error;
	}
};

export const removeProjectShare = async (projectId: string, userId: string) => {
	try {
		const projectRef = doc(db, "projects", projectId);
		await updateDoc(projectRef, {
			sharedWith: arrayRemove(userId),
		});
	} catch (error) {
		console.error("Error removing project share:", error);
		throw error;
	}
};

export const softDeleteProject = async (projectId: string) => {
	try {
		const projectRef = doc(db, "projects", projectId);
		await updateDoc(projectRef, {
			deletedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error("Error deleting project:", error);
		throw error;
	}
};

export const updateProjectState = async (
	projectId: string,
	state: Partial<ProjectState>,
) => {
	try {
		const projectRef = doc(db, "projects", projectId);
		await updateDoc(projectRef, {
			state: state,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error("Error updating project state:", error);
		throw error;
	}
};

export const getProjectState = async (
	projectId: string,
): Promise<ProjectState | null> => {
	try {
		const projectRef = doc(db, "projects", projectId);
		const projectDoc = await getDoc(projectRef);

		if (!projectDoc.exists()) {
			return null;
		}

		return projectDoc.data().state || null;
	} catch (error) {
		console.error("Error getting project state:", error);
		throw error;
	}
};

import { db } from "./firebase";
import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	limit,
	getDoc,
	doc,
} from "firebase/firestore";

export type UserSearchResult = {
	uid: string;
	email: string;
	displayName: string | null;
};

export const searchUsers = async (
	email: string,
): Promise<UserSearchResult[]> => {
	try {
		const usersRef = collection(db, "users");
		const q = query(
			usersRef,
			orderBy("email"),
			where("email", ">=", email),
			where("email", "<", `${email}\uf8ff`),
			limit(10),
		);

		const querySnapshot = await getDocs(q);
		const users: UserSearchResult[] = [];

		for (const doc of querySnapshot.docs) {
			const userData = doc.data();
			users.push({
				uid: doc.id,
				email: userData.email || "",
				displayName: userData.displayName || null,
			});
		}

		return users;
	} catch (error) {
		console.error("Error searching users:", error);
		throw error;
	}
};

export const getUserInfo = async (
	userId: string,
): Promise<UserSearchResult | null> => {
	try {
		const userDoc = await getDoc(doc(db, "users", userId));

		if (!userDoc.exists()) {
			return null;
		}

		const userData = userDoc.data();

		return {
			uid: userDoc.id,
			email: userData.email || "",
			displayName: userData.displayName || null,
		};
	} catch (error) {
		console.error("Error getting user info:", error);
		return null;
	}
};

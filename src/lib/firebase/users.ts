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

export interface UserSearchResult {
	uid: string;
	email: string;
	displayName?: string | null;
}

export const searchUsers = async (
	searchTerm: string,
): Promise<UserSearchResult[]> => {
	try {
		// メールアドレスの前方一致で検索
		const q = query(
			collection(db, "users"),
			orderBy("email"),
			where("email", ">=", searchTerm),
			where("email", "<=", `${searchTerm}\uf8ff`),
			limit(10), // 検索結果を制限
		);

		const querySnapshot = await getDocs(q);
		return querySnapshot.docs.map((doc) => ({
			uid: doc.id,
			email: doc.data().email,
			displayName: doc.data().displayName,
		}));
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
		return {
			uid: userDoc.id,
			email: userDoc.data().email,
			displayName: userDoc.data().displayName,
		};
	} catch (error) {
		console.error("Error fetching user info:", error);
		return null;
	}
};

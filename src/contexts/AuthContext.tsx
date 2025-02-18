"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
	Auth,
	type User,
	GoogleAuthProvider,
	signInWithPopup,
	signOut as firebaseSignOut,
	onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { db } from "@/lib/firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

type AuthContextType = {
	user: User | null;
	loading: boolean;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const signInWithGoogle = async () => {
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);

			// Firestoreにユーザーデータを保存
			await setDoc(
				doc(db, "users", result.user.uid),
				{
					email: result.user.email,
					displayName: result.user.displayName,
					photoURL: result.user.photoURL,
					updatedAt: serverTimestamp(),
				},
				{ merge: true }, // 既存のデータがある場合はマージ
			);
		} catch (error) {
			console.error("Google認証エラー:", error);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await firebaseSignOut(auth);
			window.location.href = "/";
		} catch (error) {
			console.error("ログアウトエラー:", error);
		}
	};

	return (
		<AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
			{!loading && children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);

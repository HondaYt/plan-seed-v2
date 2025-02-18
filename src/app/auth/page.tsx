"use client";

import { useAuth } from "@/contexts/AuthContext";
import styles from "./auth.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
	const { signInWithGoogle, user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	return (
		<div className={styles.container}>
			<div className={styles.authBox}>
				<h1>ログイン</h1>
				<button
					type="button"
					className={styles.googleButton}
					onClick={signInWithGoogle}
				>
					<Image src="/icons/google.svg" alt="Google" width={24} height={24} />
					Googleでログイン
				</button>
			</div>
		</div>
	);
}

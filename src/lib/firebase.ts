import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	// あなたのFirebase設定をここに記述
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

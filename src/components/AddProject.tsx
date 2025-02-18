import { useState } from "react";
import styles from "./AddProject.module.css";

interface AddProjectProps {
	onAdd: (projectName: string) => void;
}

export default function AddProject({ onAdd }: AddProjectProps) {
	const [projectName, setProjectName] = useState("");
	const [isFormVisible, setIsFormVisible] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (projectName.trim()) {
			onAdd(projectName.trim());
			setProjectName("");
			setIsFormVisible(false);
		}
	};

	return (
		<div className={styles.addProject}>
			{!isFormVisible ? (
				<button
					type="button"
					onClick={() => setIsFormVisible(true)}
					className={styles.addButton}
				>
					+ 新規プロジェクト
				</button>
			) : (
				<form onSubmit={handleSubmit} className={styles.form}>
					<input
						type="text"
						value={projectName}
						onChange={(e) => setProjectName(e.target.value)}
						placeholder="プロジェクト名"
						className={styles.input}
						// biome-ignore lint/a11y/noAutofocus: <explanation>
						autoFocus
					/>
					<div className={styles.buttons}>
						<button type="submit" className={styles.submitButton}>
							追加
						</button>
						<button
							type="button"
							onClick={() => setIsFormVisible(false)}
							className={styles.cancelButton}
						>
							キャンセル
						</button>
					</div>
				</form>
			)}
		</div>
	);
}

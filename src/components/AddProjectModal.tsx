import { useState } from "react";
import styles from "./AddProjectModal.module.css";

interface AddProjectModalProps {
	onAdd: (projectName: string) => void;
	onClose: () => void;
}

export default function AddProjectModal({
	onAdd,
	onClose,
}: AddProjectModalProps) {
	const [projectName, setProjectName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (projectName.trim()) {
			onAdd(projectName.trim());
			setProjectName("");
			onClose();
		}
	};

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<h2 className={styles.title}>新規プロジェクト</h2>
				<form onSubmit={handleSubmit}>
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
							作成
						</button>
						<button
							type="button"
							onClick={onClose}
							className={styles.cancelButton}
						>
							キャンセル
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

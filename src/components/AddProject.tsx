import { useState } from "react";
import styles from "./AddProject.module.css";
import Image from "next/image";
import AddProjectModal from "./AddProjectModal";

interface AddProjectProps {
	onAdd: (projectName: string) => void;
}

export default function AddProject({ onAdd }: AddProjectProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className={styles.addProject}>
			<button
				type="button"
				onClick={() => setIsModalOpen(true)}
				className={styles.addButton}
			>
				<Image
					src="/icons/plus.svg"
					width={16}
					height={16}
					alt=""
					aria-hidden="true"
				/>
				新規プロジェクト
			</button>
			{isModalOpen && (
				<AddProjectModal onAdd={onAdd} onClose={() => setIsModalOpen(false)} />
			)}
		</div>
	);
}

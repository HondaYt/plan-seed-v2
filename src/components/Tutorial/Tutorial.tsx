import { type ReactNode, useState } from "react";
import styles from "./Tutorial.module.css";

interface TutorialProps {
	children: ReactNode;
	steps: {
		target: string;
		content: string;
		image?: string;
	}[];
	isOpen?: boolean;
	onClose?: () => void;
	onHideForever?: () => void;
}

export function Tutorial({
	children,
	steps,
	isOpen = true,
	onClose,
	onHideForever,
}: TutorialProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isVisible, setIsVisible] = useState(() => {
		const hideTutorial = localStorage.getItem("hideTutorial");
		return hideTutorial === "true" ? false : isOpen;
	});
	const [imageVisible, setImageVisible] = useState(true);
	const [hideForever, setHideForever] = useState(false);

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setImageVisible(false);
			setTimeout(() => {
				setCurrentStep(currentStep + 1);
				setImageVisible(true);
			}, 50);
		} else {
			setIsVisible(false);
			onClose?.();
			if (hideForever) {
				onHideForever?.();
			}
		}
	};

	const handlePrev = () => {
		if (currentStep > 0) {
			setImageVisible(false);
			setTimeout(() => {
				setCurrentStep(currentStep - 1);
				setImageVisible(true);
			}, 50);
		}
	};

	const handleSkip = () => {
		setIsVisible(false);
		onClose?.();
		if (hideForever) {
			onHideForever?.();
		}
	};

	return (
		<div className={styles.container}>
			{children}
			{isVisible && (
				<div className={styles.overlay}>
					<div className={styles.tutorialContainer}>
						<div className={styles.tutorialBox}>
							<div className={styles.imageArea}>
								{steps[currentStep].image && (
									<img
										src={steps[currentStep].image}
										alt="チュートリアル説明画像"
										className={imageVisible ? styles.visible : ""}
									/>
								)}
							</div>
							<div className={styles.contentArea}>
								<div className={styles.steps}>
									{steps.map((step, index) => (
										<div
											key={step.target}
											className={`${styles.step} ${
												index === currentStep ? styles.active : ""
											}`}
										>
											{step.content}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className={styles.buttonContainer}>
							<div className={styles.leftButtons}>
								<button
									onClick={handleSkip}
									className={`${styles.button} ${styles.buttonTertiary}`}
									type="button"
								>
									スキップ
								</button>
								<label className={styles.checkboxLabel}>
									<input
										type="checkbox"
										checked={hideForever}
										onChange={(e) => setHideForever(e.target.checked)}
									/>
									次回から表示しない
								</label>
							</div>
							<div className={styles.navigationButtons}>
								<button
									onClick={handlePrev}
									className={`${styles.button} ${styles.buttonSecondary}`}
									type="button"
									disabled={currentStep === 0}
								>
									戻る
								</button>
								<button
									onClick={handleNext}
									className={`${styles.button} ${styles.buttonPrimary}`}
									type="button"
								>
									{currentStep === steps.length - 1 ? "完了" : "次へ"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

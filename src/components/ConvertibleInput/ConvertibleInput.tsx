import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.css";

interface ConvertibleInputProps {
	textValue: string;
	setTextValue: (value: string) => void;
	onButtonClick: () => void;
}

export const ConvertibleInput = ({
	textValue,
	setTextValue,

	onButtonClick,
}: ConvertibleInputProps) => {
	const textInputRef = useRef<HTMLInputElement>(null);
	const measurementSpanRef = useRef<HTMLSpanElement>(null);
	const [dynamicWidth, setDynamicWidth] = useState<number>(0);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const recalculateWidth = useCallback(() => {
		if (measurementSpanRef.current) {
			setDynamicWidth(measurementSpanRef.current.clientWidth);
		}
	}, []);

	useEffect(() => {
		recalculateWidth();
	}, [recalculateWidth]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(recalculateWidth);
		if (measurementSpanRef.current) {
			resizeObserver.observe(measurementSpanRef.current);
		}
		return () => resizeObserver.disconnect();
	}, [recalculateWidth]);

	const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.nativeEvent.isComposing) {
			setIsSubmitted(true);
		}
	};

	return (
		<div className={styles.autoResizeInputContainer}>
			{!isSubmitted ? (
				<>
					<input
						type="text"
						ref={textInputRef}
						value={textValue}
						onChange={(e) => setTextValue(e.target.value)}
						onKeyDown={handleEnterPress}
						style={{ width: `${dynamicWidth + 64}px` }}
						className={styles.autoResizeInput}
					/>
					<span ref={measurementSpanRef} className={styles.hiddenText}>
						{textValue}
					</span>
				</>
			) : (
				<button
					type="button"
					onClick={onButtonClick}
					className={`${styles.autoResizeInput} ${isSubmitted ? styles.isCompleted : null}`}
				>
					{textValue}
				</button>
			)}
		</div>
	);
};

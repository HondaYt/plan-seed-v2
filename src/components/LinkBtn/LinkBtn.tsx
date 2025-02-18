import Link from "next/link";
import styles from "./linkBtn.module.css";
import type { ReactNode } from "react";

type LinkBtnProps = {
	children: ReactNode;
	href:
		| string
		| {
				pathname: string;
				query?: { [key: string]: string };
		  };
	secondary?: boolean;
	disable?: boolean;
};

export function LinkBtn(props: LinkBtnProps) {
	return (
		<>
			<Link
				aria-disabled={props.disable}
				tabIndex={props.disable ? -1 : undefined}
				href={props.href}
				className={`
					${styles.linkBtn} 
					${props.secondary ? styles.secondary : styles.primary}
					${props.disable ? styles.disabled : undefined} 
					`}
			>
				<p>{props.children}</p>
			</Link>
		</>
	);
}

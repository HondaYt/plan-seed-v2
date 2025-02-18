import type { Metadata } from "next";
import "./globals.css";
import "ress";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
	title: {
		default: "PlanSeed",
		template: "%s | PlanSeed",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}

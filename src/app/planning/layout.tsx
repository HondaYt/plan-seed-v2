import { type ReactNode, Suspense } from "react";

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

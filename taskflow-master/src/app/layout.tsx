import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import "../styles/calendarOverrides.css";

import { AuthProvider } from "@/context/AuthContext";

const noto = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "200", "300", "500", "600", "800", "900"],
});

export const metadata: Metadata = {
  title: "TaskFlow App",
  description:
    "TaskFlow is your go to app for workflow orchestration and project management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={noto.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

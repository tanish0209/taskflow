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
  openGraph: {
    title: "TaskFlow App",
    description:
      "TaskFlow is your go to app for workflow orchestration and project management.",
    url: "https://taskflow-rho-blond.vercel.app",
    siteName: "Taskflow App",
    images: [
      {
        url: "https://taskflow-rho-blond.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Taskflow App",
      },
    ],
    type: "website",
  },
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

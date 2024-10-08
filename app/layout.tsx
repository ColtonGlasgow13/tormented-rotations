import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { ConfigureAmplifyClientSide } from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tormented Rotations",
  description:
    "Get assigned a Diablo 4 tormented boss rotation group within 10 seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}

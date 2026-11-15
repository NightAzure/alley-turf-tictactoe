import type { Metadata } from "next";
import { Balsamiq_Sans, Lilita_One } from "next/font/google";
import "./globals.css";

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const balsamiqSans = Balsamiq_Sans({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-comic",
});

export const metadata: Metadata = {
  title: "ALLEY TURF — Cats vs. Pigeons Tic-Tac-Toe",
  description:
    "A tactile indie comic zine Tic-Tac-Toe turf war between grumpy street cats and sassy city pigeons, complete with custom meow and pigeon coo audio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lilitaOne.variable} ${balsamiqSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBF4E2] text-[#18181B] selection:bg-[#F45B3C] selection:text-white">
        {children}
      </body>
    </html>
  );
}

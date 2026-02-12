import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import "./globals.css";

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nanum",
});

export const metadata: Metadata = {
  title: "귀신사주 - 김귀자 할머니의 사주풀이",
  description:
    "1990년대 경상북도 청송, 귀신사주 김귀자 할머니의 생전 사주 풀이를 바탕으로 제작된 사주 서비스",
  keywords: "사주, 귀신사주, 사주풀이, 명리학, 운세, 김귀자",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "귀신사주 - 김귀자 할머니의 사주풀이",
    description:
      "1990년대 경상북도 청송, 귀신사주 김귀자 할머니의 생전 사주 풀이를 바탕으로 제작된 사주 서비스",
    type: "website",
    locale: "ko_KR",
    url: "https://ghostsaju.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "귀신사주 - 김귀자 할머니의 사주풀이",
    description:
      "1990년대 경상북도 청송, 귀신사주 김귀자 할머니의 생전 사주 풀이를 바탕으로 제작된 사주 서비스",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${nanumMyeongjo.className} scene-locked`}
        style={{ fontFamily: "var(--font-primary)" }}
      >
        {children}
      </body>
    </html>
  );
}

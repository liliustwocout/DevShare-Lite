import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevShare Lite — Nền tảng Chia sẻ & Kết nối Cộng đồng IT",
  description: "DevShare Lite là nền tảng chia sẻ kiến thức công nghệ, hỏi đáp lập trình và kết nối developer hiện đại, hiệu năng cao.",
  keywords: ["DevShare", "developer", "coding", "tech blog", "community", "programming", "react", "django"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080c14] text-slate-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden`}
      >
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-grid-tech opacity-60" />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              backdropFilter: "blur(12px)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px -3px rgba(99, 102, 241, 0.3)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#0f172a",
              },
            },
            error: {
              iconTheme: {
                primary: "#f43f5e",
                secondary: "#0f172a",
              },
            },
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

"use client";
import Logo from "../components/Logo";
import Link from "next/link";
import { 
  FiArrowRight, 
  FiCode, 
  FiMessageSquare, 
  FiTag, 
  FiShield, 
  FiCompass, 
  FiZap,
  FiTerminal,
  FiUsers,
  FiCheckCircle
} from "react-icons/fi";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="w-full px-4 sm:px-8 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in shadow-glow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
          <span>DevShare Lite v1.0</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Nền tảng chia sẻ tri thức công nghệ cho Developers</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Nơi Developer <span className="text-gradient">Chia Sẻ Tri Thức</span> & Kết Nối Giải Pháp
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Nền tảng IT hiện đại, tốc độ cao giúp bạn viết bài bằng Markdown, trao đổi chuyên môn qua bình luận đa cấp và khám phá công nghệ mới nhất.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <span>Tham gia cộng đồng ngay</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/home"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-indigo-500/40 text-base font-semibold shadow-lg transition-all"
          >
            <FiCompass className="w-4 h-4 text-indigo-400" />
            <span>Khám phá bài viết</span>
          </Link>
        </div>

        {/* Bento Grid Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          {/* Bento Card 1 */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition-transform">
              <FiCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Soạn thảo Markdown xịn sò</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hỗ trợ đầy đủ cú pháp Markdown, code blocks, quote, bullet list và chế độ lưu bản nháp an toàn.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Thảo luận phân cấp (Nested)</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Bình luận dạng cây, phản hồi trực tiếp từng câu trả lời, chỉnh sửa và xóa bình luận tức thì.
            </p>
          </div>

          {/* Bento Card 3 */}
          <div className="p-6 rounded-3xl glass-card relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <FiTag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Hệ thống Tag thông minh</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Phân loại bài viết nhanh chóng theo các công nghệ (#React, #Django, #Nextjs, #Python) với bộ lọc thời gian thực.
            </p>
          </div>
        </div>

        {/* Tech Stack Bar */}
        <div className="mt-14 w-full py-5 px-6 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-wrap items-center justify-around gap-6 text-slate-400 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <FiZap className="w-4 h-4 text-amber-400" />
            <span>Next.js 15 App Router</span>
          </div>
          <div className="flex items-center gap-2">
            <FiTerminal className="w-4 h-4 text-emerald-400" />
            <span>Django 5.x & REST Framework</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield className="w-4 h-4 text-cyan-400" />
            <span>JWT Stateless Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-indigo-400" />
            <span>ĐH Phenikaa Project</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-slate-950/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 DevShare Lite. Tác giả: <span className="text-slate-300 font-semibold">Lê Phạm Thành Đạt</span> (MSSV: 23010541 - ĐH Phenikaa)</p>
          <div className="flex items-center gap-6">
            <Link href="/home" className="hover:text-slate-300 transition">Khám phá</Link>
            <Link href="/login" className="hover:text-slate-300 transition">Đăng nhập</Link>
            <Link href="/register" className="hover:text-slate-300 transition">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";
import Logo from "../../components/Logo";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowRight, 
  FiArrowLeft, 
  FiSmile,
  FiAlertCircle 
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const username = e.target[0].value;
    const displayName = e.target[1].value;
    const email = e.target[2].value;
    const password = e.target[3].value;

    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          display_name: displayName,
          email,
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await login(data.access, username, false);
        toast.success("Tạo tài khoản thành công! Chào mừng bạn gia nhập.");
        router.push("/home");
      } else {
        const data = await res.json();
        const msg = data.detail || Object.values(data).flat().join(" ") || "Đăng ký thất bại!";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError("Không thể kết nối tới server!");
      toast.error("Lỗi kết nối máy chủ");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition group"
        >
          <FiArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto p-8 sm:p-10 rounded-3xl glass-panel shadow-2xl relative overflow-hidden">
        {/* Glow corner ambient */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <h2 className="text-2xl font-black text-white mt-6 text-center tracking-tight">
            Tạo tài khoản mới
          </h2>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Gia nhập cộng đồng lập trình viên DevShare Lite
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-6">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên đăng nhập <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="username_123"
                required
                pattern="[a-zA-Z0-9_]+"
                minLength={3}
                maxLength={30}
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">3-30 ký tự (chữ cái, số và dấu gạch dưới)</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên hiển thị
            </label>
            <div className="relative">
              <FiSmile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="VD: Nguyễn Văn Dev"
                maxLength={100}
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Địa chỉ Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="email"
                placeholder="you@domain.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tạo mật khẩu an toàn"
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Đang tạo tài khoản..." : "Đăng ký thành viên"}</span>
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-600">
        DevShare Lite • Cộng đồng chia sẻ tri thức công nghệ
      </div>
    </div>
  );
}
"use client";
import Logo from "../../components/Logo";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";

// Hàm giải mã JWT (base64 decode payload)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
}

export default function LoginPage() {
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
    const password = e.target[1].value;

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload = parseJwt(data.access);
        const is_staff = payload.is_staff === true || payload.is_staff === "true";
        await login(data.access, username, is_staff);
        toast.success(`Chào mừng trở lại, ${username}!`);
        window.location.href = "/home";
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
        toast.error("Đăng nhập thất bại.");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ.");
      toast.error("Lỗi kết nối tới máy chủ.");
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
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <h2 className="text-2xl font-black text-white mt-6 text-center tracking-tight">
            Đăng nhập vào tài khoản
          </h2>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Tiếp tục chia sẻ và học hỏi cùng cộng đồng DevShare
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 mb-6">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Nhập username"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                required
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
            className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? "Đang xác thực..." : "Đăng nhập ngay"}</span>
            {!loading && <FiArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center py-4 text-xs text-slate-600">
        DevShare Lite • Bảo mật qua JWT Tokens
      </div>
    </div>
  );
}
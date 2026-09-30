/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import Logo from "./Logo";
import useAuth from "../hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  FiHome, 
  FiPlusSquare, 
  FiUser, 
  FiShield, 
  FiLogOut, 
  FiLogIn, 
  FiUserPlus,
  FiChevronDown 
} from "react-icons/fi";

export default function Header({ isLoggedIn: isLoggedInProp, onLogout }) {
  const { isLoggedIn, user, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdown(false);
      }
    };
    if (dropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdown]);

  const handleLogout = () => {
    setDropdown(false);
    if (onLogout) onLogout();
    else logout();
    router.push("/login");
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-3 z-50 w-full px-3 md:px-6 mb-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-2.5 rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-2xl shadow-indigo-950/30">
        {/* Left: Brand Logo */}
        <Link href={isLoggedIn ? "/home" : "/"} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
          <Logo />
        </Link>

        {/* Center: Main Navigation */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <Link
            href={isLoggedIn ? "/home" : "/"}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive("/home") || isActive("/")
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FiHome className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>

          <Link
            href="/post/create"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isActive("/post/create")
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            <FiPlusSquare className="w-4 h-4" />
            <span>Tạo bài viết</span>
          </Link>
        </div>

        {/* Right: Auth & Profile */}
        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiUserPlus className="w-4 h-4" />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}

          {isLoggedIn && user && (
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-white/10 hover:border-indigo-500/30 transition-all text-left shadow-sm group"
                onClick={() => setDropdown((v) => !v)}
                aria-expanded={dropdown}
                aria-haspopup="true"
              >
                {/* Mini Avatar in Header */}
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner ring-1 ring-white/20">
                  {user.profile?.avatar_url || user.avatar_url ? (
                    <img
                      src={
                        (user.profile?.avatar_url || user.avatar_url).startsWith("/media/")
                          ? `http://localhost:8000${user.profile?.avatar_url || user.avatar_url}`
                          : user.profile?.avatar_url || user.avatar_url
                      }
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(user.display_name || user.username || "U")[0]?.toUpperCase()}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors max-w-[120px] truncate leading-tight">
                    {user.display_name || user.username}
                  </span>
                  {user.is_staff && (
                    <span className="text-[9px] text-amber-400 font-medium tracking-wide">
                      Admin
                    </span>
                  )}
                </div>

                <FiChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdown ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </button>

              {/* Glass Dropdown Menu */}
              {dropdown && (
                <div className="absolute right-0 mt-2 w-56 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/80 z-50 animate-fade-in divide-y divide-white/5">
                  <div className="px-3 py-2">
                    <p className="text-xs text-slate-400">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-white truncate">
                      @{user.username}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
                    >
                      <FiUser className="w-4 h-4 text-indigo-400" />
                      <span>Trang cá nhân</span>
                    </Link>

                    {user.is_staff && (
                      <Link
                        href="/admin/users"
                        onClick={() => setDropdown(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition"
                      >
                        <FiShield className="w-4 h-4 text-amber-400" />
                        <span>Quản trị hệ thống</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
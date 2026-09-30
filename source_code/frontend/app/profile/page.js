/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "../../components/Header";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  FiUser, 
  FiCamera, 
  FiEdit2, 
  FiCheck, 
  FiX, 
  FiMail, 
  FiFileText, 
  FiClock, 
  FiExternalLink,
  FiEdit3,
  FiFolder
} from "react-icons/fi";

export default function ProfilePage() {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("published"); // published or drafts

  const [editingUsername, setEditingUsername] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const resUser = await fetch("http://localhost:8000/api/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resUser.ok) return;
        const userData = await resUser.json();

        const resProfile = await fetch("http://localhost:8000/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resProfile.ok) {
          const profileData = await resProfile.json();
          setUser({ ...userData, profile: profileData });
          setAvatarUrl(profileData.avatar_url || "");
        } else {
          setUser(userData);
        }

        // Bài viết đã đăng
        const resPosts = await fetch(
          `http://localhost:8000/api/posts/?author=${userData.username}&draft=false`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const postData = resPosts.ok ? await resPosts.json() : [];
        setPosts(Array.isArray(postData) ? postData : postData.results || []);

        // Bài viết nháp
        const resDrafts = await fetch(
          `http://localhost:8000/api/posts/?author=${userData.username}&draft=true`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const draftData = resDrafts.ok ? await resDrafts.json() : [];
        setDrafts(Array.isArray(draftData) ? draftData : draftData.results || []);
      } catch (err) {
        console.error("Error loading profile", err);
      }
      setLoading(false);
    };
    if (isLoggedIn) fetchData();
  }, [isLoggedIn]);

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setUploadingAvatar(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatar_url);
        toast.success("Cập nhật ảnh đại diện thành công!");
      } else {
        toast.error("Tải ảnh thất bại!");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    }
    setUploadingAvatar(false);
  };

  // Cập nhật username
  const handleUpdateUsername = async () => {
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setUsernameError("Username không được để trống");
      return;
    }
    if (trimmed === user?.username) {
      setEditingUsername(false);
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("username", trimmed);

    try {
      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setUser({ ...user, username: trimmed });
        setEditingUsername(false);
        toast.success("Cập nhật username thành công!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        const msg = errorData.username?.[0] || "Cập nhật username thất bại";
        setUsernameError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setUsernameError("Lỗi kết nối tới server");
    }
  };

  // Cập nhật display_name
  const handleUpdateDisplayName = async () => {
    const trimmed = newDisplayName.trim();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("display_name", trimmed);

    try {
      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setUser({ ...user, display_name: trimmed });
        setEditingDisplayName(false);
        toast.success("Cập nhật tên hiển thị thành công!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        const msg = errorData.display_name?.[0] || "Cập nhật thất bại";
        setDisplayNameError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setDisplayNameError("Lỗi kết nối tới server");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2">
        {/* Profile Card */}
        <div className="p-6 md:p-10 rounded-3xl glass-panel shadow-2xl relative overflow-hidden mb-8">
          {/* Subtle gradient banner decoration */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-cyan-600/20" />

          <div className="relative pt-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2.5px] shadow-2xl">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl.startsWith("/media/") ? `http://localhost:8000${avatarUrl}` : avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user ? user.username[0]?.toUpperCase() : "?"}</span>
                  )}
                </div>
              </div>

              {/* Upload trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 border border-white/20"
                title="Thay đổi ảnh đại diện"
              >
                <FiCamera className="w-4 h-4" />
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Profile Info & Inline Editors */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
              {/* Display Name Edit */}
              {editingDisplayName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="px-3 py-1.5 rounded-xl glass-input text-lg font-bold text-white max-w-[200px]"
                    placeholder="Tên hiển thị..."
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateDisplayName()}
                  />
                  <button
                    onClick={handleUpdateDisplayName}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingDisplayName(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.profile?.display_name || user?.username || "Developer"}
                  </h1>
                  {user && (
                    <button
                      onClick={() => {
                        setNewDisplayName(user?.profile?.display_name || "");
                        setEditingDisplayName(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Chỉnh sửa tên hiển thị"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
              {displayNameError && <p className="text-xs text-rose-400">{displayNameError}</p>}

              {/* Username Edit */}
              {editingUsername ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-3 py-1 rounded-xl glass-input text-xs font-mono text-indigo-300 max-w-[160px]"
                    pattern="[a-zA-Z0-9_]+"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleUpdateUsername()}
                  />
                  <button
                    onClick={handleUpdateUsername}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>@{user?.username}</span>
                  {user && (
                    <button
                      onClick={() => {
                        setNewUsername(user?.username || "");
                        setEditingUsername(true);
                      }}
                      className="text-slate-500 hover:text-indigo-400"
                      title="Chỉnh sửa username"
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              {usernameError && <p className="text-xs text-rose-400">{usernameError}</p>}

              {/* Email & Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{user?.email || "Chưa cập nhật email"}</span>
                </span>
                {user?.is_staff && (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold text-[11px]">
                    Admin
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-semibold text-[11px]">
                  Member
                </span>
              </div>
            </div>

            {/* Quick Action: New Post */}
            <Link
              href="/post/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <FiEdit3 className="w-3.5 h-3.5" />
              <span>Tạo bài viết</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="block text-xl font-extrabold text-white">{posts.length}</span>
              <span className="text-xs text-slate-400">Bài đã đăng</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="block text-xl font-extrabold text-white">{drafts.length}</span>
              <span className="text-xs text-slate-400">Bản nháp</span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="block text-xl font-extrabold text-indigo-400">
                {posts.reduce((acc, p) => acc + (p.like_count || 0), 0)}
              </span>
              <span className="text-xs text-slate-400">Lượt thích nhận được</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Published vs Drafts */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setActiveTab("published")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition ${
              activeTab === "published"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>Bài viết đã đăng</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{posts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition ${
              activeTab === "drafts"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            <FiFolder className="w-4 h-4" />
            <span>Bản nháp</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{drafts.length}</span>
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="p-6 rounded-3xl glass-card animate-pulse">
                <div className="w-1/2 h-5 bg-slate-800 rounded mb-2" />
                <div className="w-1/4 h-3 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : activeTab === "published" ? (
          /* Published Posts */
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <div className="p-10 rounded-3xl glass-panel text-center text-slate-400 text-sm">
                Bạn chưa có bài viết nào được đăng.
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl glass-card flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/post/${post.id}`}
                      className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors block truncate"
                    >
                      {post.title}
                    </Link>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <FiClock className="w-3 h-3" />
                      <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
                      <span>•</span>
                      <span>{post.like_count || 0} lượt thích</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-white/10 transition"
                      title="Chỉnh sửa bài viết"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/post/${post.id}`}
                      className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                      title="Xem bài viết"
                    >
                      <FiExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Draft Posts */
          <div className="flex flex-col gap-4">
            {drafts.length === 0 ? (
              <div className="p-10 rounded-3xl glass-panel text-center text-slate-400 text-sm">
                Bạn không có bản nháp nào đang lưu.
              </div>
            ) : (
              drafts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl glass-card flex items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/post/${post.id}`}
                      className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors block truncate"
                    >
                      {post.title}
                    </Link>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                        Nháp
                      </span>
                      <span>Cập nhật: {new Date(post.updated_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/post/${post.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition"
                    >
                      <FiEdit3 className="w-3.5 h-3.5" />
                      <span>Tiếp tục viết</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
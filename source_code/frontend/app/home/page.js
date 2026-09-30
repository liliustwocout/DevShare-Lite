/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import useAuth from "../../hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { 
  FiSearch, 
  FiPlus, 
  FiRefreshCw, 
  FiThumbsUp, 
  FiMessageSquare, 
  FiClock, 
  FiTag, 
  FiBookmark, 
  FiShare2, 
  FiTrendingUp,
  FiEdit3,
  FiFilter,
  FiCompass
} from "react-icons/fi";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";

export default function HomeFeedPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const pageSize = 10;
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // Lấy tất cả tag
    const fetchTags = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8000/api/tags/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllTags(data);
        }
      } catch (e) {
        console.error("Error fetching tags", e);
      }
    };
    fetchTags();
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    let url = `http://localhost:8000/api/posts/?draft=false&page=${page}`;
    if (search) url += `&q=${encodeURIComponent(search)}`;
    if (selectedTag) url += `&tag_id=${selectedTag}`;
    try {
      const res = await fetch(
        url,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
          setCount(data.length);
        } else {
          setPosts(data.results || []);
          setCount(data.count || 0);
        }
      } else {
        setPosts([]);
        setCount(0);
      }
    } catch (e) {
      setPosts([]);
      setCount(0);
    }
    setLoading(false);
  }, [page, search, selectedTag]);

  useEffect(() => {
    if (isMounted && !isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (!isMounted || !isLoggedIn) return;
    fetchPosts();
  }, [isMounted, isLoggedIn, router, fetchPosts]);

  const reloadPosts = () => {
    fetchPosts();
  };

  const handleLike = async (postId, liked) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const url = `http://localhost:8000/api/posts/${postId}/${liked ? "unlike" : "like"}/`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Tối ưu cập nhật trực tiếp trên UI
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              liked_by_user: !liked,
              like_count: liked ? Math.max(0, p.like_count - 1) : p.like_count + 1,
            };
          }
          return p;
        })
      );
    } catch (e) {
      reloadPosts();
    }
  };

  if (!isMounted || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400">
          <FiRefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Đang tải DevShare...</span>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <div className="min-h-screen pb-16">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-4">
        {/* Top Control Bar: Search & Actions */}
        <div className="p-4 md:p-6 rounded-3xl glass-panel mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
              }}
              className="flex-1 relative"
            >
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả, câu hỏi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-sm focus:outline-none"
              />
            </form>

            {/* Actions: Write post & Refresh */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={reloadPosts}
                disabled={loading}
                title="Làm mới bảng tin"
                className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:text-white transition disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              </button>

              <Link
                href="/post/create"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                <FiPlus className="w-4 h-4" />
                <span>Viết bài mới</span>
              </Link>
            </div>
          </div>

          {/* Quick Tag Pills Filter */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 font-medium mr-1">
                <FiFilter className="w-3.5 h-3.5 text-indigo-400" />
                Bộ lọc:
              </span>

              <button
                onClick={() => {
                  setSelectedTag("");
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                  selectedTag === ""
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5"
                }`}
              >
                Tất cả chủ đề
              </button>

              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSelectedTag(tag.id.toString());
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex-shrink-0 ${
                    selectedTag === tag.id.toString()
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30"
                      : "bg-slate-900/60 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-white/5"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column Main Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiTrendingUp className="text-indigo-400" />
                <span>Bảng tin cộng đồng</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {count} bài viết được chia sẻ
              </span>
            </div>

            {loading ? (
              /* Loading Skeletons */
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 rounded-3xl glass-card animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800" />
                      <div className="flex flex-col gap-2">
                        <div className="w-32 h-3.5 bg-slate-800 rounded" />
                        <div className="w-20 h-2.5 bg-slate-800/60 rounded" />
                      </div>
                    </div>
                    <div className="w-3/4 h-5 bg-slate-800 rounded mb-3" />
                    <div className="w-full h-12 bg-slate-800/40 rounded mb-4" />
                    <div className="flex gap-2">
                      <div className="w-14 h-6 bg-slate-800 rounded-lg" />
                      <div className="w-14 h-6 bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              /* Empty state */
              <div className="p-12 rounded-3xl glass-panel text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <FiCompass className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Chưa tìm thấy bài viết nào</h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">
                  {search || selectedTag
                    ? "Không có bài viết nào khớp với từ khóa tìm kiếm hoặc thẻ bạn đã chọn."
                    : "Cộng đồng đang chờ đón bài chia sẻ đầu tiên của bạn!"}
                </p>
                <Link
                  href="/post/create"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/30"
                >
                  Tạo bài viết ngay
                </Link>
              </div>
            ) : (
              /* Post List */
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="p-5 sm:p-6 rounded-3xl glass-card flex flex-col gap-3 group relative"
                  >
                    {/* Header info: Avatar, Author, Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] shadow-sm flex-shrink-0">
                          <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                            {post.author_avatar_url ? (
                              <img
                                src={
                                  post.author_avatar_url.startsWith("/media/")
                                    ? `http://localhost:8000${post.author_avatar_url}`
                                    : post.author_avatar_url
                                }
                                alt="avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{post.author_username?.[0]?.toUpperCase() || "?"}</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors">
                            {post.author_display_name || post.author_username}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <FiClock className="w-3 h-3" />
                            <span>{new Date(post.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}</span>
                          </div>
                        </div>
                      </div>

                      {post.is_draft && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                          Bản nháp
                        </span>
                      )}
                    </div>

                    {/* Post Title */}
                    <Link
                      href={`/post/${post.id}`}
                      className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug"
                    >
                      {post.title}
                    </Link>

                    {/* Excerpt */}
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTag(tag.id.toString());
                              setPage(1);
                            }}
                            className="cursor-pointer px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-medium transition"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/5 text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        {/* Like Button */}
                        <button
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            post.liked_by_user
                              ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-glow-sm"
                              : "bg-slate-900/60 hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5"
                          }`}
                          onClick={() => handleLike(post.id, post.liked_by_user)}
                          title={post.liked_by_user ? "Bỏ thích" : "Thích bài viết"}
                        >
                          {post.liked_by_user ? (
                            <FaThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <FaRegThumbsUp className="w-3.5 h-3.5" />
                          )}
                          <span>{post.like_count || 0}</span>
                        </button>

                        {/* Comment Link */}
                        <Link
                          href={`/post/${post.id}#comments`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5 transition"
                        >
                          <FiMessageSquare className="w-3.5 h-3.5" />
                          <span>Thảo luận</span>
                        </Link>
                      </div>

                      <Link
                        href={`/post/${post.id}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        Đọc toàn bộ →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {count > pageSize && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  ← Trang trước
                </button>
                <div className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold">
                  {page} / {totalPages}
                </div>
                <button
                  disabled={page * pageSize >= count}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Trang sau →
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* User Quick Info Card */}
            {user && (
              <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-lg">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-base font-bold overflow-hidden">
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
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white truncate max-w-[160px]">
                      {user.display_name || user.username}
                    </h4>
                    <p className="text-xs text-slate-400">@{user.username}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <Link
                    href="/post/create"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition shadow-md shadow-indigo-600/20"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>Viết bài mới</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-sm font-medium border border-white/10 transition"
                  >
                    <span>Xem hồ sơ của tôi</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Popular Topics Cloud */}
            <div className="p-6 rounded-3xl glass-panel">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <FiTag className="text-indigo-400" />
                <span>Chủ đề nổi bật</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setSelectedTag(tag.id.toString());
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      selectedTag === tag.id.toString()
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-900/60 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-300 border border-white/5"
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="p-6 rounded-3xl glass-panel text-xs text-slate-400 flex flex-col gap-3">
              <h4 className="font-bold text-white text-sm">💡 Quy tắc DevShare Lite</h4>
              <p>• Tôn trọng đồng nghiệp và chia sẻ kiến thức hữu ích.</p>
              <p>• Dùng Markdown để định dạng mã nguồn rõ ràng.</p>
              <p>• Gắn đúng tag công nghệ để bài viết dễ tiếp cận người đọc.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
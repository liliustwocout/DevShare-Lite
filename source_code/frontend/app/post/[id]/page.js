/* eslint-disable @next/next/no-img-element */
"use client";
import Header from "../../../components/Header";
import useAuth from "../../../hooks/useAuth";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { 
  FiClock, 
  FiShare2, 
  FiEdit, 
  FiTrash2, 
  FiArrowLeft, 
  FiMessageSquare, 
  FiCornerDownRight, 
  FiSend,
  FiCheck,
  FiX
} from "react-icons/fi";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";

export default function PostDetailPage() {
  const { isLoggedIn, logout, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [replyTo, setReplyTo] = useState(null); // id comment đang trả lời
  const [replyToAuthor, setReplyToAuthor] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const editingInputRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const res = await fetch(
          `http://localhost:8000/api/posts/${postId}/`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }
      } catch (err) {
        console.error("Error fetching post", err);
      }
      setLoading(false);
    };
    if (postId) fetchPost();
  }, [postId]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setCommentLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(
        `http://localhost:8000/api/comments/?post=${postId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments", err);
    }
    setCommentLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Gửi bình luận mới hoặc reply
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setCommentLoading(true);
    setCommentError("");
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      setCommentLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/comments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post: postId,
          content: commentContent,
          parent: replyTo || null,
        }),
      });

      if (res.ok) {
        setCommentContent("");
        setReplyTo(null);
        setReplyToAuthor("");
        toast.success("Đã đăng bình luận thành công!");
        fetchComments();
      } else {
        const error = await res.json();
        const msg = error && typeof error === "object" ? JSON.stringify(error) : String(error);
        setCommentError(msg);
        toast.error("Gửi bình luận thất bại.");
      }
    } catch (err) {
      setCommentError("Không thể kết nối máy chủ");
    }
    setCommentLoading(false);
  };

  // Hàm gửi chỉnh sửa bình luận
  const handleEditComment = async (commentId) => {
    if (!editingContent.trim()) return;
    setCommentLoading(true);
    setCommentError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${commentId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: editingContent }),
      });
      if (res.ok) {
        setEditingCommentId(null);
        setEditingContent("");
        toast.success("Cập nhật bình luận thành công!");
        fetchComments();
      } else {
        const error = await res.json();
        setCommentError(error && typeof error === "object" ? JSON.stringify(error) : String(error));
      }
    } catch (err) {
      toast.error("Không thể lưu bình luận");
    }
    setCommentLoading(false);
  };

  // Hàm xóa bình luận
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    setCommentLoading(true);
    setCommentError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${commentId}/`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        toast.success("Đã xóa bình luận!");
        fetchComments();
      } else {
        toast.error("Không thể xóa bình luận.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối.");
    }
    setCommentLoading(false);
  };

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token || !post) {
      toast.error("Vui lòng đăng nhập để thích bài viết.");
      return;
    }
    const liked = post.liked_by_user;
    const url = `http://localhost:8000/api/posts/${postId}/${liked ? "unlike" : "like"}/`;
    try {
      await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost((prev) => ({
        ...prev,
        liked_by_user: !liked,
        like_count: liked ? Math.max(0, prev.like_count - 1) : prev.like_count + 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Đã sao chép liên kết bài viết!");
  };

  const handleEditPost = () => {
    router.push(`/post/${postId}/edit`);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để xóa bài viết.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Xóa bài viết thành công!");
        router.push("/home");
      } else if (res.status === 403) {
        toast.error("Bạn không có quyền xóa bài viết này.");
      } else {
        toast.error("Xóa bài viết thất bại!");
      }
    } catch (err) {
      toast.error("Không thể kết nối tới server!");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2">
        {/* Back Link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại Bảng tin</span>
        </Link>

        {loading ? (
          <div className="p-8 rounded-3xl glass-card animate-pulse flex flex-col gap-4">
            <div className="w-3/4 h-8 bg-slate-800 rounded-lg" />
            <div className="w-1/3 h-4 bg-slate-800/60 rounded" />
            <div className="w-full h-40 bg-slate-800/40 rounded-xl mt-4" />
          </div>
        ) : post ? (
          <article className="flex flex-col gap-6">
            {/* Main Post Card */}
            <div className="p-6 md:p-10 rounded-3xl glass-panel shadow-2xl">
              {/* Tags and Draft Pill */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.is_draft && (
                  <span className="px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    Bản nháp
                  </span>
                )}
                {post.tags &&
                  post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium"
                    >
                      #{tag.name}
                    </span>
                  ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author & Action Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] shadow-md flex-shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-base font-bold overflow-hidden">
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
                    <h3 className="text-base font-bold text-slate-100">
                      {post.author_display_name || post.author_username}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Post Actions: Like, Share, Edit/Delete */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      post.liked_by_user
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10"
                    }`}
                  >
                    {post.liked_by_user ? (
                      <FaThumbsUp className="w-4 h-4 text-white" />
                    ) : (
                      <FaRegThumbsUp className="w-4 h-4 text-indigo-400" />
                    )}
                    <span>{post.like_count || 0}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    title="Sao chép link bài viết"
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 hover:text-white transition"
                  >
                    <FiShare2 className="w-4 h-4" />
                  </button>

                  {/* Author or Admin controls */}
                  {isLoggedIn &&
                    (user?.username === post.author_username || user?.is_staff) && (
                      <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                        <button
                          onClick={handleEditPost}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20 transition"
                        >
                          <FiEdit className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                </div>
              </div>

              {/* Post Content (Formatted with ReactMarkdown) */}
              <div className="prose-dark font-sans leading-relaxed text-slate-200">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* Comments Discussion Section */}
            <section id="comments" className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiMessageSquare className="text-indigo-400" />
                  <span>Thảo luận ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>
                </h3>
              </div>

              {/* New Comment Box */}
              <form onSubmit={handleCommentSubmit} className="p-5 rounded-3xl glass-panel mb-8">
                {replyTo && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-3">
                    <span className="flex items-center gap-1.5">
                      <FiCornerDownRight className="w-4 h-4 text-indigo-400" />
                      Đang trả lời <b>{replyToAuthor ? `@${replyToAuthor}` : `#${replyTo}`}</b>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyToAuthor("");
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <textarea
                  placeholder={
                    replyTo
                      ? `Viết câu trả lời cho @${replyToAuthor || "bình luận"}...`
                      : "Viết bình luận, ý kiến hoặc câu hỏi của bạn..."
                  }
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={commentLoading}
                  className="w-full p-4 rounded-2xl glass-input text-sm resize-none focus:outline-none mb-3"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Gợi ý: Tôn trọng người đọc và chia sẻ tích cực
                  </span>
                  <button
                    type="submit"
                    disabled={commentLoading || !commentContent.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <FiSend className="w-3.5 h-3.5" />
                    <span>{commentLoading ? "Đang gửi..." : replyTo ? "Gửi phản hồi" : "Bình luận"}</span>
                  </button>
                </div>
              </form>

              {commentError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {commentError}
                </div>
              )}

              {/* Comments Tree */}
              <div className="flex flex-col gap-4">
                {comments.length === 0 ? (
                  <div className="p-8 rounded-3xl glass-card text-center text-slate-400 text-sm">
                    Chưa có bình luận nào. Hãy là người đầu tiên tham gia thảo luận!
                  </div>
                ) : (
                  comments
                    .filter((c) => !c.parent)
                    .map((c) => (
                      <div key={c.id} className="p-5 rounded-3xl glass-card flex flex-col gap-3">
                        {/* Parent Comment */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] flex-shrink-0">
                              <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                {c.author_avatar_url ? (
                                  <img
                                    src={
                                      c.author_avatar_url.startsWith("/media/")
                                        ? `http://localhost:8000${c.author_avatar_url}`
                                        : c.author_avatar_url
                                    }
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{c.author_username?.[0]?.toUpperCase() || "?"}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-200">
                                {c.author_display_name || c.author_username}
                              </span>
                              <span className="text-xs text-slate-500 ml-2">
                                {new Date(c.created_at).toLocaleDateString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                })}
                                {c.updated_at && c.updated_at !== c.created_at && " (đã sửa)"}
                              </span>
                            </div>
                          </div>

                          {/* Options for comment author */}
                          {user && (user.username === c.author_username || user.is_staff) && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingContent(c.content);
                                }}
                                className="text-xs text-slate-400 hover:text-indigo-400 p-1"
                                title="Chỉnh sửa"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-xs text-slate-400 hover:text-rose-400 p-1"
                                title="Xóa"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Comment Content / Edit Mode */}
                        {editingCommentId === c.id ? (
                          <div className="flex flex-col gap-2 mt-1">
                            <textarea
                              ref={editingInputRef}
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              rows={2}
                              className="w-full p-3 rounded-xl glass-input text-sm resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(c.id)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditingContent("");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-300 whitespace-pre-wrap pl-11">
                            {c.content}
                          </div>
                        )}

                        {/* Reply trigger button */}
                        <div className="pl-11 pt-1">
                          <button
                            onClick={() => {
                              setReplyTo(c.id);
                              setReplyToAuthor(c.author_display_name || c.author_username);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            <FiCornerDownRight className="w-3.5 h-3.5" />
                            <span>Trả lời</span>
                          </button>
                        </div>

                        {/* Nested Replies */}
                        {c.replies && c.replies.length > 0 && (
                          <div className="ml-6 sm:ml-10 mt-3 pl-4 border-l-2 border-indigo-500/20 flex flex-col gap-3">
                            {c.replies.map((r) => (
                              <div
                                key={r.id}
                                className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col gap-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 p-[1px] flex-shrink-0">
                                      <div className="w-full h-full rounded-[7px] bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                                        {r.author_avatar_url ? (
                                          <img
                                            src={
                                              r.author_avatar_url.startsWith("/media/")
                                                ? `http://localhost:8000${r.author_avatar_url}`
                                                : r.author_avatar_url
                                            }
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <span>{r.author_username?.[0]?.toUpperCase() || "?"}</span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-200">
                                      {r.author_display_name || r.author_username}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      {new Date(r.created_at).toLocaleDateString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>

                                  {user && (user.username === r.author_username || user.is_staff) && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(r.id);
                                          setEditingContent(r.content);
                                        }}
                                        className="text-xs text-slate-400 hover:text-indigo-400"
                                      >
                                        <FiEdit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(r.id)}
                                        className="text-xs text-slate-400 hover:text-rose-400"
                                      >
                                        <FiTrash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {editingCommentId === r.id ? (
                                  <div className="flex flex-col gap-2">
                                    <textarea
                                      ref={editingInputRef}
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      rows={2}
                                      className="w-full p-2.5 rounded-xl glass-input text-xs resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditComment(r.id)}
                                        className="px-2.5 py-1 rounded bg-indigo-600 text-white text-xs"
                                      >
                                        Lưu
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(null);
                                          setEditingContent("");
                                        }}
                                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-300 whitespace-pre-wrap pl-8">
                                    {r.content}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </section>
          </article>
        ) : (
          <div className="p-12 rounded-3xl glass-panel text-center text-slate-400">
            Không tìm thấy bài viết hoặc bài viết đã bị xóa.
          </div>
        )}
      </main>
    </div>
  );
}
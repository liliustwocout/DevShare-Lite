"use client";
import Header from "../../../../components/Header";
import useAuth from "../../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { 
  FiEdit3, 
  FiEye, 
  FiPlus, 
  FiX, 
  FiArrowLeft,
  FiCode,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiCheckCircle,
  FiRefreshCw
} from "react-icons/fi";

export default function EditPostPage() {
  const { isLoggedIn, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const postId = params?.id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("write");

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const res = await fetch(`http://localhost:8000/api/posts/${postId}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content);
          setIsDraft(data.is_draft);
          setTags(data.tags || []);
        } else {
          setError("Không tìm thấy bài viết hoặc bạn không có quyền chỉnh sửa.");
        }
      } catch (err) {
        setError("Lỗi kết nối tới máy chủ.");
      }
      setLoading(false);
    };

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
      } catch (err) {
        console.error(err);
      }
    };

    if (postId) {
      fetchPost();
      fetchTags();
    }
  }, [postId]);

  const handleAddTag = (e) => {
    e?.preventDefault();
    const name = tagInput.trim();
    if (!name) return;
    const exist = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (exist) {
      if (!tags.some((t) => t.id === exist.id)) setTags([...tags, exist]);
    } else {
      setTags([...tags, { id: null, name }]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (idOrName) => {
    setTags(tags.filter((t) => (t.id ? t.id !== idOrName : t.name !== idOrName)));
  };

  const insertMarkdown = (before, after = "") => {
    const textarea = document.getElementById("edit-content-editor");
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selected = previousText.substring(start, end);
    const replacement = before + (selected || "văn bản") + after;
    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected || "văn bản").length);
    }, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Bạn cần đăng nhập lại để chỉnh sửa bài viết.");
      setSaving(false);
      return;
    }

    try {
      let tagIds = [];
      for (const tag of tags) {
        if (tag.id) {
          tagIds.push(tag.id);
        } else {
          const res = await fetch("http://localhost:8000/api/tags/", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: tag.name }),
          });
          if (res.ok) {
            const data = await res.json();
            tagIds.push(data.id);
          }
        }
      }

      const res = await fetch(`http://localhost:8000/api/posts/${postId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          content,
          is_draft: isDraft,
          tag_ids: tagIds,
        }),
      });

      if (res.status === 401) {
        setError("Phiên đăng nhập đã hết hạn.");
        toast.error("Phiên đăng nhập đã hết hạn.");
        setSaving(false);
        return;
      }

      if (res.ok) {
        toast.success("Cập nhật bài viết thành công!");
        router.push(`/post/${postId}`);
      } else {
        setError("Cập nhật bài viết thất bại!");
        toast.error("Cập nhật bài viết thất bại!");
      }
    } catch (err) {
      setError("Không thể kết nối tới server!");
      toast.error("Lỗi kết nối máy chủ");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2">
        <Link
          href={`/post/${postId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Hủy và quay lại bài viết</span>
        </Link>

        {loading ? (
          <div className="p-8 rounded-3xl glass-card animate-pulse flex flex-col gap-4">
            <div className="w-1/2 h-8 bg-slate-800 rounded" />
            <div className="w-full h-40 bg-slate-800/40 rounded-xl" />
          </div>
        ) : (
          <div className="p-6 md:p-10 rounded-3xl glass-panel shadow-2xl">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <FiEdit3 className="text-indigo-400" />
                  <span>Chỉnh sửa bài viết</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Cập nhật tiêu đề, nội dung và thẻ phân loại.</p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === "write"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FiEdit3 className="w-3.5 h-3.5" />
                  <span>Soạn thảo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === "preview"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FiEye className="w-3.5 h-3.5" />
                  <span>Xem trước</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  placeholder="Tiêu đề bài viết"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl glass-input text-base font-semibold focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Thẻ phân loại
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Thêm tag mới..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition flex items-center gap-1.5"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>Thêm tag</span>
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag.id || tag.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                      >
                        #{tag.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag.id || tag.name)}
                          className="text-slate-400 hover:text-rose-400 transition"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Nội dung bài viết (Markdown)
                  </label>

                  {activeTab === "write" && (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        title="Chữ đậm"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiBold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("*", "*")}
                        title="Chữ nghiêng"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiItalic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("`", "`")}
                        title="Mã nội dòng"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n```javascript\n", "\n```\n")}
                        title="Khối mã nguồn"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg text-[10px] font-mono font-bold"
                      >
                        {"{ }"}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("[", "](https://)")}
                        title="Liên kết"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("\n- ")}
                        title="Danh sách"
                        className="p-1.5 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <FiList className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {activeTab === "write" ? (
                  <textarea
                    id="edit-content-editor"
                    required
                    rows={14}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-5 rounded-2xl glass-input text-sm leading-relaxed font-mono focus:outline-none resize-y min-h-[320px]"
                  />
                ) : (
                  <div className="w-full p-6 rounded-2xl glass-panel min-h-[320px] prose-dark">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Draft toggle */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                <input
                  type="checkbox"
                  id="editIsDraft"
                  checked={isDraft}
                  onChange={(e) => setIsDraft(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-white/10"
                />
                <label htmlFor="editIsDraft" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Lưu ở trạng thái nháp
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`/post/${postId}`}
                  className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-xs border border-white/10 transition"
                >
                  Hủy
                </Link>

                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
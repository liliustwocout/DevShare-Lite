"use client";
import Header from "../../../components/Header";
import useAuth from "../../../hooks/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { 
  FiEdit3, 
  FiEye, 
  FiTag, 
  FiPlus, 
  FiX, 
  FiCheckCircle, 
  FiFileText,
  FiCode,
  FiBold,
  FiItalic,
  FiList,
  FiLink,
  FiArrowLeft
} from "react-icons/fi";
import Link from "next/link";

export default function CreatePostPage() {
  const { isLoggedIn, logout } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("write"); // write or preview
  const router = useRouter();

  useEffect(() => {
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
    if (isLoggedIn) fetchTags();
  }, [isLoggedIn]);

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
    const textarea = document.getElementById("content-editor");
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

  const handleSubmit = async (e, draftMode) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("Bạn cần đăng nhập lại để tạo bài viết.");
      setLoading(false);
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

      const res = await fetch("http://localhost:8000/api/posts/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          content,
          is_draft: draftMode !== undefined ? draftMode : isDraft,
          tag_ids: tagIds,
        }),
      });

      if (res.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      if (res.ok) {
        const post = await res.json();
        toast.success(draftMode ? "Đã lưu bản nháp!" : "Xuất bản bài viết thành công!");
        router.push(`/post/${post.id}`);
      } else {
        const data = await res.json();
        const errMessage = data?.detail || Object.values(data).flat().join(" ") || "Tạo bài viết thất bại!";
        setError(errMessage);
        toast.error(errMessage);
      }
    } catch (err) {
      setError("Không thể kết nối tới server!");
      toast.error("Lỗi kết nối máy chủ");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-2">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors mb-6 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại Bảng tin</span>
        </Link>

        <div className="p-6 md:p-10 rounded-3xl glass-panel shadow-2xl">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <FiFileText className="text-indigo-400" />
                <span>Soạn thảo bài viết mới</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Chia sẻ giải pháp, bài học hoặc câu hỏi kỹ thuật với cộng đồng IT.
              </p>
            </div>

            {/* View Mode Switcher */}
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

          <form onSubmit={(e) => handleSubmit(e, isDraft)} className="flex flex-col gap-6">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tiêu đề bài viết
              </label>
              <input
                type="text"
                placeholder="VD: Hướng dẫn tối ưu hóa hiệu năng ứng dụng React 19 & Next.js 15..."
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl glass-input text-base font-semibold focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Tag Selection & Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Gắn thẻ phân loại (Tags)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên tag (VD: python, react, devops) và bấm Thêm..."
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

              {/* Tag Pills Selected */}
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

            {/* Content Field: Editor or Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nội dung bài viết (Markdown)
                </label>

                {activeTab === "write" && (
                  /* Markdown Toolbar */
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
                      title="Liên kết URL"
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
                  id="content-editor"
                  placeholder="Chia sẻ kiến thức, kinh nghiệm, chèn code hoặc đặt câu hỏi... Hỗ trợ Markdown đầy đủ."
                  required
                  rows={14}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-5 rounded-2xl glass-input text-sm leading-relaxed font-mono focus:outline-none resize-y min-h-[320px]"
                />
              ) : (
                <div className="w-full p-6 rounded-2xl glass-panel min-h-[320px] prose-dark">
                  {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-500 italic">Chưa có nội dung để xem trước...</p>
                  )}
                </div>
              )}
            </div>

            {/* Save as Draft Option */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <input
                type="checkbox"
                id="isDraft"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-white/10"
              />
              <label htmlFor="isDraft" className="text-xs text-slate-300 font-medium cursor-pointer">
                Lưu ở trạng thái nháp (chỉ mình bạn có thể nhìn thấy trong trang cá nhân)
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Submission Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || !title.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition"
              >
                Lưu vào bản nháp
              </button>

              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : isDraft ? "Lưu bản nháp" : "Xuất bản bài viết"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
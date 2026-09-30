"use client";
import { useEffect, useState, useCallback } from "react";
import useAuth from "../../../hooks/useAuth";
import Header from "../../../components/Header";
import toast from "react-hot-toast";
import { 
  FiShield, 
  FiUserPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiX, 
  FiLock, 
  FiMail, 
  FiUser,
  FiAlertTriangle
} from "react-icons/fi";

export default function AdminUsersPage() {
  const { isLoggedIn, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    is_staff: false,
    is_superuser: false,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch("http://localhost:8000/api/admin/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn.");
      }
    } catch (err) {
      setError("Không thể kết nối tới máy chủ.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/api/admin/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreate(false);
        setForm({ username: "", email: "", password: "", is_staff: false, is_superuser: false });
        toast.success("Tạo người dùng mới thành công!");
        fetchUsers();
      } else {
        const data = await res.json();
        const msg = data.detail || Object.values(data).flat().join(" ") || "Tạo user thất bại!";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError("Không thể kết nối tới server!");
    }
  };

  const handleEdit = (u) => {
    setShowEdit(u.id);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      is_staff: u.is_staff,
      is_superuser: u.is_superuser,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${showEdit}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowEdit(null);
        setForm({ username: "", email: "", password: "", is_staff: false, is_superuser: false });
        toast.success("Cập nhật người dùng thành công!");
        fetchUsers();
      } else {
        const data = await res.json();
        const msg = data.detail || Object.values(data).flat().join(" ") || "Cập nhật user thất bại!";
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError("Không thể kết nối tới server!");
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa tài khoản @${username}?`)) return;
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Đã xóa người dùng thành công!");
        fetchUsers();
      } else {
        toast.error("Xóa user thất bại!");
      }
    } catch (err) {
      toast.error("Không thể kết nối tới server!");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-8 rounded-3xl glass-panel text-center max-w-md">
          <FiAlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-sm text-slate-400">
            Bạn cần đăng nhập với tài khoản có quyền Quản trị viên để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pb-20">
      <Header isLoggedIn={isLoggedIn} onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-2">
        {/* Header Title & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <FiShield className="text-amber-400" />
              <span>Quản trị người dùng</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Quản lý tài khoản, phân quyền quản trị viên và thành viên trên hệ thống.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <FiUserPlus className="w-4 h-4" />
            <span>Thêm tài khoản mới</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-3xl glass-card">
            <span className="text-xs text-slate-400 font-medium">Tổng số người dùng</span>
            <span className="block text-2xl font-black text-white mt-1">{users.length}</span>
          </div>
          <div className="p-5 rounded-3xl glass-card">
            <span className="text-xs text-slate-400 font-medium">Quản trị viên (Staff)</span>
            <span className="block text-2xl font-black text-amber-400 mt-1">
              {users.filter((u) => u.is_staff).length}
            </span>
          </div>
          <div className="p-5 rounded-3xl glass-card">
            <span className="text-xs text-slate-400 font-medium">Superusers</span>
            <span className="block text-2xl font-black text-purple-400 mt-1">
              {users.filter((u) => u.is_superuser).length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl glass-panel mb-6 flex items-center gap-3">
          <FiSearch className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo username hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none"
          />
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-3xl glass-panel shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Người dùng</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Vai trò</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Không tìm thấy người dùng nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">#{u.id}</td>
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {u.username[0]?.toUpperCase()}
                        </div>
                        <span>@{u.username}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">{u.email || "—"}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {u.is_superuser && (
                            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-bold">
                              Superuser
                            </span>
                          )}
                          {u.is_staff && (
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-bold">
                              Staff
                            </span>
                          )}
                          {!u.is_staff && !u.is_superuser && (
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-medium">
                              Member
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition"
                            title="Xóa user"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Create or Edit User */}
        {(showCreate || showEdit) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel shadow-2xl relative animate-slide-up">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setShowEdit(null);
                }}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              >
                <FiX className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white mb-2">
                {showCreate ? "Tạo người dùng mới" : `Chỉnh sửa: @${form.username}`}
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {showCreate
                  ? "Điền thông tin và cấp quyền cho tài khoản mới."
                  : "Cập nhật email, mật khẩu hoặc quyền hạn tài khoản."}
              </p>

              <form onSubmit={showCreate ? handleCreate : handleUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên đăng nhập
                  </label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleInput}
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInput}
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mật khẩu {showEdit && "(để trống nếu không đổi)"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInput}
                    required={showCreate}
                    placeholder={showEdit ? "••••••••" : "Mật khẩu cho tài khoản"}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                {/* Role Toggles */}
                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/60 border border-white/5 mt-1">
                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_staff"
                      checked={form.is_staff}
                      onChange={handleInput}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-white/10"
                    />
                    <span>Quyền Quản trị viên (Staff Admin)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_superuser"
                      checked={form.is_superuser}
                      onChange={handleInput}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-white/10"
                    />
                    <span>Quyền Tối cao (Superuser)</span>
                  </label>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setShowEdit(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    {showCreate ? "Tạo người dùng" : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
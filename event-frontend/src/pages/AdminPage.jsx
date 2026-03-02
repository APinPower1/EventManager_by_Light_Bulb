import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const ROLE_COLORS = {
  admin: "bg-red-900/40 text-red-400",
  organizer: "bg-amber-900/40 text-amber-400",
  user: "bg-zinc-800 text-zinc-400",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("organizer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  if (role !== "admin") {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-zinc-500 text-sm mb-4">This page is only accessible to admins.</p>
        <button
          onClick={() => navigate("/events")}
          className="bg-amber-400 text-zinc-950 font-semibold px-6 py-2 rounded hover:bg-amber-300 transition-colors"
        >
          Back to Events
        </button>
      </div>
    );
  }

  async function fetchUsers() {
    try {
      const cleanToken = token.replace(/^"|"$/g, "");
      const res = await api.get(`/auth/users?token=${cleanToken}`);
      setUsers(res.data);
    } catch {
      // silently fail
    } finally {
      setUsersLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAssign(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const cleanToken = token.replace(/^"|"$/g, "");
      const res = await api.put(`/auth/assign-role?token=${cleanToken}`, {
        email,
        role: selectedRole,
      });
      setMessage({ type: "success", text: res.data.message });
      setEmail("");
      fetchUsers();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to assign role",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleUpdate(user) {
    setEditLoading(true);
    try {
      const cleanToken = token.replace(/^"|"$/g, "");
      await api.put(`/auth/assign-role?token=${cleanToken}`, {
        email: user.email,
        role: editingRole,
      });
      setEditingId(null);
      fetchUsers();
    } catch {
      // silently fail
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
      <p className="text-zinc-500 text-sm mb-8">Manage user roles</p>

      {/* Assign Role Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
        <h2 className="text-base font-semibold mb-4">Assign Role to User</h2>

        {message && (
          <div className={`text-sm px-3 py-2 rounded mb-4 ${
            message.type === "success"
              ? "bg-green-900/30 border border-green-800 text-green-400"
              : "bg-red-900/30 border border-red-800 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">User Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            >
              <option value="organizer">Organizer — can create & manage own events</option>
              <option value="user">User — can only register for events</option>
              <option value="admin">Admin — full access</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 text-zinc-950 font-semibold py-2 rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
          >
            {loading ? "Assigning..." : "Assign Role"}
          </button>
        </form>
      </div>

      {/* All Users List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-semibold">All Users</h2>
          <span className="text-xs text-zinc-500">{users.length} registered</span>
        </div>

        {usersLoading ? (
          <div className="px-4 py-6 text-center text-zinc-500 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="px-4 py-6 text-center text-zinc-500 text-sm">No users found</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {users.map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-100 font-medium truncate">{u.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                </div>

                {editingId === u.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={editingRole}
                      onChange={(e) => setEditingRole(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="user">user</option>
                      <option value="organizer">organizer</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => handleRoleUpdate(u)}
                      disabled={editLoading}
                      className="text-xs bg-amber-400 text-zinc-950 font-semibold px-3 py-1 rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
                    >
                      {editLoading ? "..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                      {u.role}
                    </span>
                    <button
                      onClick={() => { setEditingId(u.id); setEditingRole(u.role); }}
                      className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Reference */}
      <div className="space-y-2">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Role Reference</p>
        {[
          { role: "admin", color: "text-red-400", desc: "Full access — edit/delete any event, assign roles" },
          { role: "organizer", color: "text-amber-400", desc: "Can create events and manage their own" },
          { role: "user", color: "text-zinc-400", desc: "Can browse and register for events only" },
        ].map((r) => (
          <div key={r.role} className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded p-3">
            <span className={`text-xs font-bold uppercase ${r.color} w-20 shrink-0`}>{r.role}</span>
            <span className="text-zinc-400 text-xs">{r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
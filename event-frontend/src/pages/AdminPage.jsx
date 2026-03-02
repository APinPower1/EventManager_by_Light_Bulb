import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("organizer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }

  // Redirect non-admins
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
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to assign role",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
      <p className="text-zinc-500 text-sm mb-8">Manage user roles</p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-base font-semibold mb-4">Assign Role to User</h2>

        {message && (
          <div
            className={`text-sm px-3 py-2 rounded mb-4 ${
              message.type === "success"
                ? "bg-green-900/30 border border-green-800 text-green-400"
                : "bg-red-900/30 border border-red-800 text-red-400"
            }`}
          >
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

      {/* Role reference */}
      <div className="mt-6 space-y-2">
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

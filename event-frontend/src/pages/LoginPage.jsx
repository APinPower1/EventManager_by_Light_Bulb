import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-zinc-500 text-sm mb-6">Log in to register for events</p>

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 text-zinc-950 font-semibold py-2 rounded hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-4">
        No account?{" "}
        <Link to="/signup" className="text-amber-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

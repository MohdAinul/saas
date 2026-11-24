import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import { features } from "../utils";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false); // Login aur Register switch karne ke liye
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Page ko refresh hone se rokta hai
    setLoading(true);

    try {
      // Agar Register mode hai toh /register par bhejo, warna /login par
      const endpoint = isRegister ? "/api/user/register" : "/api/user/login";
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const { data } = await axios.post(`${server}${endpoint}`, payload);

      localStorage.setItem("token", data.token);
      toast.success(data.message);
      setUser(data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-page flex items-center justify-center p-4 min-h-screen">
      {/* Background glowing orbs */}
      <div className="orb w-96 h-96 bg-indigo-500 -top-20 -left-20" />
      <div className="orb w-80 h-80 bg-emerald-500 bottom-10 right-0" />
      <div className="orb w-64 h-64 bg-violet-600 top-1/2 left-1/2 -translate-x-1/2" />

      <div className="glass-card w-full max-w-md p-8 md:p-10 flex flex-col items-center gap-6 z-10">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-3xl">
            📚
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gradient">
            CareerAI
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Your AI-powered career co-pilot — build, analyse, and land your next
            role.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {features.map(({ icon: Icon, label }) => (
            <span key={label} className="feature-pill">
              <Icon size={11} className="text-indigo-400" />
              {label}
            </span>
          ))}
        </div>

        <div className="divider-subtle"></div>

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Sirf Register mode mein Name input dikhega */}
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/60">Full Name</label>
              <input
                type="text"
                required
                placeholder="Mohd Ainul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/60">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/60">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 rounded-lg text-sm font-medium mt-2"
          >
            {loading
              ? "Please Wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        {/* Toggle Link (Sign In <-> Sign Up) */}
        <p className="text-xs text-white/50 text-center">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-400 hover:underline font-medium ml-1"
          >
            {isRegister ? "Sign In" : "Register Free"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

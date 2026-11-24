import { LogOut, Mail, Sparkles } from "lucide-react";
import { useAppData } from "../context/AppContext";
import { Link, useNavigate } from "react-router-dom";

const Account = () => {
  const { user, LogoutUser } = useAppData();
  const navigate = useNavigate();

  const handleLogout = () => {
    LogoutUser();
    navigate("/login");
  };

  return (
    <div className="bg-page min-h-screen flex items-start justify-center px-4 pt-28 pb-12">
      <div className="w-full max-w-xl flex flex-col gap-5">
        {/* User Profile Card */}
        <div className="glass-card p-6 flex items-center gap-4">
          <img
            src={user?.image || "/user.png"}
            alt="profile"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
          />

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg truncate">{user?.name}</h2>
            <p className="text-white/40 text-sm flex items-center gap-1.5 truncate">
              <Mail size={12} /> {user?.email}
            </p>
          </div>

          <button
            className="feature-pill gap-2 text-red-400 border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>

        {/* Account Status / Quick Access Card */}
        <div className="glass-card p-6 flex items-center justify-between gap-4 border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">CareerAI Member</p>
              <p className="text-white/40 text-xs mt-0.5">
                Full access to ATS Analyser, Resume Builder & Interview Prep
              </p>
            </div>
          </div>

          <Link
            to="/analyse"
            className="btn-primary text-xs font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
          >
            Open Tools
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Account;

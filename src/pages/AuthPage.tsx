import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AuthPage() {
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isRegister ? "Account created successfully!" : "Logged in successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="mx-auto max-w-[1420px] px-4 sm:px-6 lg:px-10 py-12 flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="text-center">
              <Logo iconSize={44} textSize="text-3xl" />
              <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
                {isRegister ? "Create your account" : "Welcome back to AESCION"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isRegister
                  ? "Join 25,000+ job seekers leveraging AI to land top tech roles."
                  : "Enter your credentials to access your career dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {isRegister && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600">Full Name</label>
                  <div className="relative mt-1">
                    <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Email Address</label>
                <div className="relative mt-1">
                  <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600">Password</label>
                <div className="relative mt-1">
                  <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#2B26D9] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2B26D9] to-[#F96302] py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95"
              >
                {isRegister ? "Create Free Account" : "Sign In"}
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-6">
              {isRegister ? (
                <p>
                  Already have an account?{" "}
                  <Link to="/auth/login" className="font-bold text-[#2B26D9] hover:underline">
                    Log In
                  </Link>
                </p>
              ) : (
                <p>
                  Don't have an account yet?{" "}
                  <Link to="/auth/register" className="font-bold text-[#2B26D9] hover:underline">
                    Join Now
                  </Link>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

export default function GenerateAccountPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate backend registration process
    await new Promise(r => setTimeout(r, 1000));

    // Save permanently in mock local storage instead of email
    localStorage.setItem("prathik_registered_userid", userId);
    localStorage.setItem("prathik_registered_password", password);
    localStorage.setItem("prathik_registered_name", name);

    // Log the user in directly as Premium since they already paid
    await login(userId, name, "premium");
    
    // Send to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-gradient from-emerald-900/20 to-transparent blur-3xl" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-white mb-2">Payment Successful!</Link>
          <h1 className="text-emerald-400 text-sm tracking-widest uppercase font-bold">Generate Your Access ID</h1>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <p className="text-center text-sm text-zinc-400 mb-8">
            Your 1-Month Premium logic is active. Please create an exclusive User ID and Password to login to the terminal in the future.
          </p>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Rakesh T."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">User ID</label>
              <input 
                type="text" 
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/\s+/g, ''))} // Prevent spaces
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. rakesh99"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || !name || !userId || !password}
              className="w-full mt-6 py-4 bg-emerald-500 text-black font-black tracking-widest uppercase rounded-xl hover:bg-emerald-400 transition-colors flex justify-center items-center shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : "Create Account & Enter Terminal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

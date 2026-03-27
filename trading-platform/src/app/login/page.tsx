"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If arriving from registration success
    if (searchParams.get("registered") === "true") {
      const savedUserId = localStorage.getItem("prathik_registered_userid");
      if (savedUserId) {
        setTimeout(() => setUserId(savedUserId), 0);
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    // DEMO ADMIN SHORTCUT
    if (userId === "admin" && password === "admin123") {
      await login("admin", "Master Admin", "premium");
      router.push("/admin");
      return;
    }

    // DEMO LIVE USER SHORTCUT
    if (userId === "user" && password === "user123") {
      // By default, the mock AuthContext pushes right to /dashboard
      await login("user", "Test Trader", "premium");
      return;
    }

    // Check if user is theoretically registered locally
    const savedUserId = localStorage.getItem("prathik_registered_userid");
    const savedPassword = localStorage.getItem("prathik_registered_password");

    // If local storage is empty, they are not registered -> Redirect to pricing
    if (!savedUserId) {
      router.push("/pricing");
      return;
    }

    // Verify Password
    if (userId === savedUserId && password === savedPassword) {
      // Success
      const name = localStorage.getItem("prathik_registered_name") || "Prathik User";
      await login(userId, name);
    } else {
      setIsLoading(false);
      setErrorMsg("Invalid User ID or Password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-zinc-900/40 to-transparent blur-3xl" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-white mb-2">Prathik Algo Lab</Link>
          <h1 className="text-zinc-400 text-sm tracking-widest uppercase">Member Login</h1>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 rounded-3xl shadow-2xl">
          {searchParams.get("registered") === "true" && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-sm">
              Registration successful! Please login to start your Free Trial.
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">User ID</label>
              <input 
                type="text" 
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/\s+/g, ''))}
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
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
                className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || !userId || !password}
              className="w-full mt-6 py-4 bg-white text-black font-bold tracking-wider uppercase rounded-xl hover:bg-zinc-200 transition-colors flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : "Sign In & Access Terminal"}
            </button>
          </form>
          
          <div className="mt-8 text-center pt-6 border-t border-zinc-800/50">
            <p className="text-sm text-zinc-500">
              Don&apos;t have an account? <Link href="/pricing" className="text-white hover:text-zinc-300 font-medium pb-0.5 border-b border-white/20">Purchase Access</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center" />}>
      <LoginContent />
    </Suspense>
  );
}

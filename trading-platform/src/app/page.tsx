"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LiveCandles from "@/components/LiveCandles";

function CombinedLandingAndLogin() {
  const { login } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (deferredPrompt) {
      e.preventDefault();
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setDeferredPrompt(null);
    }
    // If no deferredPrompt is available, we do NOT e.preventDefault()
    // This allows the browser to natively follow the href and download the .apk file instead!
  };

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
      const name = localStorage.getItem("prathik_registered_name") || "Prathik User";
      await login(userId, name);
    } else {
      setIsLoading(false);
      setErrorMsg("Invalid User ID or Password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Spectacular Live Candlestick Graph Background! */}
      <div className="absolute inset-0 z-0">
         <LiveCandles />
      </div>
      
      {/* Dark overlay to make content readable over the chart */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0" />

      {/* Main Foreground Container */}
      <div className="z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left Side: Marketing Text */}
        <div className="text-center lg:text-left flex-1">
          <h1 className="text-4xl sm:text-6xl font-normal text-white leading-tight mb-8">
            Live Trading terminal <br className="hidden sm:block" /> with Auto Signals
          </h1>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6">
            <span className="bg-[#16a34a] text-white px-5 py-2 font-bold tracking-widest rounded-sm text-sm">BUY</span>
            <span className="bg-[#dc2626] text-white px-5 py-2 font-bold tracking-widest rounded-sm text-sm">SELL</span>
            <span className="bg-[#374151] border border-[#4b5563] text-zinc-300 px-4 py-2 text-sm rounded-sm uppercase tracking-wide">StopLoss & Targets</span>
          </div>

          <div className="flex justify-center lg:justify-start mb-8">
            <a 
              href="/prathik-algo-lab.apk" 
              download="prathik-algo-lab.apk"
              onClick={handleInstallClick}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 hover:border-amber-500 text-white px-6 py-3 font-bold tracking-wider rounded-xl text-sm transition-all flex items-center gap-3 group shadow-lg cursor-pointer"
            >
              <svg className="w-6 h-6 text-amber-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] uppercase text-zinc-400 font-semibold tracking-widest">Install Application</span>
                <span className="uppercase">Download App</span>
              </div>
            </a>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-300 mb-8 leading-snug">
            Seamless execution with high algorithmic accuracy.
          </h2>
          
          <p className="text-amber-500/90 text-sm sm:text-base italic font-serif leading-relaxed max-w-lg mx-auto lg:mx-0">
            Automated Buy/Sell engine active across NSE, NFO, and MCX Commodities. Immediate push alerts ensuring zero manual slippage.
          </p>
        </div>

        {/* Right Side: The Login Portal */}
        <div className="w-full max-w-md shrink-0">
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <div className="text-center mb-8">
              <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Access Terminal</h2>
              <p className="text-zinc-500 text-sm tracking-wide">Sign in using your Premium ID</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">User ID</label>
                <input 
                  type="text" 
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\s+/g, ''))}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="e.g. rakesh99"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !userId || !password}
                className="w-full mt-4 py-4 bg-amber-500 text-black font-black tracking-widest uppercase rounded-xl hover:bg-amber-400 transition-colors flex justify-center items-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : "Connect Core"}
              </button>
            </form>
            
            <div className="mt-8 text-center pt-6 border-t border-zinc-800/50">
              <p className="text-sm text-zinc-400">
                New User? <Link href="/pricing" className="text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-widest text-xs ml-2">Subscribe Plan</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <CombinedLandingAndLogin />
    </Suspense>
  );
}

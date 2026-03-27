"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Hit Node backend to send OTP via Twilio/Msg91
      await api.sendOtp(phone);
    } catch(err) {
      console.warn("Backend unavailable, simulating OTP send natively...");
    }

    // Move to step 2 visually
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate verification and account creation
      await new Promise(r => setTimeout(r, 1000));
      
      // Save details locally so the Login page Mock mechanism allows them in
      localStorage.setItem("prathik_registered_name", name);
      localStorage.setItem("prathik_registered_email", email);
      localStorage.setItem("prathik_registered_phone", phone);
      localStorage.setItem("prathik_registered_password", password);

      router.push("/login?registered=true");
    } catch(err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-radial-gradient from-emerald-950/20 to-transparent blur-3xl" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-white mb-2">Prathik Trading</Link>
          <h1 className="text-zinc-400 text-sm tracking-widest uppercase">Apply for Elite Access</h1>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-8 rounded-3xl shadow-2xl">
          
          {searchParams.get("error") === "not_registered" && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-center text-sm font-medium">
              We couldn't find an account. Please register and verify your details first!
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="admin@prathik.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-zinc-500">+91</span>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 rounded-xl pl-12 pr-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="999 999 9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Secure Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !phone || !email || !name || !password}
                className="w-full mt-6 py-4 bg-white text-black font-bold tracking-wider uppercase rounded-xl hover:bg-zinc-200 transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Send Verification OTPs"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-white font-medium">Verify Identity & Devices</h2>
                <p className="text-zinc-500 text-sm mt-1">Please enter the master verification code (Mock: 123456)</p>
              </div>

              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 rounded-xl px-5 py-4 text-center text-2xl tracking-[1em] text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="w-full py-4 bg-emerald-500 text-black font-bold tracking-wider uppercase rounded-xl hover:bg-emerald-400 transition-colors flex justify-center items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Verify & Create Account"
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-widest mt-4"
              >
                Change details
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center pt-6 border-t border-zinc-800/50">
            <p className="text-sm text-zinc-500">
              Already have an account? <Link href="/login" className="text-white hover:text-emerald-400 font-medium">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center" />}>
      <RegisterContent />
    </Suspense>
  );
}

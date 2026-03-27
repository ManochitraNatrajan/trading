"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function PricingPage() {
  const router = useRouter();
  const { user, upgradeToPremium } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    setIsProcessing(true);

    const res = await initializeRazorpay();

    if (!res) {
      alert("Razorpay payment gateway failed to load. Please check your connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourKeyId", 
      amount: "499900", // amount in paise (₹4999.00)
      currency: "INR",
      name: "Pratik Algo Lab",
      description: "1-Month Premium Auto-Trading",
      image: "/logo.jpg",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      handler: function (response: any) {
        // Payment successful callback
        // If logged in, just upgrade. If totally new, send to account generator.
        if (user) {
          upgradeToPremium();
          router.push("/dashboard");
        } else {
          router.push("/generate-account");
        }
      },
      prefill: {
        name: user ? user.name : "",
        email: user ? user.email : "",
        contact: "9999999999", 
      },
      theme: {
        color: "#f59e0b", // Amber 500
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentObject = new (window as any).Razorpay(options);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentObject.on("payment.failed", function (response: any) {
      alert("Payment Failed: " + response.error.description);
      setIsProcessing(false);
    });

    paymentObject.open();

    // Reset processing spinner when overlay opens (so if they close without paying, it's not permanently stuck)
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Glowing Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 text-center max-w-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500 mb-4 tracking-tight">
          Elite Auto-Trading Access
        </h1>
        <p className="text-zinc-400 text-lg mb-12 font-medium">
          Dominate the Indian markets with our full-automated algorithmic engine. 
          Connect your brokers and start capturing signals instantly.
        </p>

        {/* The Pricing Card Engine */}
        <div className="relative group max-w-sm mx-auto">
          {/* Card Border Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] p-8 text-center flex flex-col items-center py-12 shadow-2xl">
            
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <h2 className="text-2xl text-white font-bold tracking-tight mb-2">1-Month Premium</h2>
            <p className="text-sm text-zinc-500 mb-6 font-medium">Auto-deactivates exactly after 30 days.</p>
            
            <button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex items-end justify-center gap-1 mb-8 group/amount cursor-pointer hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="text-3xl text-zinc-400 font-semibold mb-1 group-hover/amount:text-amber-400 transition-colors">₹</span>
              <span className="text-6xl text-white font-black tracking-tighter group-hover/amount:text-amber-500 transition-colors drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover/amount:drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]">4,999</span>
            </button>

            <ul className="text-left space-y-4 mb-10 w-full text-zinc-300">
              <li className="flex items-center gap-3 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Full automated live execution
              </li>
              <li className="flex items-center gap-3 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                NSE, NFO & MCX Connectivity
              </li>
              <li className="flex items-center gap-3 font-medium">
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Real-time Telegram/WhatsApp alerts
              </li>
            </ul>

            <button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="relative w-full overflow-hidden rounded-xl bg-amber-500 text-black font-black uppercase tracking-widest text-sm py-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_10px_20px_rgba(245,158,11,0.3)]"
            >
              <div className={`absolute inset-0 bg-white/20 -translate-x-full ${isProcessing ? 'animate-[shimmer_1.5s_infinite]' : 'group-hover:animate-[shimmer_1.5s_infinite]'}`} />
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Purchase & Activate"
              )}
            </button>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-4">Safe & Secure Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bg-[#1f2937] border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 pr-0">
        
        {/* Left Logo & Back Button */}
        <div className="flex items-center gap-4 pl-4 h-full py-2">
          {pathname !== '/' && (
            <button onClick={() => router.back()} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/20 group-hover:border-amber-500/50 transition-colors bg-black flex-shrink-0">
              <Image 
                src="/logo.jpeg" 
                alt="Prathik Algo Lab" 
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-amber-500 group-hover:text-amber-400 transition-colors whitespace-nowrap hidden sm:block">Prathik Algo Lab</span>
          </Link>
        </div>

        {/* Center Links - Now Empty as all links moved to Right CTA */}
        <div className="hidden lg:flex items-center space-x-6 text-sm text-white">
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center h-full">
          {user ? (
            <>
              {user.email === "admin" && (
                <Link href="/admin" className="h-full px-6 flex items-center justify-center bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm transition-colors border-l border-violet-500 flex-shrink-0">
                  Master Terminal
                </Link>
              )}
              <Link href="/" className="h-full px-6 flex items-center justify-center hover:bg-white/5 text-zinc-300 hover:text-white font-semibold text-sm transition-colors border-l border-white/5 flex-shrink-0">
                Home
              </Link>
              <Link href="/dashboard" className="h-full px-6 flex items-center justify-center bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm transition-colors flex-shrink-0">
                Dashboard
              </Link>
              <Link href="/pricing" className="h-full px-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex-shrink-0">
                Subscribe
              </Link>
              <button onClick={logout} className="h-full px-6 flex items-center justify-center bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold text-sm transition-colors flex-shrink-0">
                Logout
              </button>
              <Link href="/signals" className="h-full px-6 flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold text-sm transition-colors flex-shrink-0">
                Past Performance
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className="h-full px-6 flex items-center justify-center hover:bg-white/5 text-zinc-300 hover:text-white font-semibold text-sm transition-colors border-l border-white/5 flex-shrink-0">
                Home
              </Link>
              <Link href="/login" className="h-full px-6 flex items-center justify-center bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm transition-colors flex-shrink-0">
                Login
              </Link>
              <Link href="/pricing" className="h-full px-6 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex-shrink-0">
                Subscribe
              </Link>
              <Link href="/signals" className="h-full px-6 flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold text-sm transition-colors flex-shrink-0">
                Past Performance
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

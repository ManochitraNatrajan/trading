"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  status: "trial" | "premium";
  trialExpiresAt: number;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, overrideStatus?: "trial" | "premium") => void;
  logout: () => void;
  upgradeToPremium: () => void;
  updateBalance: (newBalance: number) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, name: string, overrideStatus?: "trial" | "premium") => {
    try {
      // 1. Attempt to hit the Real Node.js Backend API
      // Since evaluating via Next.js directly doesn't capture OTP yet, we simulate passing "123456"
      const res = await api.verifyOtp(email, "123456");
      
      if (res.success && res.user) {
        // True backend connection succeeded
        const finalUser = overrideStatus ? { ...res.user, status: overrideStatus } : res.user;
        setUser(finalUser);
        localStorage.setItem("auth_user", JSON.stringify(finalUser));
        localStorage.setItem("auth_token", res.token);
        router.push(overrideStatus === "premium" ? "/admin" : "/dashboard");
        return;
      }
    } catch (e) {
      console.warn("Backend API unavailable. Falling back to local Mock Auth for demo purposes.");
    }

    // 2. Demo Fallback: 30 days trial
    const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
    
    const mockUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email,
      name: name || "Prathik",
      status: overrideStatus || "trial",
      trialExpiresAt: thirtyDaysFromNow,
      balance: 1000000.00, // 10L simulated starting balance
    };
    
    setUser(mockUser);
    localStorage.setItem("auth_user", JSON.stringify(mockUser));
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  const upgradeToPremium = () => {
    if (user) {
      // Premium works for 1 month (30 days) before auto-deactivating
      const oneMonthFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000;
      const upgradedUser = { ...user, status: "premium" as const, trialExpiresAt: oneMonthFromNow };
      setUser(upgradedUser);
      localStorage.setItem("auth_user", JSON.stringify(upgradedUser));
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, upgradeToPremium, updateBalance, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


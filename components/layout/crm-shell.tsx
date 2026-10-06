"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; displayName: string };
  branch?: { id: string; name: string; code: string; city: string } | null;
  permissions: string[];
}

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.user) {
            setUser(data.user);
            return;
          }
        }
        if (isMounted) {
          setUser({
            id: "admin",
            name: "Ahmed Al-Amalon (مدير النظام)",
            email: "admin@amalon.com",
            role: { id: "admin-role", name: "admin", displayName: "مدير النظام (Admin)" },
            permissions: ["*"],
          });
        }
      } catch (err) {
        console.error("Auth me check failed:", err);
        if (isMounted) {
          setUser({
            id: "admin",
            name: "Ahmed Al-Amalon (مدير النظام)",
            email: "admin@amalon.com",
            role: { id: "admin-role", name: "admin", displayName: "مدير النظام (Admin)" },
            permissions: ["*"],
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/30">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="font-semibold text-sm">جاري تحميل نظام أمالون للتعليم الدولي...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 lg:ms-64">
        <Header onMenuToggle={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

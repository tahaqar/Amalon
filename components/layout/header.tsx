"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Building2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onMenuToggle: () => void;
  user: {
    name: string;
    email: string;
    role: { displayName: string; name: string };
    branch?: { id: string; name: string; code: string } | null;
  } | null;
}

interface NotificationItem {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export function Header({ onMenuToggle, user }: HeaderProps) {
  const { language, toggleLanguage, theme, toggleTheme, selectedBranchId, setSelectedBranchId, t } =
    useCrm();

  const [branches, setBranches] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [branchRes, notifRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/notifications"),
        ]);

        if (branchRes.ok) {
          const bData = await branchRes.json();
          setBranches(bData.branches || []);
        }

        if (notifRes.ok) {
          const nData = await notifRes.json();
          setNotifications(nData.notifications || []);
          setUnreadCount(nData.unreadCount || 0);
        }
      } catch (err) {
        console.error("Header data load error:", err);
      }
    }
    loadData();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between gap-2 overflow-x-hidden">
      {/* Start side: Menu Toggle + Branch Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Compact & Responsive Branch Selector */}
        <div className="relative min-w-0 max-w-[150px] sm:max-w-[240px]">
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full appearance-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl ps-7 pe-6 py-1.5 sm:py-2 truncate focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">🏢 {t("all_branches", "جميع الفروع")}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 {b.name.split("(")[0].trim()}
              </option>
            ))}
          </select>
          <Building2 className="w-3.5 h-3.5 absolute inset-y-0 start-2 my-auto text-slate-500 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 absolute inset-y-0 end-1.5 my-auto text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* End side: Language + Theme + Notifications + User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition shrink-0"
          title="Toggle Language"
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">
            {language === "ar" ? "EN" : "عربي"}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition shrink-0"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 relative transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute end-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {t("notifications", "التنبيهات")}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    تحديد كمقروء
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    لا توجد تنبيهات جديدة
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                        !n.isRead ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {language === "ar" ? n.titleAr : n.titleEn}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        {language === "ar" ? n.messageAr : n.messageEn}
                      </p>
                      {n.linkUrl && (
                        <Link
                          href={n.linkUrl}
                          onClick={() => setShowNotifications(false)}
                          className="inline-flex items-center gap-1 text-[10px] text-indigo-600 font-bold mt-1.5 hover:underline"
                        >
                          <span>عرض</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar badge (hidden on very small screens) */}
        {user && (
          <div className="hidden md:flex items-center gap-2 ps-2 border-s border-slate-200 dark:border-slate-800 shrink-0">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-start leading-tight">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                {user.name.split(" ")[0]}
              </span>
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                {user.role?.displayName?.split("(")[0]?.trim() || "مدير"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

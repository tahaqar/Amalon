"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import { FileCheck2, Search, Filter, Plus, Building, ExternalLink, Loader2 } from "lucide-react";

export default function ApplicationsPage() {
  const { language, t } = useCrm();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadApps() {
      setLoading(true);
      try {
        const res = await fetch(`/api/applications?status=${statusFilter}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (err) {
        console.error("Fetch applications error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-indigo-600" />
            <span>{t("applications", "القبولات والتقديمات الجامعية")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            متابعة جميع ملفات التقديم للجامعات الدولية وحالة صدور القبولات
          </p>
        </div>

        <Link
          href="/kanban"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
        >
          <span>عرض لوحة كانبان (Kanban)</span>
        </Link>
      </div>

      {/* Filter and stats */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          <option value="all">جميع الحالات</option>
          <option value="submitted">تم التقديم</option>
          <option value="accepted">مقبول (نهائي أو مشروط)</option>
          <option value="in_progress">قيد المراجعة</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل طلبات التقديم...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">لا توجد طلبات تقديم حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">رقم الطلب</th>
                  <th className="p-3.5 text-start font-semibold">الطالب</th>
                  <th className="p-3.5 text-start font-semibold">الجامعة والوجهة</th>
                  <th className="p-3.5 text-start font-semibold">البرنامج / التخصص</th>
                  <th className="p-3.5 text-start font-semibold">مرحلة كانبان</th>
                  <th className="p-3.5 text-start font-semibold">الرسوم</th>
                  <th className="p-3.5 text-end font-semibold">ملف الطالب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                      {app.applicationCode}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {app.student?.fullNameAr}
                      <span className="block text-[11px] text-slate-400">{app.student?.studentCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                        {app.country?.flagEmoji} {app.university?.nameAr}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{app.university?.city}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {app.program?.nameAr || app.customMajor || "عام"}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{app.level} • {app.intake}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                        {app.stage?.nameAr || "قيد المعالجة"}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {app.tuitionFee?.toLocaleString()} {app.tuitionCurrency}
                    </td>
                    <td className="p-3.5 text-end">
                      <Link
                        href={`/students/${app.student?.id}?tab=applications`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 font-semibold text-indigo-600 text-xs inline-flex items-center gap-1"
                      >
                        <span>عرض</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import { Stamp, Calendar, Phone, CheckCircle2, Clock, Loader2, ExternalLink } from "lucide-react";

export default function VisaPage() {
  const { t } = useCrm();
  const [visaCases, setVisaCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVisa() {
      try {
        const res = await fetch("/api/visa");
        if (res.ok) {
          const data = await res.json();
          setVisaCases(data.visaCases || []);
        }
      } catch (err) {
        console.error("Fetch visa error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVisa();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Stamp className="w-6 h-6 text-indigo-600" />
          <span>{t("visa", "ملفات التأشيرات ومواعيد السفارات")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          متابعة تجهيز المستندات، مواعيد المقابلات، ونسب اكتمال قائمة متطلبات الفيزا
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل ملفات التأشيرات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">رقم القضية</th>
                  <th className="p-3.5 text-start font-semibold">الطالب</th>
                  <th className="p-3.5 text-start font-semibold">دولة التأشيرة</th>
                  <th className="p-3.5 text-start font-semibold">موعد المقابلة</th>
                  <th className="p-3.5 text-start font-semibold">اكتمال المتطلبات</th>
                  <th className="p-3.5 text-start font-semibold">الحالة</th>
                  <th className="p-3.5 text-end font-semibold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {visaCases.map((vc) => {
                  const completed = vc.checklistItems?.filter((i: any) => i.isCompleted).length || 0;
                  const total = vc.checklistItems?.length || 1;
                  const pct = Math.round((completed / total) * 100);

                  return (
                    <tr key={vc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                        {vc.caseNumber}
                      </td>
                      <td className="p-3.5">
                        <Link href={`/students/${vc.student?.id}?tab=visa`} className="font-bold text-slate-900 dark:text-white hover:underline block">
                          {vc.student?.fullNameAr}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{vc.student?.studentCode}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {vc.country?.flagEmoji} {vc.country?.nameAr}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{vc.appointmentDate ? new Date(vc.appointmentDate).toLocaleDateString("ar-EG") : "قيد الحجز"}</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block">{vc.embassyLocation || "مقر السفارة"}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-bold text-[11px] text-slate-600 dark:text-slate-300">{pct}%</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {vc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-end">
                        <Link
                          href={`/students/${vc.student?.id}?tab=visa`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-indigo-600 text-xs inline-flex items-center gap-1"
                        >
                          <span>عرض</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

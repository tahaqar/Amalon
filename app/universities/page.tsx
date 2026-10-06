"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { Building, Phone, Mail, Globe, Percent, Calendar, Loader2 } from "lucide-react";

export default function UniversitiesPage() {
  const { t } = useCrm();
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnis() {
      try {
        const res = await fetch("/api/universities");
        if (res.ok) {
          const data = await res.json();
          setUniversities(data.universities || []);
        }
      } catch (err) {
        console.error("Fetch universities error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUnis();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-indigo-600" />
          <span>{t("universities", "الجامعات والمعاهد الشريكة")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          عقود الشراكة المباشرة، نسب العمولات، ومسؤولو القبول والتسجيل
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">جاري تحميل الجامعات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {universities.map((uni) => (
            <div
              key={uni.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-indigo-500 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    {uni.country?.flagEmoji} {uni.nameAr}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{uni.nameEn} • {uni.city}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-[11px]">
                  {uni.contractStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">عمولة أمالون:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {uni.commissionValue}% {uni.commissionType === "percentage" ? "نسبة مئوية" : "مبلغ مقطوع"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">مسؤول التواصل:</span>
                  <span className="font-semibold">{uni.contactPerson || "مكتب القبول الدولي"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">البرامج المسجلة:</span>
                  <span className="font-semibold">{uni.programs?.length || 0} برنامج</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={`https://wa.me/${uni.contactPhone?.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>واتساب الجامعة</span>
                </a>
                {uni.website && (
                  <a
                    href={uni.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600"
                    title="زيارة الموقع"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

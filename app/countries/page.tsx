"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { Globe2, Building, FileText, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function CountriesPage() {
  const { language, t } = useCrm();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch("/api/countries");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries || []);
          if (data.countries?.length > 0) setSelectedCountry(data.countries[0]);
        }
      } catch (err) {
        console.error("Fetch countries error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCountries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs">جاري تحميل دليل الوجهات الدراسية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-indigo-600" />
          <span>{t("countries", "دليل الدول والوجهات الدراسية (11 دولة)")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          شروط القبول ومتطلبات التأشيرة والجامعات المعتمدة لكل دولة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Selector Grid */}
        <div className="space-y-2 lg:col-span-1">
          {countries.map((c) => {
            const isSelected = selectedCountry?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c)}
                className={`w-full text-start p-3.5 rounded-2xl border transition flex items-center justify-between ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{c.flagEmoji}</span>
                  <div>
                    <span className="font-bold text-xs block">
                      {language === "ar" ? c.nameAr : c.nameEn}
                    </span>
                    <span className={`text-[11px] block ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                      {c.nameEn} • {c.currencyCode}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {c._count?.applications || 0} طلب
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Country Dossier */}
        <div className="lg:col-span-2">
          {selectedCountry ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCountry.flagEmoji}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedCountry.nameAr} ({selectedCountry.nameEn})
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      العملة الرسمية: {selectedCountry.currencyCode} • مسؤول الملف: {selectedCountry.responsibleStaff || "فريق القبول"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements Sections */}
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <h3 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>شروط وإجراءات القبول الجامعي</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedCountry.admissionRequirements || "متوفر التسجيل في البرامج باللغة الإنجليزية والأجنبية."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 space-y-1.5">
                  <h3 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>متطلبات ملف التأشيرة والسفارة (Visa Requirements)</span>
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedCountry.visaRequirements || "كشف حساب بنكي وتأمين صحي دولي وقبول رسمي."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>متطلبات اللغة والشهادات المعترف بها</span>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedCountry.languageRequirements || "IELTS أو توفل أو شهادة دورة لغة تحضيرية."}
                  </p>
                </div>

                {/* Universities */}
                <div className="pt-2">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span>الجامعات الشريكة في هذه الوجهة ({selectedCountry.universities?.length || 0})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCountry.universities?.map((u: any) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">{u.nameAr}</span>
                        <span className="text-[11px] text-slate-400">{u.city} • {u.nameEn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

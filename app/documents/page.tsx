"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import { FolderArchive, FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";

export default function DocumentsPage() {
  const { t } = useCrm();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error("Fetch docs error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FolderArchive className="w-6 h-6 text-indigo-600" />
          <span>{t("documents", "إدارة وتدقيق المستندات")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          أرشيف وثائق الطلاب، التحقق من الجوازات، الشهادات المترجمة، وتصديقات السفارة
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل المستندات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <tr>
                  <th className="p-3.5 text-start font-semibold">اسم الوثيقة</th>
                  <th className="p-3.5 text-start font-semibold">الطالب</th>
                  <th className="p-3.5 text-start font-semibold">النوع والتصنيف</th>
                  <th className="p-3.5 text-start font-semibold">الإصدار والحجم</th>
                  <th className="p-3.5 text-start font-semibold">حالة التدقيق</th>
                  <th className="p-3.5 text-end font-semibold">الملف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>{doc.title}</span>
                    </td>
                    <td className="p-3.5">
                      <Link href={`/students/${doc.student?.id}?tab=documents`} className="font-semibold text-indigo-600 hover:underline">
                        {doc.student?.fullNameAr}
                      </Link>
                      <span className="text-[11px] text-slate-400 block">{doc.student?.studentCode}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">{doc.documentType?.nameAr}</span>
                      <span className="text-[11px] text-slate-400 block">{doc.documentType?.category}</span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      v{doc.version} • {Math.round(doc.fileSize / 1024)} KB
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        doc.status === "verified"
                          ? "bg-emerald-100 text-emerald-700"
                          : doc.status === "in_translation"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {doc.status === "verified" ? "معتمد" : doc.status === "in_translation" ? "قيد الترجمة" : "بانتظار الطالب"}
                      </span>
                    </td>
                    <td className="p-3.5 text-end">
                      <Link
                        href={`/students/${doc.student?.id}?tab=documents`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold text-[11px]"
                      >
                        معاينة
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

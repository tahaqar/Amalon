"use client";

import React, { useState, useEffect } from "react";
import { useCrm } from "@/components/providers/crm-provider";
import { ShieldCheck, Building, Phone, Mail, UserCheck, Loader2 } from "lucide-react";

export default function EmployeesPage() {
  const { t } = useCrm();
  const [data, setData] = useState<any>({ users: [], branches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/employees");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Fetch employees error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span>{t("employees", "فريق العمل والفروع الدولية")}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          إدارة الموظفين، الفروع الدولية، وتوزيع الصلاحيات الإدارية
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Branches */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>الفروع الدولية (Branches)</span>
          </h2>

          <div className="space-y-3">
            {data.branches?.map((b: any) => (
              <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold text-[10px]">
                    {b.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {b.city} • {b.phone}
                </p>
                <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
                  <span>{b._count?.users || 0} موظف</span>
                  <span>•</span>
                  <span>{b._count?.students || 0} طالب مسجل</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>الموظفون والمستشارون</span>
          </h2>

          <div className="space-y-3">
            {data.users?.map((u: any) => (
              <div key={u.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                  <span className="text-[11px] text-slate-400 block">{u.email}</span>
                  <span className="text-[10px] text-indigo-600 font-medium block mt-1">
                    {u.role?.displayName || u.role?.name} • فرع {u.branch?.city || "الرئيسي"}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  نشط
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

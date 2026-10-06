"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  GraduationCap,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  Building,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function StudentsPage() {
  const { language, selectedBranchId, t } = useCrm();

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullNameAr: "",
    fullNameEn: "",
    phone: "",
    whatsapp: "",
    email: "",
    nationality: "مواطن",
    passportNumber: "",
    desiredCountry: "Spain",
    desiredMajor: "Computer Science",
    targetLevel: "bachelor",
    budget: "8000",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadStudents() {
      try {
        const query = new URLSearchParams({
          search,
          status: statusFilter,
          country: countryFilter,
          branchId: selectedBranchId,
        });
        const res = await fetch(`/api/students?${query.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error("Fetch students error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [search, statusFilter, countryFilter, selectedBranchId, refreshKey]);

  const handleExport = () => {
    const exportData = students.map((s) => ({
      "كود الطالب": s.studentCode,
      "الاسم بالعربية": s.fullNameAr,
      "الاسم بالإنجليزية": s.fullNameEn,
      "الهاتف": s.phone,
      "البريد الإلكتروني": s.email,
      "الدولة المستهدفة": s.desiredCountry,
      "التخصص المطلوب": s.desiredMajor,
      "المرحلة": s.targetLevel,
      "الحالة": s.status,
      "الفرع": s.branch?.name,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
    XLSX.writeFile(wb, `amalon_students_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل الطالب");
      }

      setIsModalOpen(false);
      setFormData({
        fullNameAr: "",
        fullNameEn: "",
        phone: "",
        whatsapp: "",
        email: "",
        nationality: "مواطن",
        passportNumber: "",
        desiredCountry: "Spain",
        desiredMajor: "Computer Science",
        targetLevel: "bachelor",
        budget: "8000",
        notes: "",
      });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" },
    active: { label: "نشط", color: "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300" },
    accepted: { label: "مقبول", color: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" },
    visa_stage: { label: "تأشيرة", color: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" },
    travelled: { label: "سافر", color: "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300" },
    cancelled: { label: "ملغي", color: "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>{t("students", "إدارة الطلاب")}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            سجل الطلاب والملفات الأكاديمية ومتابعة طلبات القبول والتأشيرة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة طالب</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، الكود، الهاتف، أو البريد..."
            className="w-full ps-9 pe-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الحالات</option>
            <option value="new">جديد</option>
            <option value="active">نشط</option>
            <option value="accepted">مقبول</option>
            <option value="visa_stage">مرحلة التأشيرة</option>
            <option value="travelled">سافر</option>
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كل الوجهات</option>
            <option value="Spain">إسبانيا 🇪🇸</option>
            <option value="Germany">ألمانيا 🇩🇪</option>
            <option value="Turkey">تركيا 🇹🇷</option>
            <option value="Malta">مالطا 🇲🇹</option>
            <option value="United Kingdom">بريطانيا 🇬🇧</option>
            <option value="Malaysia">ماليزيا 🇲🇾</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs">جاري تحميل قائمة الطلاب...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">لا يوجد طلاب مطابقين للبحث</p>
            <p className="text-xs text-slate-400 mt-1">جرّب تغيير فلاتر البحث أو إضافة طالب جديد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 text-start font-semibold">كود الطالب</th>
                  <th className="p-3.5 text-start font-semibold">اسم الطالب</th>
                  <th className="p-3.5 text-start font-semibold">الاتصال</th>
                  <th className="p-3.5 text-start font-semibold">الوجهة والتخصص</th>
                  <th className="p-3.5 text-start font-semibold">الفرع والمستشار</th>
                  <th className="p-3.5 text-start font-semibold">الحالة</th>
                  <th className="p-3.5 text-end font-semibold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((s) => {
                  const statusInfo = statusMap[s.status] || { label: s.status, color: "bg-slate-100 text-slate-700" };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">
                        {s.studentCode}
                      </td>
                      <td className="p-3.5">
                        <Link href={`/students/${s.id}`} className="font-bold text-slate-900 dark:text-white hover:underline block">
                          {s.fullNameAr}
                        </Link>
                        <span className="text-[11px] text-slate-400 block">{s.fullNameEn}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span dir="ltr">{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{s.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">
                          {s.desiredCountry}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {s.desiredMajor || "عام"} • {s.targetLevel}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 block">
                          {s.branch?.name?.split("(")[0]?.trim() || "الفرع الرئيسي"}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {s.counselor?.name?.split("(")[0]?.trim() || "غير معين"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition"
                            title="واتساب مباشر"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <Link
                            href={`/students/${s.id}`}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition"
                            title="الملف الكامل"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span>إضافة طالب جديد للنظام</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">الاسم الكامل بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.fullNameAr}
                  onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                  placeholder="مثال: يوسف أحمد عبد الله"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">الاسم بالإنجليزية (مطابق للجواز)</label>
                <input
                  type="text"
                  value={formData.fullNameEn}
                  onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                  placeholder="Youssef Ahmed Abdullah"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">رقم الهاتف الأساسي *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">الوجهة المفضلة</label>
                  <select
                    value={formData.desiredCountry}
                    onChange={(e) => setFormData({ ...formData, desiredCountry: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="Spain">إسبانيا 🇪🇸</option>
                    <option value="Germany">ألمانيا 🇩🇪</option>
                    <option value="Turkey">تركيا 🇹🇷</option>
                    <option value="Malta">مالطا 🇲🇹</option>
                    <option value="United Kingdom">المملكة المتحدة 🇬🇧</option>
                    <option value="Malaysia">ماليزيا 🇲🇾</option>
                    <option value="Cyprus">قبرص 🇨🇾</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">المرحلة الدراسية</label>
                  <select
                    value={formData.targetLevel}
                    onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="bachelor">بكالوريوس (Bachelor)</option>
                    <option value="master">ماجستير (Master)</option>
                    <option value="phd">دكتوراه (PhD)</option>
                    <option value="language">دورة لغة (Language)</option>
                    <option value="foundation">سنة تحضيرية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">التخصص المطلوب</label>
                <input
                  type="text"
                  value={formData.desiredMajor}
                  onChange={(e) => setFormData({ ...formData, desiredMajor: e.target.value })}
                  placeholder="مثال: هندسة الذكاء الاصطناعي، طب بشري، إدارة أعمال"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 font-semibold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ الطالب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

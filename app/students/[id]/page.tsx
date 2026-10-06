"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCrm } from "@/components/providers/crm-provider";
import {
  Users,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  FolderArchive,
  CreditCard,
  Stamp,
  CheckSquare,
  MessageSquare,
  Plane,
  Clock,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
} from "lucide-react";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { direction, t } = useCrm();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // New Note / Timeline state
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function fetchStudent() {
      try {
        const res = await fetch(`/api/students/${id}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setStudent(data.student);
        } else if (isMounted) {
          router.push("/students");
        }
      } catch (err) {
        console.error("Fetch student error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      isMounted = false;
    };
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs">جاري تحميل الملف الشامل للطالب...</p>
      </div>
    );
  }

  if (!student) return null;

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: Users },
    { id: "timeline", label: "الجدول الزمني (Timeline)", icon: Clock },
    { id: "applications", label: `القبولات (${student.applications?.length || 0})`, icon: FileCheck2 },
    { id: "documents", label: `المستندات (${student.documents?.length || 0})`, icon: FolderArchive },
    { id: "visa", label: "ملف التأشيرة", icon: Stamp },
    { id: "payments", label: "المدفوعات والعقد", icon: CreditCard },
    { id: "tasks", label: `المهام (${student.tasks?.length || 0})`, icon: CheckSquare },
    { id: "communications", label: "سجل التواصل", icon: MessageSquare },
    { id: "travel", label: "السفر والوصول", icon: Plane },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
          >
            {direction === "rtl" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {student.fullNameAr}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                {student.studentCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.fullNameEn} • {student.nationality} • فرع {student.branch?.name?.split("(")[0]?.trim()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${student.phone?.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>محادثة واتساب</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              البيانات الشخصية وجواز السفر
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">رقم الجواز:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{student.passportNumber || "••••••"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">تاريخ الميلاد:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {student.birthDate ? new Date(student.birthDate).toLocaleDateString("ar-EG") : "غير مسجل"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">الجنسية:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{student.nationality}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">بلد الإقامة:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{student.residenceCountry}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              المؤهل الأكاديمي والاهتمامات
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">آخر مؤهل:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.lastCertificate || "ثانوية عامة"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">المعدل / GPA:</span>
                <span className="font-bold text-emerald-600">{student.gpa || "متميز"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">اختبار اللغة:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{student.ieltsToeflScore || "غير محدد"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">الميزانية التقديرية:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${student.budget?.toLocaleString() || "5,000"}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              المتابعة الداخلية والفرع
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">الفرع المسؤول:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.branch?.name?.split("(")[0]?.trim()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">المستشار الأكاديمي:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.counselor?.name?.split("(")[0]?.trim() || "غير معين"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">مصدر الطالب:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{student.leadSource?.nameAr || "إنستغرام"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">تاريخ التسجيل:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(student.registrationDate).toLocaleDateString("ar-EG")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Timeline Events with colors */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
              السجل الزمني للأحداث والمتابعات
            </h3>

            <div className="relative border-s-2 border-slate-200 dark:border-slate-800 ms-4 space-y-6">
              {student.timelineEvents?.map((event: any) => {
                const colorBorder: Record<string, string> = {
                  green: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950",
                  yellow: "border-amber-500 bg-amber-50 dark:bg-amber-950",
                  blue: "border-indigo-500 bg-indigo-50 dark:bg-indigo-950",
                  red: "border-rose-500 bg-rose-50 dark:bg-rose-950",
                };

                return (
                  <div key={event.id} className="relative ps-6">
                    <span
                      className={`absolute -start-2 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                        event.color === "green"
                          ? "bg-emerald-500"
                          : event.color === "yellow"
                          ? "bg-amber-500"
                          : event.color === "red"
                          ? "bg-rose-500"
                          : "bg-indigo-500"
                      }`}
                    />
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{event.titleAr}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(event.eventDate).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{event.description}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        بواسطة: {event.actorName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Applications */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">القبولات والتقديمات المسجلة</h3>
            <Link
              href="/applications"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تقديم لجامعة جديدة</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.applications?.map((app: any) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-base font-bold text-slate-900 dark:text-white block">
                      {app.university?.nameAr}
                    </span>
                    <span className="text-xs text-slate-400">{app.university?.nameEn}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs font-bold">
                    {app.stage?.nameAr || app.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <p>الوجهة: {app.country?.flagEmoji} {app.country?.nameAr}</p>
                  <p>البرنامج: {app.program?.nameAr || app.customMajor || "بكالوريوس"}</p>
                  <p>الرسوم: {app.tuitionFee?.toLocaleString()} {app.tuitionCurrency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Documents */}
      {activeTab === "documents" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">المستندات والأوراق المرفوعة</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {student.documents?.map((doc: any) => (
              <div key={doc.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{doc.title}</span>
                  <span className="text-[11px] text-slate-400">{doc.documentType?.nameAr} • إصدار {doc.version}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Payments */}
      {activeTab === "payments" && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">سندات القبض والدفعات</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {student.payments?.map((pay: any) => (
              <div key={pay.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {pay.receiptNumber} - {pay.notes || "دفعة رسمية"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(pay.paymentDate).toLocaleDateString("ar-EG")} • طريقة السداد: {pay.method}
                  </span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  +${pay.amount?.toLocaleString()} {pay.currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

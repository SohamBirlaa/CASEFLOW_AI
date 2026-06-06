


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFromBackend, HealthResponse } from "@/lib/api";
import { CaseResponse } from "@/types/case";

export default function DashboardPlaceholder() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      fetchFromBackend<HealthResponse>("/api/health"),
      fetchFromBackend<CaseResponse[]>("/api/cases/"),
    ])
      .then(([healthData, casesData]) => {
        setHealth(healthData);
        setCases(casesData);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Connection failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status !== "Closed").length;
  const pendingCases = cases.filter(
    (c) => c.status === "Waiting" || c.status === "Review"
  ).length;
  const overdueCases = cases.filter(
    (c) => c.due_date && new Date(c.due_date) < new Date() && c.status !== "Closed"
  ).length;
  const closedCases = cases.filter((c) => c.status === "Closed").length;
  const highPriorityCases = cases.filter((c) => c.priority === "High").length;

  return (
    <div className="max-w-7xl mx-auto p-6 w-full space-y-8 flex-1 mt-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to the CaseFlow AI internal operations tracking hub.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cases" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors">
            View All Cases &rarr;
          </Link>

          <div className="flex items-center space-x-2 text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
            <span className="font-medium text-slate-600">Backend Connection:</span>

            {loading && (
              <span className="text-slate-500 flex items-center">
                <span className="h-2 w-2 rounded-full bg-slate-400 mr-1.5 inline-block animate-pulse"></span>
                Checking...
              </span>
            )}

            {!loading && health && (
              <span className="text-emerald-600 font-semibold flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse"></span>
                Live (Healthy)
              </span>
            )}

            {!loading && error && (
              <span className="text-rose-600 font-semibold flex items-center">
                <span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5 inline-block"></span>
                Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Cases", val: loading ? "-" : totalCases.toString(), color: "border-l-blue-500" },
          { label: "Active Cases", val: loading ? "-" : activeCases.toString(), color: "border-l-indigo-500" },
          { label: "Pending Cases", val: loading ? "-" : pendingCases.toString(), color: "border-l-amber-500" },
          { label: "Overdue Cases", val: loading ? "-" : overdueCases.toString(), color: "border-l-rose-500" },
          { label: "Closed Cases", val: loading ? "-" : closedCases.toString(), color: "border-l-slate-500" },
          { label: "High Priority", val: loading ? "-" : highPriorityCases.toString(), color: "border-l-red-600" },
        ].map((card, i) => (
          <div key={i} className={`bg-white border border-slate-200 border-l-4 ${card.color} rounded-xl p-4 shadow-sm`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{card.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
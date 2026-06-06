"use client";

import { useEffect, useState } from "react";
import { fetchFromBackend, HealthResponse } from "@/lib/api";

export default function DashboardPlaceholder() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFromBackend<HealthResponse>("/api/health")
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Connection failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 w-full space-y-8 flex-1 mt-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to the CaseFlow AI internal operations tracking hub.
          </p>
        </div>

        {/* Live Connectivity Tracker Status Component */}
        <div className="flex items-center space-x-2 text-sm bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
          <span className="font-medium text-slate-600">Backend Connection:</span>
          {loading && (
            <span className="text-slate-500 animate-pulse flex items-center">
              <span className="h-2 w-2 rounded-full bg-slate-400 mr-1.5 inline-block"></span> Checking...
            </span>
          )}
          {!loading && health && (
            <span className="text-emerald-600 font-semibold flex items-center">
              {/* Updated to animate-pulse per approval */}
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 inline-block animate-pulse"></span> Live (Healthy)
            </span>
          )}
          {!loading && error && (
            <span className="text-rose-600 font-semibold flex items-center">
              <span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5 inline-block"></span> Offline
            </span>
          )}
        </div>
      </div>

      {/* Target Metric Cards Placeholder Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Cases", val: "0", color: "border-l-blue-500" },
          { label: "Active Cases", val: "0", color: "border-l-indigo-500" },
          { label: "Pending Cases", val: "0", color: "border-l-amber-500" },
          { label: "Overdue Cases", val: "0", color: "border-l-rose-500" },
          { label: "Closed Cases", val: "0", color: "border-l-slate-500" },
          { label: "High Priority", val: "0", color: "border-l-red-600" },
        ].map((card, i) => (
          <div key={i} className={`bg-white border border-slate-200 border-l-4 ${card.color} rounded-xl p-4 shadow-sm`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{card.label}</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{card.val}</div>
          </div>
        ))}
      </div>

      {/* Development Environment Verification Card Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
        <h3 className="text-base font-semibold text-white mb-2">Phase 1 Infrastructure Verification Log</h3>
        <p className="text-xs text-slate-400 mb-4">
          Review configuration details to verify communication tunnels.
        </p>
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs space-y-1.5 border border-slate-800 text-slate-400 overflow-x-auto">
          <div><span className="text-indigo-400">root_status:</span> "Phase 1 - Frontend Environment successfully established."</div>
          <div><span className="text-indigo-400">configured_endpoint:</span> "{process.env.NEXT_PUBLIC_API_URL || 'Fallback Default'}"</div>
          <div>
            <span className="text-indigo-400">api_payload_test:</span>{" "}
            {health ? (
              <span className="text-emerald-400">{JSON.stringify(health)}</span>
            ) : error ? (
              <span className="text-rose-400">"Failed to parse payload. Check backend engine status."</span>
            ) : (
              <span>"Awaiting payload response..."</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
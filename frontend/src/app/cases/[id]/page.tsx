"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { CaseResponse } from "@/types/case";

export default function CaseDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Unwrap the Promise to safely extract the dynamic ID
  const { id } = use(params);
  
  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCase = async () => {
      try {
        const data = await fetchFromBackend<CaseResponse>(`/api/cases/${id}`);
        setCaseData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case details.");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case details...</div>;
  }

  if (error || !caseData) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-6 text-center space-y-4">
        <div className="p-8 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">{error || "Case not found."}</div>
        <Link href="/cases" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Return to Case Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              #{caseData.id}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 text-xs font-medium uppercase tracking-wider">
              {caseData.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Client: <span className="font-medium text-slate-700">{caseData.client_name}</span></p>
        </div>
        <div className="flex space-x-3">
          <Link href="/cases" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            Back to List
          </Link>
          <Link href={`/cases/${caseData.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Edit Case
          </Link>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Operational Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Case Type</p>
              <p className="font-medium text-slate-900">{caseData.case_type || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Priority</p>
              <p className={`font-medium ${
                caseData.priority === 'High' ? 'text-rose-600' :
                caseData.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
              }`}>{caseData.priority}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Assigned Owner</p>
              <p className="font-medium text-slate-900">{caseData.assigned_owner || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Due Date</p>
              <p className="font-medium text-slate-900">
                {caseData.due_date ? new Date(caseData.due_date).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">System Audit</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Created At</span>
              <span className="font-medium text-slate-700">{new Date(caseData.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Updated</span>
              <span className="font-medium text-slate-700">
                {caseData.updated_at ? new Date(caseData.updated_at).toLocaleString() : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Archive Status</span>
              <span className="font-medium text-slate-700">{caseData.is_archived ? "Archived" : "Active"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Internal Notes</h3>
        {caseData.notes ? (
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.notes}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">No notes have been added to this case.</p>
        )}
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { CaseResponse, DocumentResponse, AIAnalysisResponse } from "@/types/case";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis State
  const [caseAnalysis, setCaseAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzingCase, setIsAnalyzingCase] = useState<boolean>(false);
  
  const [documentAnalyses, setDocumentAnalyses] = useState<Record<number, AIAnalysisResponse>>({});
  const [analyzingDocs, setAnalyzingDocs] = useState<Record<number, boolean>>({});

  const loadData = async () => {
    try {
      const [caseRes, docRes] = await Promise.all([
        fetchFromBackend<CaseResponse>(`/api/cases/${id}`),
        fetchFromBackend<DocumentResponse[]>(`/api/cases/${id}/documents/`)
      ]);
      setCaseData(caseRes);
      setDocuments(docRes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${docId}/download`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Failed to download document.");
    }
  };

  const handleArchiveDocument = async (docId: number) => {
    if (!window.confirm("Are you sure you want to archive this document?")) return;
    try {
      await fetchFromBackend(`/api/documents/${docId}/archive`, { method: "PATCH" });
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive document.");
    }
  };

  // Phase 4: AI Triggers
  const handleAnalyzeCase = async () => {
    setIsAnalyzingCase(true);
    try {
      const result = await fetchFromBackend<AIAnalysisResponse>(`/api/cases/${id}/analyze`, { method: "POST" });
      setCaseAnalysis(result);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to analyze case.");
    } finally {
      setIsAnalyzingCase(false);
    }
  };

  const handleAnalyzeDocument = async (docId: number) => {
    setAnalyzingDocs((prev) => ({ ...prev, [docId]: true }));
    try {
      const result = await fetchFromBackend<AIAnalysisResponse>(`/api/documents/${docId}/analyze`, { method: "POST" });
      setDocumentAnalyses((prev) => ({ ...prev, [docId]: result }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to analyze document.");
    } finally {
      setAnalyzingDocs((prev) => ({ ...prev, [docId]: false }));
    }
  };

  // Reusable component for rendering AI Insight fields
  const renderAIField = (label: string, value?: string | null) => {
    if (!value || value === "None identified") return null;
    return (
      <div className="mb-3">
        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">{label}</h4>
        <p className="text-sm text-indigo-900/80 whitespace-pre-wrap">{value}</p>
      </div>
    );
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case...</div>;

  if (error || !caseData) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-6 text-center space-y-4">
        <div className="p-8 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">{error || "Case not found."}</div>
        <Link href="/cases" className="text-blue-600 hover:underline text-sm font-medium">&larr; Return to Case Directory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">#{caseData.id}</span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 text-xs font-medium uppercase tracking-wider">{caseData.status}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
          <p className="text-sm text-slate-500 mt-1">Client: <span className="font-medium text-slate-700">{caseData.client_name}</span></p>
        </div>
        <div className="flex space-x-3">
          <Link href="/cases" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Back to List</Link>
          <Link href={`/cases/${caseData.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Edit Case</Link>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Operational Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500 mb-1">Case Type</p><p className="font-medium text-slate-900">{caseData.case_type || "—"}</p></div>
            <div><p className="text-slate-500 mb-1">Priority</p><p className="font-medium text-slate-900">{caseData.priority}</p></div>
            <div><p className="text-slate-500 mb-1">Assigned Owner</p><p className="font-medium text-slate-900">{caseData.assigned_owner || "Unassigned"}</p></div>
            <div><p className="text-slate-500 mb-1">Due Date</p><p className="font-medium text-slate-900">{caseData.due_date ? formatDateTime(caseData.due_date, true) : "—"}</p></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">System Audit</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Created At</span><span className="font-medium text-slate-700">{formatDateTime(caseData.created_at)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Last Updated</span><span className="font-medium text-slate-700">{formatDateTime(caseData.updated_at)}</span></div>
          </div>
        </div>
      </div>

      {/* AI Case Brief Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">AI Case Brief</h3>
          <button 
            onClick={handleAnalyzeCase}
            disabled={isAnalyzingCase || documents.length === 0}
            className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-100 disabled:opacity-50 flex items-center"
          >
            {isAnalyzingCase ? "Generating Brief..." : "Analyze Complete Case"}
          </button>
        </div>
        
        {documents.length === 0 && !caseAnalysis && (
          <p className="text-sm text-slate-400 italic">Upload documents to enable AI case analysis.</p>
        )}

        {caseAnalysis && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="mb-4 inline-block bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded">
               AI Draft — Requires Human Review
            </div>
            {renderAIField("Executive Summary", caseAnalysis.summary)}
            {renderAIField("Parties Involved", caseAnalysis.parties)}
            {renderAIField("Key Dates", caseAnalysis.key_dates)}
            {renderAIField("Obligations", caseAnalysis.obligations)}
            {renderAIField("Action Items", caseAnalysis.action_items)}
            {renderAIField("Risks & Warnings", caseAnalysis.risks)}
            <div className="text-[10px] text-indigo-400 mt-4 pt-2 border-t border-indigo-100">
              Analyzed at: {formatDateTime(caseAnalysis.analyzed_at)}
            </div>
          </div>
        )}
      </div>

      {/* Internal Notes */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Internal Notes</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.notes || "No notes added."}</p>
      </div>

      {/* Case Documents (Read-Only List) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-4 mb-4">Case Documents</h3>

        <div className="space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No documents attached.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                {/* Document Header Row */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-800 block mb-0.5">{doc.filename}</span>
                    <span className="text-xs text-slate-500">
                      {(doc.file_size_bytes / 1024).toFixed(1)} KB • Uploaded {formatDateTime(doc.uploaded_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 w-full lg:w-auto">
                    <button 
                      onClick={() => handleDownload(doc.id, doc.filename)} 
                      className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => handleAnalyzeDocument(doc.id)}
                      disabled={analyzingDocs[doc.id]}
                      className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 disabled:opacity-50"
                    >
                      {analyzingDocs[doc.id] ? "Analyzing..." : "Analyze AI"}
                    </button>
                    <button 
                      onClick={() => handleArchiveDocument(doc.id)} 
                      className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                    >
                      Archive
                    </button>
                  </div>
                </div>

                {/* AI Document Insight Expansion */}
                {documentAnalyses[doc.id] && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                      <div className="mb-3 inline-block bg-indigo-100 text-indigo-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                         AI Draft — Requires Human Review
                      </div>
                      {renderAIField("Summary", documentAnalyses[doc.id].summary)}
                      {renderAIField("Action Items", documentAnalyses[doc.id].action_items)}
                      {renderAIField("Risks", documentAnalyses[doc.id].risks)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
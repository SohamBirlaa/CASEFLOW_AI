
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { CaseResponse, CaseStatus, CasePriority, CaseUpdate, DocumentResponse } from "@/types/case";

const MAX_UPLOAD_SIZE_MB = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File upload and document state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);

  const [formData, setFormData] = useState<CaseUpdate>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch both case details and existing documents in parallel
        const [caseData, docsData] = await Promise.all([
          fetchFromBackend<CaseResponse>(`/api/cases/${id}`),
          fetchFromBackend<DocumentResponse[]>(`/api/cases/${id}/documents/`)
        ]);

        setFormData({
          title: caseData.title,
          client_name: caseData.client_name,
          case_type: caseData.case_type || "",
          priority: caseData.priority,
          assigned_owner: caseData.assigned_owner || "",
          status: caseData.status,
          notes: caseData.notes || "",
          due_date: caseData.due_date ? new Date(caseData.due_date).toISOString().split('T')[0] : "",
        });
        
        setDocuments(docsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      alert(`File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit.`);
      e.target.value = ""; 
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

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
      alert("Failed to download document from server.");
    }
  };

  const handleArchiveDocument = async (docId: number) => {
    if (!window.confirm("Are you sure you want to archive this document? It will be removed from this view.")) return;
    
    try {
      await fetchFromBackend(`/api/documents/${docId}/archive`, { method: "PATCH" });
      // Remove from local React state immediately
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive document.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = {
      ...formData,
      due_date: formData.due_date === "" ? null : formData.due_date,
    };

    try {
      // 1. Update Case Details
      await fetchFromBackend(`/api/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify(submissionData),
      });

      // 2. Upload Document (If selected)
      if (selectedFile) {
        const docFormData = new FormData();
        docFormData.append("file", selectedFile);
        
        await fetchFromBackend(`/api/cases/${id}/documents/`, {
          method: "POST",
          body: docFormData,
          isFormData: true,
        });
      }

      // 3. Redirect back to View mode
      router.push(`/cases/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes or upload document.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case data...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Edit Case #{id}</h1>
        <p className="text-sm text-slate-500 mt-1">Update operational details or attach new documents.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Case Title *</label>
              <input required name="title" value={formData.title || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Client Name *</label>
              <input required name="client_name" value={formData.client_name || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Case Type</label>
              <input name="case_type" value={formData.case_type || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned Owner</label>
              <input name="assigned_owner" value={formData.assigned_owner || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select name="priority" value={formData.priority || CasePriority.MEDIUM} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value={CasePriority.LOW}>Low</option>
                <option value={CasePriority.MEDIUM}>Medium</option>
                <option value={CasePriority.HIGH}>High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select name="status" value={formData.status || CaseStatus.NEW} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value={CaseStatus.NEW}>New</option>
                <option value={CaseStatus.IN_PROGRESS}>In Progress</option>
                <option value={CaseStatus.WAITING}>Waiting</option>
                <option value={CaseStatus.REVIEW}>Review</option>
                <option value={CaseStatus.CLOSED}>Closed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Due Date</label>
              <input type="date" name="due_date" value={formData.due_date as string || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Operational Notes</label>
            <textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={5} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 block mt-2">Attach Additional Document (Optional)</label>
            <p className="text-xs text-slate-500 mb-2">Upload a new PDF or TXT file to this case.</p>
            <input type="file" onChange={handleFileChange} accept=".pdf,.txt" className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600 bg-slate-50" />
          </div>

          {/* Existing Documents Section */}
          {documents.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-sm font-medium text-slate-700 block mt-2">Existing Documents</label>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-200 transition-colors gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-800 block mb-0.5">{doc.filename}</span>
                      <span className="text-xs text-slate-500">
                        {(doc.file_size_bytes / 1024).toFixed(1)} KB • Uploaded {formatDateTime(doc.uploaded_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => handleDownload(doc.id, doc.filename)} 
                        className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
                      >
                        Download
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleArchiveDocument(doc.id)} 
                        className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <Link href={`/cases/${id}`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { CaseCreate, CaseStatus, CasePriority, CaseResponse } from "@/types/case";

const MAX_UPLOAD_SIZE_MB = 10;

export default function CreateCasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<CaseCreate>({
    title: "",
    client_name: "",
    case_type: "",
    priority: CasePriority.MEDIUM,
    assigned_owner: "",
    status: CaseStatus.NEW,
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      alert(`File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit.`);
      e.target.value = ""; // Reset input
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the Case
      const createdCase = await fetchFromBackend<CaseResponse>("/api/cases/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // 2. Upload the Document (if selected)
      if (selectedFile) {
        const docFormData = new FormData();
        docFormData.append("file", selectedFile);
        
        await fetchFromBackend(`/api/cases/${createdCase.id}/documents/`, {
          method: "POST",
          body: docFormData,
          isFormData: true,
        });
      }

      // 3. Redirect to the new Case Details view
      router.push(`/cases/${createdCase.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case or upload document.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create New Case</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the details below to open a new operational case.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Case Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Acme Corp Merger Review" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Client Name *</label>
              <input required name="client_name" value={formData.client_name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Case Type</label>
              <input name="case_type" value={formData.case_type || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Compliance Audit" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned Owner</label>
              <input name="assigned_owner" value={formData.assigned_owner || ""} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Jane Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value={CasePriority.LOW}>Low</option>
                <option value={CasePriority.MEDIUM}>Medium</option>
                <option value={CasePriority.HIGH}>High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value={CaseStatus.NEW}>New</option>
                <option value={CaseStatus.IN_PROGRESS}>In Progress</option>
                <option value={CaseStatus.WAITING}>Waiting</option>
                <option value={CaseStatus.REVIEW}>Review</option>
                <option value={CaseStatus.CLOSED}>Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Operational Notes</label>
            <textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={4} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Add initial notes here..."></textarea>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 block mt-4">Initial Document (Optional)</label>
            <p className="text-xs text-slate-500 mb-2">Upload a starting PDF or TXT file for this case.</p>
            <input type="file" onChange={handleFileChange} accept=".pdf,.txt" className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-600 bg-slate-50" />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <Link href="/cases" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
              {isSubmitting ? "Creating Case..." : "Create Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
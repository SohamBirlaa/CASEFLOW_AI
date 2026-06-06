"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { CaseResponse, CaseStatus, CasePriority, CaseUpdate } from "@/types/case";

export default function EditCasePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  
  // Unwrap the Promise to safely extract the dynamic ID
  const { id } = use(params);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CaseUpdate>({});

  useEffect(() => {
    const loadCase = async () => {
      try {
        const data = await fetchFromBackend<CaseResponse>(`/api/cases/${id}`);
        setFormData({
          title: data.title,
          client_name: data.client_name,
          case_type: data.case_type || "",
          priority: data.priority,
          assigned_owner: data.assigned_owner || "",
          status: data.status,
          notes: data.notes || "",
          due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load case data.");
      } finally {
        setLoading(false);
      }
    };

    loadCase();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await fetchFromBackend(`/api/cases/${id}`, {
        method: "PUT",
        body: JSON.stringify(submissionData),
      });
      router.push(`/cases/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update case.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case data...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Edit Case #{id}</h1>
        <p className="text-sm text-slate-500 mt-1">Update operational details below.</p>
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

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
            <Link href={`/cases/${id}`} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
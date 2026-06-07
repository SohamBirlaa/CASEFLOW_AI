// // "use client";

// // import { useEffect, useState, use } from "react";
// // import Link from "next/link";
// // import { fetchFromBackend } from "@/lib/api";
// // import { CaseResponse } from "@/types/case";

// // function formatDateTime(value?: string | null) {
// //   if (!value) return "Never";

// //   return new Date(value + "Z").toLocaleString("en-IN", {
// //     timeZone: "Asia/Kolkata",
// //     dateStyle: "medium",
// //     timeStyle: "short",
// //   });
// // }

// // export default function CaseDetailsPage({ 
// //   params 
// // }: { 
// //   params: Promise<{ id: string }> 
// // }) {
// //   // Unwrap the Promise to safely extract the dynamic ID
// //   const { id } = use(params);
  
// //   const [caseData, setCaseData] = useState<CaseResponse | null>(null);
// //   const [loading, setLoading] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     const loadCase = async () => {
// //       try {
// //         const data = await fetchFromBackend<CaseResponse>(`/api/cases/${id}`);
// //         setCaseData(data);
// //         setError(null);
// //       } catch (err) {
// //         setError(err instanceof Error ? err.message : "Failed to load case details.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadCase();
// //   }, [id]);

// //   if (loading) {
// //     return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case details...</div>;
// //   }

// //   if (error || !caseData) {
// //     return (
// //       <div className="max-w-4xl mx-auto p-6 mt-6 text-center space-y-4">
// //         <div className="p-8 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">{error || "Case not found."}</div>
// //         <Link href="/cases" className="text-blue-600 hover:underline text-sm font-medium">
// //           &larr; Return to Case Directory
// //         </Link>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-5xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
// //       {/* Header and Actions */}
// //       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm gap-4">
// //         <div>
// //           <div className="flex items-center space-x-3 mb-1">
// //             <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
// //               #{caseData.id}
// //             </span>
// //             <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 text-xs font-medium uppercase tracking-wider">
// //               {caseData.status}
// //             </span>
// //           </div>
// //           <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
// //           <p className="text-sm text-slate-500 mt-1">Client: <span className="font-medium text-slate-700">{caseData.client_name}</span></p>
// //         </div>
// //         <div className="flex space-x-3">
// //           <Link href="/cases" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
// //             Back to List
// //           </Link>
// //           <Link href={`/cases/${caseData.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
// //             Edit Case
// //           </Link>
// //         </div>
// //       </div>

// //       {/* Metadata Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
// //           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Operational Details</h3>
// //           <div className="grid grid-cols-2 gap-4 text-sm">
// //             <div>
// //               <p className="text-slate-500 mb-1">Case Type</p>
// //               <p className="font-medium text-slate-900">{caseData.case_type || "—"}</p>
// //             </div>
// //             <div>
// //               <p className="text-slate-500 mb-1">Priority</p>
// //               <p className={`font-medium ${
// //                 caseData.priority === 'High' ? 'text-rose-600' :
// //                 caseData.priority === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
// //               }`}>{caseData.priority}</p>
// //             </div>
// //             <div>
// //               <p className="text-slate-500 mb-1">Assigned Owner</p>
// //               <p className="font-medium text-slate-900">{caseData.assigned_owner || "Unassigned"}</p>
// //             </div>
// //             <div>
// //               <p className="text-slate-500 mb-1">Due Date</p>
// //               <p className="font-medium text-slate-900">
// //                 {caseData.due_date ? new Date(caseData.due_date).toLocaleDateString() : "—"}
// //               </p>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
// //           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">System Audit</h3>
// //           <div className="space-y-3 text-sm">
// //             <div className="flex justify-between">
// //               <span className="text-slate-500">Created At</span>
// //               <span className="font-medium text-slate-700">{formatDateTime(caseData.created_at)}</span>
// //             </div>
// //             <div className="flex justify-between">
// //               <span className="text-slate-500">Last Updated</span>
// //               <span className="font-medium text-slate-700">
// //               {formatDateTime(caseData.updated_at)}
// //               </span>
// //             </div>
// //             <div className="flex justify-between">
// //               <span className="text-slate-500">Archive Status</span>
// //               <span className="font-medium text-slate-700">{caseData.is_archived ? "Archived" : "Active"}</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Notes Section */}
// //       <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
// //         <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Internal Notes</h3>
// //         {caseData.notes ? (
// //           <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.notes}</p>
// //         ) : (
// //           <p className="text-sm text-slate-400 italic">No notes have been added to this case.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState, use, useRef } from "react";
// import Link from "next/link";
// import { fetchFromBackend } from "@/lib/api";
// import { CaseResponse, DocumentResponse } from "@/types/case";

// function formatDateTime(value?: string | null) {
//   if (!value) return "Never";

//   return new Date(value + "Z").toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// }

// const MAX_UPLOAD_SIZE_MB = 10;

// export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = use(params);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [caseData, setCaseData] = useState<CaseResponse | null>(null);
//   const [documents, setDocuments] = useState<DocumentResponse[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const loadData = async () => {
//     try {
//       const [caseRes, docRes] = await Promise.all([
//         fetchFromBackend<CaseResponse>(`/api/cases/${id}`),
//         fetchFromBackend<DocumentResponse[]>(`/api/cases/${id}/documents/`)
//       ]);
//       setCaseData(caseRes);
//       setDocuments(docRes);
//       setError(null);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { loadData(); }, [id]);

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
//       alert(`File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit.`);
//       return;
//     }

//     setUploading(true);
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       await fetchFromBackend(`/api/cases/${id}/documents/`, {
//         method: "POST",
//         body: formData,
//         isFormData: true,
//       });
//       await loadData();
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Upload failed.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading case...</div>;

//   if (error || !caseData) {
//     return (
//       <div className="max-w-4xl mx-auto p-6 mt-6 text-center space-y-4">
//         <div className="p-8 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">{error || "Case not found."}</div>
//         <Link href="/cases" className="text-blue-600 hover:underline text-sm font-medium">&larr; Return to Case Directory</Link>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm gap-4">
//         <div>
//           <div className="flex items-center space-x-3 mb-1">
//             <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">#{caseData.id}</span>
//             <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200 text-xs font-medium uppercase tracking-wider">{caseData.status}</span>
//           </div>
//           <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
//           <p className="text-sm text-slate-500 mt-1">Client: <span className="font-medium text-slate-700">{caseData.client_name}</span></p>
//         </div>
//         <div className="flex space-x-3">
//           <Link href="/cases" className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Back to List</Link>
//           <Link href={`/cases/${caseData.id}/edit`} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Edit Case</Link>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
//           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Operational Details</h3>
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div><p className="text-slate-500 mb-1">Case Type</p><p className="font-medium text-slate-900">{caseData.case_type || "—"}</p></div>
//             <div><p className="text-slate-500 mb-1">Priority</p><p className="font-medium text-slate-900">{caseData.priority}</p></div>
//             <div><p className="text-slate-500 mb-1">Assigned Owner</p><p className="font-medium text-slate-900">{caseData.assigned_owner || "Unassigned"}</p></div>
//             <div><p className="text-slate-500 mb-1">Due Date</p><p className="font-medium text-slate-900">{caseData.due_date ? new Date(caseData.due_date).toLocaleDateString() : "—"}</p></div>
//           </div>
//         </div>

//         <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
//           <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">System Audit</h3>
//           <div className="space-y-3 text-sm">
//             <div className="flex justify-between"><span className="text-slate-500">Created At</span><span className="font-medium text-slate-700">{formatDateTime(caseData.created_at)}</span></div>
//             <div className="flex justify-between"><span className="text-slate-500">Last Updated</span><span className="font-medium text-slate-700">{formatDateTime(caseData.updated_at)}</span></div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
//         <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Internal Notes</h3>
//         <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.notes || "No notes added."}</p>
//       </div>

//       {/* Added Document Section */}
//       <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
//         <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-4 mb-4">Case Documents</h3>
//         <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
//           <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".pdf,.txt" className="text-sm" />
//           {uploading && <span className="text-sm text-blue-600 animate-pulse">Uploading...</span>}
//         </div>
//         <div className="space-y-2">
//           {documents.map((doc) => (
//             <div key={doc.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
//               <span className="text-sm font-medium text-slate-700">{doc.filename}</span>
//               <span className="text-xs text-slate-400">{(doc.file_size_bytes / 1024).toFixed(1)} KB • {new Date(doc.uploaded_at).toLocaleDateString()}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



// frontend/src/app/cases/[id]/page.tsx

"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { formatDateTime } from "@/lib/date";
import { CaseResponse, DocumentResponse } from "@/types/case";

const MAX_UPLOAD_SIZE_MB = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function CaseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Document Upload State
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  
  // General Page Error
  const [error, setError] = useState<string | null>(null);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentError(null);
    setUploadSuccess(false);

    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      setDocumentError(`File exceeds ${MAX_UPLOAD_SIZE_MB}MB limit.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetchFromBackend(`/api/cases/${id}/documents/`, {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      await loadData(); // Refresh list
      setUploadSuccess(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: number, filename: string) => {
    try {
      // Use native fetch to securely stream the binary payload directly into a Blob
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
    if (!window.confirm("Are you sure you want to archive this document? It will be removed from this active view.")) return;
    
    try {
      await fetchFromBackend(`/api/documents/${docId}/archive`, { method: "PATCH" });
      // Dynamically remove the archived document from the local React state
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive document.");
    }
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
      {/* Header and Actions */}
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

      {/* Metadata Grid */}
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

      {/* Notes Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mb-4">Internal Notes</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{caseData.notes || "No notes added."}</p>
      </div>

      {/* Document Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-4 mb-4">Case Documents</h3>
        
        {/* Upload Status Feedback */}
        {documentError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm">{documentError}</div>}
        {uploadSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm">Document uploaded successfully.</div>}

        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".pdf,.txt" className="text-sm text-slate-600" />
          {uploading && <span className="text-sm text-blue-600 font-medium animate-pulse">Uploading...</span>}
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No documents attached.</p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors gap-4">
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
                    disabled 
                    title="Coming Soon in Phase 4"
                    className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-not-allowed"
                  >
                    Analyze AI
                  </button>
                  <button 
                    onClick={() => handleArchiveDocument(doc.id)} 
                    className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-100"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
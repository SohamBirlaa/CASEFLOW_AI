// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { fetchFromBackend } from "@/lib/api";
// import { CaseResponse } from "@/types/case";

// export default function CasesListPage() {
//   const [cases, setCases] = useState<CaseResponse[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadCases = async () => {
//       try {
//         const data = await fetchFromBackend<CaseResponse[]>("/api/cases/");
//         setCases(data);
//         setError(null);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to load cases.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadCases();
//   }, []);

//   return (
//     <div className="max-w-7xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
//       <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Case Directory</h1>
//           <p className="text-sm text-slate-500 mt-1">View and manage active operational cases.</p>
//         </div>
//         <Link 
//           href="/cases/new" 
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//         >
//           + Create New Case
//         </Link>
//       </div>

//       <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center text-slate-500 animate-pulse">Loading cases...</div>
//         ) : error ? (
//           <div className="p-8 text-center text-rose-600 bg-rose-50">{error}</div>
//         ) : cases.length === 0 ? (
//           <div className="p-12 text-center flex flex-col items-center">
//             <div className="text-slate-400 mb-2">No active cases found.</div>
//             <Link href="/cases/new" className="text-blue-600 hover:underline text-sm">
//               Create your first case
//             </Link>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
//                   <th className="p-4">Case ID</th>
//                   <th className="p-4">Title</th>
//                   <th className="p-4">Client</th>
//                   <th className="p-4">Status</th>
//                   <th className="p-4">Priority</th>
//                   <th className="p-4">Owner</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-sm">
//                 {cases.map((c) => (
//                   <tr key={c.id} className="hover:bg-slate-50 transition-colors">
//                     <td className="p-4 font-mono text-slate-500">#{c.id}</td>
//                     <td className="p-4 font-medium text-slate-900">{c.title}</td>
//                     <td className="p-4 text-slate-600">{c.client_name}</td>
//                     <td className="p-4">
//                       <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium">
//                         {c.status}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
//                         c.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
//                         c.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
//                         'bg-emerald-50 text-emerald-700 border-emerald-200'
//                       }`}>
//                         {c.priority}
//                       </span>
//                     </td>
//                     <td className="p-4 text-slate-600">{c.assigned_owner || "Unassigned"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { CaseResponse } from "@/types/case";

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await fetchFromBackend<CaseResponse[]>("/api/cases/");
        setCases(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases.");
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  const handleArchive = async (id: number) => {
    if (!window.confirm("Are you sure you want to archive this case? It will be removed from active views.")) {
      return;
    }

    try {
      await fetchFromBackend(`/api/cases/${id}/archive`, { method: "PATCH" });
      // Remove the archived case from local state immediately
      setCases((prevCases) => prevCases.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to archive case.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 w-full space-y-6 flex-1 mt-6">
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case Directory</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage active operational cases.</p>
        </div>
        <Link 
          href="/cases/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Create New Case
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">Loading cases...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50">{error}</div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="text-slate-400 mb-2">No active cases found.</div>
            <Link href="/cases/new" className="text-blue-600 hover:underline text-sm">
              Create your first case
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-500">#{c.id}</td>
                    <td className="p-4 font-medium text-slate-900">{c.title}</td>
                    <td className="p-4 text-slate-600">{c.client_name}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                        c.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        c.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{c.assigned_owner || "Unassigned"}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/cases/${c.id}`} className="text-blue-600 hover:underline text-xs font-medium">
                        View
                      </Link>
                      <Link href={`/cases/${c.id}/edit`} className="text-slate-600 hover:underline text-xs font-medium">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleArchive(c.id)}
                        className="text-rose-600 hover:underline text-xs font-medium"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
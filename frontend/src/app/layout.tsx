import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseFlow AI - Operations Console",
  description: "Internal Case Management and Document Operations Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col">
        {/* Simple Business Header Shell */}
        <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                CaseFlow AI
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 font-medium px-2 py-0.5 rounded border border-slate-700">
                Internal Ops Console
              </span>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              MVP Environment
            </div>
          </div>
        </header>

        {/* Global Page Injection Boundary */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Simple System Footer */}
        <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} CaseFlow AI. Built for operational efficiency.
        </footer>
      </body>
    </html>
  );
}
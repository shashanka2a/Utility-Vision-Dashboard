"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown, Loader2, Printer } from "lucide-react";
import { downloadElementAsMultiPagePdf, sanitizePdfFileName } from "@/lib/daily-report-pdf";

function buildReportApiQuery(sp: URLSearchParams): string {
  const p = new URLSearchParams(sp.toString());
  p.delete("download");
  return p.toString();
}

function FullReportInner() {
  const sp = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const autoTriggered = useRef(false);

  const reportQuery = buildReportApiQuery(sp);
  const reportUrl = `/api/reports/daily?${reportQuery}`;

  const fileBase = sanitizePdfFileName(
    `${sp.get("date") || "report"}-${sp.get("project_id") || sp.get("project") || "project"}`
  );

  const downloadPdf = useCallback(async () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const body = doc?.body;
    if (!doc || !body) {
      setErr("Report is still loading. Wait a moment and try again.");
      return;
    }

    // Export only the report sheet; capturing <body> includes preview chrome/whitespace.
    const reportRoot = (doc.querySelector(".report-sheet") as HTMLElement | null) ?? body;

    setBusy(true);
    setErr(null);
    try {
      await downloadElementAsMultiPagePdf(reportRoot, `daily-report-${fileBase}.pdf`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not generate PDF.");
    } finally {
      setBusy(false);
    }
  }, [fileBase]);

  const handlePrint = () => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  const onIframeLoad = useCallback(() => {
    if (sp.get("download") !== "1" || autoTriggered.current) return;
    autoTriggered.current = true;
    window.setTimeout(() => {
      void downloadPdf();
    }, 600);
  }, [sp, downloadPdf]);

  useEffect(() => {
    autoTriggered.current = false;
  }, [reportUrl]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 5.5rem)" }}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 z-10">
        <Link
          href="/reports"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100"
        >
          ← Back to reports
        </Link>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <button
          type="button"
          onClick={() => void downloadPdf()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F44336] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#E53935] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Download PDF
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border-b border-red-100 px-3 py-2 flex-shrink-0">
          {err}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={reportUrl}
        onLoad={onIframeLoad}
        className="flex-1 w-full min-h-0 border-0 bg-gray-100"
        title="Daily report"
      />
    </div>
  );
}

export default function FullReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16 text-gray-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#FF6633]" />
          Loading report…
        </div>
      }
    >
      <FullReportInner />
    </Suspense>
  );
}

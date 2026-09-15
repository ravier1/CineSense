"use client";

import { useState } from "react";

type Summary = { counts: Record<string, number>; files: string[]; records: Array<{ title: string; kind: string; category: string }> };

export function TraktImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function preview() {
    if (!file) return;
    setBusy(true); setMessage(""); setSummary(null);
    const data = new FormData(); data.append("file", file);
    const response = await fetch("/api/v1/imports/trakt", { method: "POST", body: data });
    const result = await response.json() as { summary?: Summary; error?: { message: string } };
    if (!response.ok) setMessage(result.error?.message ?? "The import could not be read.");
    else setSummary(result.summary ?? null);
    setBusy(false);
  }

  return <div className="import-form"><label className="upload-box"><span>{file ? file.name : "Choose your Trakt ZIP or JSON export"}</span><input type="file" accept=".zip,.json,application/zip,application/json" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label><button className="button primary auth-submit" disabled={!file || busy} onClick={preview}>{busy ? "Reading export…" : "Preview import"}</button>{message && <p className="form-message">{message}</p>}{summary && <div className="import-summary"><strong>Ready to import</strong><p>{summary.counts.history ?? 0} history entries · {summary.counts.ratings ?? 0} ratings · {summary.counts.watchlist ?? 0} watchlist items · {summary.records.length} detected records</p><small>{summary.files.length} JSON files read. We’ll match titles to TMDB before saving them.</small></div>}</div>;
}

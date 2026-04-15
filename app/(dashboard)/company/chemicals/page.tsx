"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";

type Row = { id: string; application_type: string; name: string; unit: string | null; sort_order: number };

export default function CompanyChemicalsPage() {
  const [spraying, setSpraying] = useState<Row[]>([]);
  const [wicking, setWicking] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpray, setNewSpray] = useState({ name: "", unit: "" });
  const [newWick, setNewWick] = useState({ name: "", unit: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/chemical-presets");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setSpraying(Array.isArray(data.spraying) ? data.spraying : []);
      setWicking(Array.isArray(data.wicking) ? data.wicking : []);
    } catch {
      setSpraying([]);
      setWicking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addRow = async (application_type: "spraying" | "wicking", name: string, unit: string) => {
    const n = name.trim();
    if (!n) return;
    setSaving(true);
    try {
      const res = await fetch("/api/company/chemical-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_type,
          name: n,
          unit: unit.trim() || null,
        }),
      });
      if (res.ok) {
        if (application_type === "spraying") {
          setNewSpray({ name: "", unit: "" });
        } else {
          setNewWick({ name: "", unit: "" });
        }
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const patchRow = async (id: string, patch: { name?: string; unit?: string | null }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/company/chemical-presets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setSpraying((prev) => prev.map((r) => (r.id === id ? updated : r)));
        setWicking((prev) => prev.map((r) => (r.id === id ? updated : r)));
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/company/chemical-presets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpraying((prev) => prev.filter((r) => r.id !== id));
        setWicking((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setSaving(false);
    }
  };

  const renderPanel = (
    title: string,
    subtitle: string,
    rows: Row[],
    application_type: "spraying" | "wicking",
    newVals: { name: string; unit: string },
    setNewVals: (v: { name: string; unit: string }) => void
  ) => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/80">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Chemical name</label>
          <input
            value={newVals.name}
            onChange={(e) => setNewVals({ ...newVals, name: e.target.value })}
            placeholder='e.g. Glyphosate'
            disabled={saving}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="w-28">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Unit</label>
          <input
            value={newVals.unit}
            onChange={(e) => setNewVals({ ...newVals, unit: e.target.value })}
            placeholder="e.g. GAL"
            disabled={saving}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={saving || !newVals.name.trim()}
          onClick={() => void addRow(application_type, newVals.name, newVals.unit)}
          className="p-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          aria-label="Add chemical"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">No items yet. Add above.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-[1fr_100px_auto] gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            <span>Name</span>
            <span className="text-center">Unit</span>
            <span className="w-10" />
          </div>
          {rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_100px_auto] gap-2 px-4 py-2.5 items-center hover:bg-gray-50/80">
              <input
                defaultValue={row.name}
                key={`${row.id}-n-${row.name}`}
                disabled={saving}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && v !== row.name) void patchRow(row.id, { name: v });
                }}
                className="rounded border border-transparent hover:border-gray-200 focus:border-[#FF6633] focus:ring-1 focus:ring-[#FF6633] px-2 py-1.5 text-sm"
              />
              <input
                defaultValue={row.unit ?? ""}
                key={`${row.id}-u-${row.unit}`}
                disabled={saving}
                className="text-center rounded border border-transparent hover:border-gray-200 focus:border-[#FF6633] focus:ring-1 focus:ring-[#FF6633] px-2 py-1.5 text-sm"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  const prev = row.unit ?? "";
                  if (v !== prev) void patchRow(row.id, { unit: v === "" ? null : v });
                }}
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => void deleteRow(row.id)}
                className="text-gray-300 hover:text-red-600 p-2 justify-self-end"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-[#FF6633]" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {renderPanel(
            "Spraying",
            "Shown when application type is Spraying.",
            spraying,
            "spraying",
            newSpray,
            setNewSpray
          )}
          {renderPanel(
            "Wicking",
            "Shown when application type is Wicking.",
            wicking,
            "wicking",
            newWick,
            setNewWick
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────

export interface AssignmentCardProps {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  status: string;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

// ── Status badge colors ────────────────────────────

function statusStyle(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "processing":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "failed":
      return "bg-red-50 text-red-700 border-red-200";
    case "pending":
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Date formatter ─────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Component ──────────────────────────────────────

export function AssignmentCard({
  id,
  title,
  assignedOn,
  dueDate,
  status,
  onView,
  onDelete,
}: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      onClick={() => onView(id)}
      className="group relative bg-white border border-[#e5e5e5] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-[#d4d4d4] hover:-translate-y-0.5"
    >
      {/* ── Header row ────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Title + status */}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-[#1a1a1a] truncate leading-snug mb-1.5">
            {title}
          </h3>
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle(status)}`}
          >
            {status === "processing" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
            )}
            {statusLabel(status)}
          </span>
        </div>

        {/* ── Three-dot menu ────────────────────────── */}
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#888888] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-colors"
            aria-label="Assignment options"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-white border border-[#e5e5e5] rounded-lg shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onView(id);
                }}
                className="w-full text-left px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="7" r="2" />
                  <path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" />
                </svg>
                View Assignment
              </button>
              <div className="h-px bg-[#e5e5e5] mx-2" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(id);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer dates ──────────────────────────── */}
      <div className="flex items-center gap-4 text-xs text-[#888888] pt-2 border-t border-[#f0f0f0]">
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1.5" y="2" width="9" height="8.5" rx="1" />
            <path d="M1.5 5h9M4 1v2M8 1v2" />
          </svg>
          Assigned {formatDate(assignedOn)}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M6 3.5v3l2 1" />
          </svg>
          Due {formatDate(dueDate)}
        </span>
      </div>
    </div>
  );
}

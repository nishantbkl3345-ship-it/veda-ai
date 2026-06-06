"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";



function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L10 3.5L17 10.5" />
      <path d="M5 9v7a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V9" />
    </svg>
  );
}

function GroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="3" />
      <circle cx="14" cy="8" r="2.5" />
      <path d="M1 17v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
      <path d="M14 11.5a3 3 0 013 3V17" />
    </svg>
  );
}

function AssignmentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="12" height="16" rx="1.5" />
      <path d="M7 6h6M7 9h6M7 12h4" />
    </svg>
  );
}

function ToolkitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2.5 5.5L18 8l-4 4 1 5.5L10 15l-5 2.5 1-5.5-4-4 5.5-.5z" />
    </svg>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M7 3v14M3 8h4M3 12h4" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 1.5v2M10 16.5v2M3.5 3.5l1.5 1.5M15 15l1.5 1.5M1.5 10h2M16.5 10h2M3.5 16.5l1.5-1.5M15 5l1.5-1.5" />
    </svg>
  );
}



interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  assignmentCount?: number;
  onCreateAssignment?: () => void;
}

export function Sidebar({ assignmentCount = 0, onCreateAssignment }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const navItems: NavItem[] = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "My Groups", href: "/groups", icon: GroupIcon },
    { label: "Assignments", href: "/assignments", icon: AssignmentIcon, badge: assignmentCount > 0 ? assignmentCount : undefined },
    { label: "AI Teacher's Toolkit", href: "/toolkit", icon: ToolkitIcon },
    { label: "My Library", href: "/library", icon: LibraryIcon },
  ];


  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">

      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold leading-none">V</span>
          </div>
          <span className="text-white text-lg font-bold tracking-tight">
            Veda<span className="text-accent">AI</span>
          </span>
        </Link>
      </div>


      <div className="px-4 pb-5">
        <button
          onClick={() => {
            onCreateAssignment?.();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Create Assignment
        </button>
      </div>


      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-white text-primary shadow-sm"
                  : "text-[#888888] hover:text-white hover:bg-white/5"
                }
              `}
            >
              <item.icon className={`flex-shrink-0 ${active ? "text-primary" : ""}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`
                  text-xs font-semibold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5
                  ${active ? "bg-accent text-white" : "bg-accent/20 text-accent"}
                `}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>


      <div className="mt-auto border-t border-white/10 px-3 pt-3 pb-4 space-y-2">

        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
            ${isActive("/settings")
              ? "bg-white text-primary shadow-sm"
              : "text-[#888888] hover:text-white hover:bg-white/5"
            }
          `}
        >
          <SettingsIcon />
          <span>Settings</span>
        </Link>


        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center flex-shrink-0 ring-2 ring-white/10">
            <span className="text-white text-xs font-bold">DP</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Delhi Public School</p>
            <p className="text-[#888888] text-xs truncate">New Delhi, India</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg"
        aria-label="Open sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>


      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />
      )}


      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 z-50 h-screen w-[240px] bg-primary flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden absolute top-4 right-3 w-8 h-8 rounded-md text-[#888888] hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}

        {sidebarContent}
      </aside>
    </>
  );
}

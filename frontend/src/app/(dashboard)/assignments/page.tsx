"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { EmptyState } from "@/components/assignments/EmptyState";

interface AssignmentResponse {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

interface AssignmentsListResponse {
  count: number;
  assignments: AssignmentResponse[];
}

export default function AssignmentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery<AssignmentsListResponse>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await api.get<AssignmentsListResponse>("/api/assignments");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const assignments = (data?.assignments ?? []).filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (id: string) => {
    router.push(`/assignments/${id}/output`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = () => {
    router.push("/assignments/create");
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[#e5e5e5] rounded-lg" />
          <div className="h-4 w-80 bg-[#e5e5e5] rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-[#e5e5e5] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Failed to load assignments</p>
          <p className="text-red-600 text-sm">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Assignments</h1>
        <p className="text-sm text-muted">
          Manage and create assignments for your classes.
        </p>
      </div>

      {(data?.count ?? 0) > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#e5e5e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-[#aaa]"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#555] bg-white border border-[#e5e5e5] rounded-lg hover:bg-[#f5f5f5] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 3h12M3 7h8M5 11h4" />
            </svg>
            Filter By
          </button>

          <button
            onClick={handleCreate}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10" />
            </svg>
            Create Assignment
          </button>
        </div>
      )}

      {assignments.length === 0 && !search ? (
        <EmptyState onCreateAssignment={handleCreate} />
      ) : assignments.length === 0 && search ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm">
            No assignments match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <AssignmentCard
              key={a._id}
              id={a._id}
              title={a.title}
              assignedOn={a.createdAt}
              dueDate={a.dueDate}
              status={a.status}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {(data?.count ?? 0) > 0 && (
        <button
          onClick={handleCreate}
          className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-accent text-white text-sm font-semibold py-3 px-6 rounded-full shadow-xl shadow-accent/30 hover:bg-accent/90 active:scale-[0.97] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Create Assignment
        </button>
      )}
    </div>
  );
}


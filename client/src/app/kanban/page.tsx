"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext, DragEndEvent, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors, useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { DashboardLayout, PageHeader } from "@/components/layout/sidebar";
import { api } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import type { ApplicationStatus, JobApplication } from "@/types";
import { STATUS_COLUMNS, STATUS_LABELS } from "@/types";

const COLUMN_COLORS: Record<string, string> = {
  Applied: "bg-[var(--color-yellow)]",
  Assessment: "bg-[var(--color-orange)]",
  Interview: "bg-[var(--color-cyan)]",
  FinalInterview: "bg-[var(--color-lime)]",
  Offer: "bg-[var(--color-lime)]",
  Rejected: "bg-[var(--color-pink)]",
};

function SortableCard({ app }: { app: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="neo-border neo-shadow-sm cursor-grab bg-white p-3 active:cursor-grabbing"
    >
      <p className="neo-heading text-xs leading-snug">{app.position}</p>
      <p className="mt-1 text-[10px] font-bold uppercase text-neutral-600">{app.companyName}</p>
    </div>
  );
}

function DroppableColumn({ status, apps }: { status: ApplicationStatus; apps: JobApplication[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const columnApps = apps.filter((a) => a.status === status);

  return (
    <div
      ref={setNodeRef}
      className={`neo-border min-w-[220px] flex-1 p-3 transition ${isOver ? "bg-[var(--color-lime)]" : COLUMN_COLORS[status] ?? "bg-white"}`}
    >
      <h3 className="neo-heading mb-3 text-xs">
        {STATUS_LABELS[status]} ({columnApps.length})
      </h3>
      <SortableContext items={columnApps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[120px] space-y-2">
          {columnApps.map((app) => <SortableCard key={app.id} app={app} />)}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanPage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: apps = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api<JobApplication[]>("/applications"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      api(`/applications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Status updated!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update status"),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const appId = active.id as string;
    let newStatus = over.id as string;

    if (!STATUS_COLUMNS.includes(newStatus as ApplicationStatus)) {
      const overApp = apps.find((a) => a.id === over.id);
      if (overApp) newStatus = overApp.status;
    }

    if (STATUS_COLUMNS.includes(newStatus as ApplicationStatus)) {
      const app = apps.find((a) => a.id === appId);
      if (app && app.status !== newStatus) {
        updateStatus.mutate({ id: appId, status: newStatus as ApplicationStatus });
      }
    }
  };

  const activeApp = apps.find((a) => a.id === activeId);

  return (
    <DashboardLayout>
      <PageHeader title="Kanban Board" subtitle="Drag cards to update application status" />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((status) => (
            <DroppableColumn key={status} status={status} apps={apps} />
          ))}
        </div>
        <DragOverlay>
          {activeApp && (
            <div className="neo-border neo-shadow bg-white p-3">
              <p className="neo-heading text-xs">{activeApp.position}</p>
              <p className="text-[10px] font-bold uppercase">{activeApp.companyName}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DashboardLayout>
  );
}

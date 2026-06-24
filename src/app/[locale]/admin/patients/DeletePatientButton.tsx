"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

type DeletePatientButtonProps = {
  patientId: string;
  patientName: string;
  onDelete: (id: string) => Promise<void>;
};

export function DeletePatientButton({ patientId, patientName, onDelete }: DeletePatientButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف حساب المريض ${patientName}؟ لا يمكن التراجع عن هذا القرار.`)) {
      startTransition(async () => {
        try {
          await onDelete(patientId);
        } catch (err) {
          console.error("Failed to delete patient:", err);
          alert("فشل حذف حساب المريض. يرجى المحاولة مرة أخرى.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="حذف الحساب"
      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

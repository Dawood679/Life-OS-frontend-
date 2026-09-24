import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteModal({
  isOpen = false,
  onClose,
  onDelete, // or onConfirm
  isDeleting = false,
  title = "Delete Item?",
  description = "This action cannot be undone.",
  confirmText = "Delete Now",
}) {
  if (!isOpen) return null;

  const handleConfirm = async (e) => {
    e?.preventDefault();
    if (typeof onDelete === "function") {
      await onDelete();
    }
  };

  const handleClose = (e) => {
    e?.preventDefault();
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-slate-200 dark:border-white/10 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp text-left transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold shadow-xs">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
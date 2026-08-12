import React from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold">
          ⚠️
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
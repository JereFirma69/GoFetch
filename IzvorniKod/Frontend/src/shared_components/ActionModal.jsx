import React from "react";

export default function ActionModal({ open, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="text-sm text-gray-700 mb-4 whitespace-pre-line">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded border border-gray-300 text-gray-700">{cancelText}</button>
          <button onClick={onConfirm} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

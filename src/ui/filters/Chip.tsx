import React from "react";

type Props = { label: string; onRemove?:()=>void; className?: string };
export default function Chip({label,onRemove,className}:Props){
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${className ?? "bg-gray-100 text-gray-800"}`}>
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:opacity-80 focus:outline-none" aria-label="Remove">
          ×
        </button>
      )}
    </span>
  );
}

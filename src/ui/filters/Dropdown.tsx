import React, {useState, useRef, useEffect} from "react";

type Props = {
  label: string;
  hint?: string; // rövid magyarázat a dropdown tetején
  children: React.ReactNode;
  rightAlign?: boolean;
  wide?: boolean;
};

export default function Dropdown({label, hint, children, rightAlign, wide}:Props){
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    function onDoc(e:MouseEvent){
      if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return ()=>document.removeEventListener("mousedown", onDoc);
  },[]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={()=>setOpen(o=>!o)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm"
      >
        <span>{label}</span>
        <svg className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`} viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-2 p-3 rounded-2xl border border-gray-200 bg-white shadow-lg ${rightAlign?"right-0":"left-0"} ${wide?"w-[380px]":"w-[280px]"}`}
        >
          {hint && <div className="text-xs text-gray-500 mb-2">{hint}</div>}
          {children}
        </div>
      )}
    </div>
  );
}

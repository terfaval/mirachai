import React, {useMemo, useState} from "react";

type Props = {
  items: string[];
  selected: string[];
  onChange: (next: string[])=>void;
  placeholder?: string;
};

export default function MultiSelectDropdown({items, selected, onChange, placeholder="Kezdj el gépelni…"}:Props){
  const [q, setQ] = useState("");
  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    return !s ? items : items.filter(it=>it.toLowerCase().includes(s));
  },[items,q]);

  function toggle(it:string){
    if(selected.includes(it)) onChange(selected.filter(x=>x!==it));
    else onChange([...selected, it]);
  }

  return (
    <div>
      <input
        className="w-full mb-2 px-3 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-gray-300"
        placeholder={placeholder}
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />
      <div className="max-h-56 overflow-auto pr-1 space-y-1">
        {filtered.map(it=>(
          <button
            key={it}
            type="button"
            onClick={()=>toggle(it)}
            className={`w-full text-left px-3 py-2 rounded-lg border ${selected.includes(it) ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50 border-gray-200"}`}
          >
            {it}
          </button>
        ))}
        {!filtered.length && <div className="text-xs text-gray-400">Nincs találat.</div>}
      </div>
    </div>
  );
}

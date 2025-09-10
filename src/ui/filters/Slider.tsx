import React from "react";

type Props = {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v:number)=>void;
  label?: string;
};

export default function Slider({min=0,max=3,step=1,value,onChange,label}:Props){
  return (
    <div className="w-full">
      {label && <div className="mb-1 text-sm text-gray-700">{label}: <span className="font-medium">{value}</span></div>}
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full accent-black"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

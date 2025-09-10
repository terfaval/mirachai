import * as React from "react";

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
};

export function Select({ value, onValueChange, children, className }: SelectProps) {
  let triggerClass = "";
  let options: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === SelectTrigger) {
      triggerClass = child.props.className || "";
    }
    if (child.type === SelectContent) {
      options = React.Children.toArray(child.props.children);
    }
  });

  return (
    <select
      className={["border rounded-md px-3 py-2 text-sm", className, triggerClass]
        .filter(Boolean)
        .join(" ")}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {options}
    </select>
  );
}

export const SelectTrigger: React.FC<{ className?: string; children?: React.ReactNode }>
  = () => null;

export const SelectValue: React.FC<{ placeholder?: string; children?: React.ReactNode }>
  = () => null;

export const SelectContent: React.FC<{ children?: React.ReactNode }>
  = ({ children }) => <>{children}</>;

export const SelectItem: React.FC<{ value: string; children?: React.ReactNode }>
  = ({ value, children }) => <option value={value}>{children}</option>;
  
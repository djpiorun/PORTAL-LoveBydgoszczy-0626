import AdSlot from "./AdSlot";

interface SidebarAdProps {
  placement: string;
  label?: string;
}

export default function SidebarAd({ placement, label = "Reklama" }: SidebarAdProps) {
  return (
    <div className="w-full">
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">{label}</div>
      <AdSlot placement={placement} className="w-full" />
    </div>
  );
}

import Link from "next/link";
import { Boxes, CircleDollarSign, LayoutDashboard, ReceiptText, Settings2, ShoppingCart, Users } from "lucide-react";

const nav=[
  ["Home","/",LayoutDashboard],
  ["Sales","/sales",ShoppingCart],
  ["Stock","/stock",Boxes],
  ["Customers","/customers",Users],
  ["Collections","/collections",CircleDollarSign],
  ["Finance","/finance",ReceiptText],
  ["Reports","/reports",ReceiptText],
  ["More","/setup",Settings2],
] as const;

export function Sidebar(){
  return <aside className="sutra-sidebar">
    <div className="mb-6 flex items-center gap-3 px-2 business-copy">
      <div className="grid size-10 place-items-center rounded-xl bg-indigo-700 text-white font-black">S</div>
      <div><div className="font-extrabold tracking-tight">SUTRA</div><div className="text-xs text-slate-500">Small Business OS</div></div>
    </div>
    <nav className="space-y-1">
      {nav.map(([label,href,Icon])=><Link key={label} href={href} className="nav-item"><Icon size={18}/><span className="nav-label">{label}</span></Link>)}
    </nav>
  </aside>;
}

export function MobileActionBar(){
  return <nav className="mobile-action-bar">
    {nav.slice(0,5).map(([label,href,Icon])=><Link key={label} href={href} className="mobile-nav-item"><Icon size={19}/><span>{label}</span></Link>)}
  </nav>;
}

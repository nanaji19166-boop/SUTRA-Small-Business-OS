"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Option={id:string;name:string;price?:number};

export function TransactionForm(props:{
  mode:"sale"|"purchase"; businessId:string; locationId:string; products:Option[];
  customers?:Option[]; suppliers?:Option[]; onSubmit:(input:any)=>Promise<any>;
}){
  const [lines,setLines]=useState([{productId:"",quantity:1,unitPrice:0}]);
  const [partyId,setPartyId]=useState("");
  const [paid,setPaid]=useState(0);
  const [discount,setDiscount]=useState(0);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const subtotal=useMemo(()=>lines.reduce((s,l)=>s+l.quantity*l.unitPrice,0),[lines]);
  const total=Math.max(0,subtotal-discount);
  const balance=Math.max(0,total-paid);
  const options=props.mode==="sale" ? props.customers??[] : props.suppliers??[];

  function updateLine(index:number,key:"productId"|"quantity"|"unitPrice",value:string){
    setLines(current=>current.map((line,i)=>{
      if(i!==index) return line;
      if(key==="productId"){
        const product=props.products.find(p=>p.id===value);
        return {...line,productId:value,unitPrice:product?.price??0};
      }
      return {...line,[key]:Number(value)};
    }));
  }

  async function submit(){
    if(lines.some(l=>!l.productId||l.quantity<=0||l.unitPrice<0)){setMessage("Please complete every product line.");return;}
    if(paid>total){setMessage("Paid amount cannot exceed the total.");return;}
    setBusy(true);setMessage("");
    try{
      const number=(props.mode==="sale"?"SAL-":"PUR-")+Date.now();
      const result=await props.onSubmit(
        props.mode==="sale"
        ? {businessId:props.businessId,customerId:partyId||null,locationId:props.locationId,saleNumber:number,discount,paidAmount:paid,paymentMethod:"cash",lines:lines.map(l=>({product_id:l.productId,quantity:l.quantity,unit_price:l.unitPrice}))}
        : {businessId:props.businessId,supplierId:partyId||null,locationId:props.locationId,purchaseNumber:number,discount,paidAmount:paid,paymentMethod:"cash",lines:lines.map(l=>({product_id:l.productId,quantity:l.quantity,unit_price:l.unitPrice}))}
      );
      const shown=Number(result?.balanceAmount??result?.totalAmount??0).toLocaleString("en-IN");
      setMessage("Saved successfully. "+(props.mode==="sale"?"Balance":"Total")+": ₹"+shown);
      setLines([{productId:"",quantity:1,unitPrice:0}]);setPartyId("");setPaid(0);setDiscount(0);
    }catch(e){setMessage(e instanceof Error?e.message:"Could not save transaction");}
    finally{setBusy(false);}
  }

  return <div className="card p-4 sm:p-6"><div className="space-y-3">
    {lines.map((line,index)=><div key={index} className="rounded-xl border border-slate-200 p-3"><div className="grid gap-2 sm:grid-cols-[1fr_110px_130px_40px]">
      <select value={line.productId} onChange={e=>updateLine(index,"productId",e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3 bg-white"><option value="">Select product</option>{props.products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input type="number" min="0.001" step="0.001" value={line.quantity} onChange={e=>updateLine(index,"quantity",e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3" aria-label="Quantity"/>
      <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={e=>updateLine(index,"unitPrice",e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3" aria-label="Unit price"/>
      <button type="button" onClick={()=>setLines(current=>current.length===1?current:current.filter((_,i)=>i!==index))} className="grid place-items-center rounded-xl border border-slate-200 text-slate-500" aria-label="Remove line"><Trash2 size={17}/></button>
    </div></div>)}
    <button type="button" onClick={()=>setLines([...lines,{productId:"",quantity:1,unitPrice:0}])} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold"><Plus size={16}/> Add item</button>
    {options.length>0&&<label className="block text-sm font-semibold">{props.mode==="sale"?"Customer":"Supplier"}<select value={partyId} onChange={e=>setPartyId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"><option value="">Walk-in / not selected</option>{options.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>}
    <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Discount<input type="number" min="0" value={discount} onChange={e=>setDiscount(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"/></label><label className="block text-sm font-semibold">Paid now<input type="number" min="0" max={total} value={paid} onChange={e=>setPaid(Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"/></label></div>
    <div className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between text-sm"><span>Subtotal</span><b>₹{subtotal.toLocaleString("en-IN")}</b></div><div className="mt-2 flex justify-between text-sm"><span>Total</span><b>₹{total.toLocaleString("en-IN")}</b></div><div className="mt-2 flex justify-between text-base"><span>Balance</span><b>₹{balance.toLocaleString("en-IN")}</b></div></div>
    <button disabled={busy||lines.length===0} onClick={submit} className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Saving…":props.mode==="sale"?"Confirm sale":"Confirm purchase"}</button>
    {message&&<div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{message}</div>}
  </div></div>;
}

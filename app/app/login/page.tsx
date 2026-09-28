"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [mode,setMode] = useState<"login"|"signup">("login");
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);

  async function submit() {
    setBusy(true); setMessage("");
    const supabase=createClient();
    const result=mode==="login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password});
    setBusy(false);
    if(result.error){ setMessage(result.error.message); return; }
    if(mode==="signup") setMessage("Account created. Check your email if confirmation is enabled.");
    else window.location.href="/";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid size-12 place-items-center rounded-2xl bg-indigo-700 text-xl font-black text-white">S</div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Welcome to SUTRA</h1>
        <p className="mt-1 text-sm text-slate-500">Simple business management without the clutter.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">Email<input className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-600" type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <label className="block text-sm font-semibold">Password<input className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-indigo-600" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
          <button disabled={busy} onClick={submit} className="w-full rounded-xl bg-indigo-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
          {message && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{message}</p>}
          <button onClick={()=>setMode(mode==="login"?"signup":"login")} className="w-full text-sm font-semibold text-indigo-700">
            {mode==="login"?"New to SUTRA? Create an account":"Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}

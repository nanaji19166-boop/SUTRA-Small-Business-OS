"use client";

import { useState } from "react";
import { Globe2 } from "lucide-react";

export function LanguageButton(){
  const [language,setLanguage]=useState<"en"|"te">("en");
  return <button onClick={()=>setLanguage(language==="en"?"te":"en")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
    <Globe2 size={15} className="mr-1 inline-block"/> {language==="en"?"English":"తెలుగు"}
  </button>;
}

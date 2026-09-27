import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormItem, FormLabel, FormMessage, useForm } from "../components/Form";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { postBusiness, schema } from "../endpoints/businesses_POST.schema";
import styles from "./onboarding.module.css";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ schema, defaultValues: { name:"", ownerName:"", mobile:"", businessType:"", address:"", city:"", state:"", pinCode:"", preferredLanguage:"te" } });

  const submit = async (values: typeof form.values) => {
    setLoading(true); setError(null);
    try {
      const result = await postBusiness(values);
      try { localStorage.setItem("sutra.selectedBusinessId", result.businessId); } catch {}
      navigate(`/?businessId=${encodeURIComponent(result.businessId)}`, { replace:true });
    }
    catch (e) { setError(e instanceof Error ? e.message : "Could not create business"); }
    finally { setLoading(false); }
  };

  return <main className={styles.page}>
    <section className={styles.card}>
      <p className={styles.kicker}>SET UP YOUR BUSINESS</p>
      <h1>Let’s get SUTRA ready.</h1>
      <p className={styles.sub}>This takes about a minute. You can add products, customers and opening stock later.</p>
      {error && <div className={styles.error}>{error}</div>}
      <Form {...form}><form onSubmit={form.handleSubmit(submit)} className={styles.form}>
        <FormItem name="name"><FormLabel>Business name</FormLabel><FormControl><Input placeholder="e.g. Lakshmi Stores" value={form.values.name} onChange={e=>form.setValues(v=>({...v,name:e.target.value}))}/></FormControl><FormMessage/></FormItem>
        <FormItem name="ownerName"><FormLabel>Owner name</FormLabel><FormControl><Input placeholder="Your name" value={form.values.ownerName} onChange={e=>form.setValues(v=>({...v,ownerName:e.target.value}))}/></FormControl><FormMessage/></FormItem>
        <div className={styles.two}><FormItem name="mobile"><FormLabel>Mobile <span className={styles.optional}>(optional)</span></FormLabel><FormControl><Input inputMode="tel" placeholder="Add later if useful" value={form.values.mobile} onChange={e=>form.setValues(v=>({...v,mobile:e.target.value}))}/></FormControl><FormMessage/></FormItem><FormItem name="businessType"><FormLabel>Business type</FormLabel><FormControl><Input placeholder="Retail / wholesale / service" value={form.values.businessType} onChange={e=>form.setValues(v=>({...v,businessType:e.target.value}))}/></FormControl><FormMessage/></FormItem></div>
        <div className={styles.two}><FormItem name="city"><FormLabel>City / village</FormLabel><FormControl><Input value={form.values.city} onChange={e=>form.setValues(v=>({...v,city:e.target.value}))}/></FormControl><FormMessage/></FormItem><FormItem name="state"><FormLabel>State</FormLabel><FormControl><Input value={form.values.state} onChange={e=>form.setValues(v=>({...v,state:e.target.value}))}/></FormControl><FormMessage/></FormItem></div>
        <FormItem name="address"><FormLabel>Address (optional)</FormLabel><FormControl><Input value={form.values.address} onChange={e=>form.setValues(v=>({...v,address:e.target.value}))}/></FormControl><FormMessage/></FormItem>
        <FormItem name="pinCode"><FormLabel>PIN code (optional)</FormLabel><FormControl><Input inputMode="numeric" value={form.values.pinCode} onChange={e=>form.setValues(v=>({...v,pinCode:e.target.value}))}/></FormControl><FormMessage/></FormItem>
        <Button type="submit" disabled={loading} size="lg">{loading ? <><Spinner size="sm"/> Creating business…</> : "Create Business"}</Button>
      </form></Form>
    </section>
  </main>;
}
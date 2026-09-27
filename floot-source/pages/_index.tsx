import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, ChevronRight, CircleDollarSign, CreditCard, IndianRupee, Menu, PackagePlus, Plus, ReceiptText, Search, ShoppingCart, Users, WalletCards } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AuthLoadingState } from "../components/AuthLoadingState";
import { useAuth } from "../helpers/useAuth";
import { useBusinesses } from "../helpers/useBusinesses";
import { getDashboard } from "../endpoints/dashboard_GET.schema";
import styles from "./_index.module.css";

const money = (value: number) => "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function HomePage() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const { businesses, selectedBusinessId, selectedBusiness, isLoading: businessesLoading, isError: businessesError } = useBusinesses();
  const fallbackBusinessId = new URLSearchParams(window.location.search).get("businessId") || (() => { try { return localStorage.getItem("sutra.selectedBusinessId"); } catch { return null; } })();
  const effectiveBusinessId = selectedBusinessId || fallbackBusinessId;
  const [language, setLanguage] = useState("te");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedBusiness?.preferredLanguage) setLanguage(selectedBusiness.preferredLanguage);
  }, [selectedBusiness?.preferredLanguage]);

  const dashboard = useQuery({
    queryKey: ["dashboard", effectiveBusinessId],
    queryFn: () => getDashboard(effectiveBusinessId!),
    enabled: Boolean(effectiveBusinessId),
    retry: false,
    staleTime: 30 * 1000,
  });

  if (authState.type === "loading" || businessesLoading) return <AuthLoadingState title="Loading SUTRA" />;
  if (authState.type === "unauthenticated") return <Navigate to="/login" replace />;
  if (businessesError) return <main className={styles.emptyPage}><section className={styles.emptyCard}><h1>We couldn't load your business</h1><p>Please refresh and try again.</p><Button onClick={() => window.location.reload()}>Retry</Button></section></main>;
  if (businesses.length === 0 && !effectiveBusinessId) return <Navigate to="/onboarding" replace />;

  const data = dashboard.data;
  const businessName = selectedBusiness?.name || data?.business.name || "Your business";
  const collections = (data?.collectionsDue ?? []).filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const hasActivity = Boolean(data && (data.metrics.sales || data.metrics.collections || data.metrics.expenses || data.metrics.stockValue || data.collectionsDue.length));

  return <main className={styles.page}>
    <header className={styles.header}>
      <div className={styles.brand}><img src="/_cdn/static/aa08b985-a60b-45da-a544-dd8c9d1cc355.png" alt="SUTRA" className={styles.logo}/><div><div className={styles.brandName}>SUTRA</div><div className={styles.brandSub}>Small Business OS</div></div></div>
      <div className={styles.headerActions}><Button variant="ghost" size="icon-md" aria-label="Search"><Search size={19}/></Button><Button variant="ghost" size="icon-md" aria-label="Menu"><Menu size={20}/></Button><div className={styles.language}><Button variant={language === "te" ? "secondary" : "ghost"} size="sm" onClick={() => setLanguage("te")}>తెలుగు</Button><Button variant={language === "en" ? "secondary" : "ghost"} size="sm" onClick={() => setLanguage("en")}>EN</Button></div></div>
    </header>

    <section className={styles.greeting}><div><p className={styles.eyebrow}>{language === "te" ? "ఈ రోజు వ్యాపారం" : "TODAY AT A GLANCE"}</p><h1>{language === "te" ? "నమస్కారం 👋" : `Good evening, ${authState.user.displayName.split(" ")[0]} 👋`}</h1><p className={styles.muted}>{businessName}</p></div><Button onClick={() => navigate("/setup") }><Plus size={18}/> Quick Add</Button></section>

    <section className={styles.heroMetric}><div><span className={styles.metricLabel}>{language === "te" ? "ఈ రోజు అమ్మకాలు" : "Today's sales"}</span><strong>{money(data?.metrics.sales ?? 0)}</strong><span className={styles.metricPositive}>{data ? "Live business data" : "Loading…"}</span></div><div className={styles.metricIcon}><WalletCards size={25}/></div></section>

    <section className={styles.actionGrid}>
      <Button className={styles.actionCard + " " + styles.actionPrimary} onClick={() => navigate("/operations?focus=sales")}><span className={styles.actionIcon}><ShoppingCart size={22}/></span><span className={styles.actionText}><strong>{language === "te" ? "అమ్మకం" : "Add Sale"}</strong><small>Add Sale</small></span><ChevronRight size={18}/></Button>
      <Button variant="outline" className={styles.actionCard} onClick={() => navigate("/operations?focus=products")}><span className={styles.actionIcon}><PackagePlus size={22}/></span><span className={styles.actionText}><strong>{language === "te" ? "స్టాక్" : "Add Stock"}</strong><small>Start with Products</small></span><ChevronRight size={18}/></Button>
      <Button variant="outline" className={styles.actionCard} onClick={() => navigate("/setup?focus=collections")}><span className={styles.actionIcon}><CircleDollarSign size={22}/></span><span className={styles.actionText}><strong>{language === "te" ? "వసూలు" : "Collect"}</strong><small>Collection workflow next</small></span><ChevronRight size={18}/></Button>
      <Button variant="outline" className={styles.actionCard} onClick={() => navigate("/operations?focus=customers")}><span className={styles.actionIcon}><Users size={22}/></span><span className={styles.actionText}><strong>{language === "te" ? "కస్టమర్" : "Customers"}</strong><small>Manage customers</small></span><ChevronRight size={18}/></Button>
    </section>

    <section className={styles.statsGrid}><article className={styles.statCard}><div className={styles.statHead}><span>Collections</span><CircleDollarSign size={17}/></div><strong>{money(data?.metrics.collections ?? 0)}</strong><small>Collected today</small></article><article className={styles.statCard}><div className={styles.statHead}><span>Receivables</span><CreditCard size={17}/></div><strong>{money(data?.metrics.receivables ?? 0)}</strong><small>Pending from customers</small></article><article className={styles.statCard}><div className={styles.statHead}><span>Stock value</span><Boxes size={17}/></div><strong>{money(data?.metrics.stockValue ?? 0)}</strong><small>Current inventory ledger</small></article></section>

    {!hasActivity ? <section className={styles.setupPanel}><div className={styles.setupIcon}><ReceiptText size={22}/></div><div><span className={styles.eyebrow}>YOUR BUSINESS IS READY</span><h2>No transactions yet</h2><p>Add your first product, customer or purchase to start building your live business records.</p></div><Button onClick={() => navigate("/setup")}>Start setup <ChevronRight size={16}/></Button></section> : null}

    <section className={styles.columns}><article className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.eyebrow}>COLLECTIONS</span><h2>Due today</h2></div><Button variant="ghost" size="sm" onClick={() => navigate("/collections")}>View all <ChevronRight size={15}/></Button></div><div className={styles.searchBox}><Search size={16}/><Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search customer" aria-label="Search customer"/></div><div className={styles.collectionList}>{collections.length ? collections.map((item)=><div className={styles.collectionRow} key={item.id}><div className={styles.avatar}>{item.name.slice(0,1)}</div><div className={styles.collectionName}><strong>{item.name}</strong><span>{item.dueDate}</span></div><strong>{money(item.amount)}</strong><Button variant="outline" size="sm" onClick={()=>navigate(`/collections/new?customerId=${encodeURIComponent(item.id)}`)}>Collect</Button></div>) : <div className={styles.emptyInline}>No collections are due.</div>}</div></article>
      <article className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.eyebrow}>BUSINESS PULSE</span><h2>Today</h2></div><WalletCards size={20}/></div><div className={styles.movementList}><div className={styles.movementRow}><span className={styles.movementIcon}><ArrowUpFromLine size={17}/></span><span>Sales</span><strong className={styles.positive}>{money(data?.metrics.sales ?? 0)}</strong></div><div className={styles.movementRow}><span className={styles.movementIcon}><IndianRupee size={17}/></span><span>Collections</span><strong className={styles.positive}>{money(data?.metrics.collections ?? 0)}</strong></div><div className={styles.movementRow}><span className={styles.movementIcon}><ArrowDownToLine size={17}/></span><span>Expenses</span><strong className={styles.expense}>{money(data?.metrics.expenses ?? 0)}</strong></div></div><div className={styles.insight}><ReceiptText size={18}/><div><strong>One connected business record</strong><p>SUTRA keeps sales, stock, customers and collections linked.</p></div></div></article></section>
    {dashboard.isError ? <div className={styles.errorBanner}>Some dashboard data could not be loaded. Please retry.</div> : null}
  </main>;
}
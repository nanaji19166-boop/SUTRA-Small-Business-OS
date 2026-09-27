import { ArrowRight, Boxes, CircleDollarSign, PackagePlus, ShoppingCart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useBusinesses } from "../helpers/useBusinesses";
import styles from "./setup.module.css";

const items = [
  { title:"Products & stock", text:"Add your catalog and opening stock.", icon:Boxes },
  { title:"Customers", text:"Create customer records and balances.", icon:Users },
  { title:"Purchases", text:"Record purchases and stock receipts.", icon:PackagePlus },
  { title:"Sales", text:"Record sales, credit and payments.", icon:ShoppingCart },
  { title:"Collections", text:"Track installments and outstanding amounts.", icon:CircleDollarSign },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const { selectedBusiness } = useBusinesses();
  return <main className={styles.page}>
    <section className={styles.header}><div><p className={styles.kicker}>BUSINESS SETUP</p><h1>{selectedBusiness?.name ?? "Your business"}</h1><p>Choose what you want to set up first. Nothing here contains demo records.</p></div><Button variant="outline" onClick={()=>navigate("/")}>Back to dashboard</Button></section>
    <section className={styles.grid}>{items.map(({title,text,icon:Icon})=><article className={styles.card} key={title}><span className={styles.icon}><Icon size={21}/></span><div><h2>{title}</h2><p>{text}</p></div><span className={styles.arrow}><ArrowRight size={18}/></span></article>)}</section>
    <section className={styles.note}><strong>Build status</strong><span>The secure business, user, inventory, sales, payment and collection data model is in place. Transaction workflows are being wired against the live database next.</span></section>
  </main>;
}
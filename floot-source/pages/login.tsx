import { Link } from "react-router-dom";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import styles from "./auth.module.css";

export default function LoginPage() {
  return <main className={styles.page}>
    <section className={styles.card}>
      <img src="/_cdn/static/aa08b985-a60b-45da-a544-dd8c9d1cc355.png" alt="SUTRA" className={styles.logo} />
      <p className={styles.kicker}>SUTRA</p>
      <h1>Welcome back</h1>
      <p className={styles.sub}>Sign in to manage your business.</p>
      <PasswordLoginForm />
      <p className={styles.footer}>New to SUTRA? <Link to="/register">Create an account</Link></p>
    </section>
  </main>;
}
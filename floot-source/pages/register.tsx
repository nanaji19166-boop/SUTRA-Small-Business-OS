import { Link } from "react-router-dom";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import styles from "./auth.module.css";

export default function RegisterPage() {
  return <main className={styles.page}>
    <section className={styles.card}>
      <img src="/_cdn/static/aa08b985-a60b-45da-a544-dd8c9d1cc355.png" alt="SUTRA" className={styles.logo} />
      <p className={styles.kicker}>SUTRA</p>
      <h1>Create your account</h1>
      <p className={styles.sub}>Your account can manage one or more businesses.</p>
      <PasswordRegisterForm />
      <p className={styles.footer}>Already registered? <Link to="/login">Log in</Link></p>
    </section>
  </main>;
}
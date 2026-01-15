"use client";

import Link from "next/link";
import styles from "./landing.module.css";
import { Sparkles, ArrowRight, Shield, Zap, Target, MousePointer2 } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* SEO optimized Structure */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Work Tracker AI Logo" width={32} height={32} />
          <span>Work Tracker AI</span>
        </div>
        <div className={styles.navLinks}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className={styles.loginBtn}>Accedi</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className={styles.loginBtn}>Vai alla Dashboard</Link>
          </SignedIn>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} /> <span>Nuova Era della Gestione Lavoro</span>
          </div>
          <h1 className={styles.heroTitle}>
            L’AI che mette ordine<br />nel tuo lavoro.
          </h1>
          <p className={styles.heroSubtitle}>
            Trasforma note disordinate in documenti strutturati, verbali e bozze email professionali in pochi secondi.
          </p>
          <div className={styles.ctaGroup}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className={styles.ctaPrimary}>Inizia Ora Gratis</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={styles.ctaPrimary}>Torna al Lavoro</Link>
            </SignedIn>
            <a href="#features" className={styles.ctaSecondary}>Scopri di più</a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <img
            src="/hero-bg.png"
            alt="Work Tracker AI Dashboard Infographic"
            className={styles.heroImage}
          />
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Zap size={24} />
          </div>
          <h3>From notes to next steps.</h3>
          <p>
            Non perdere mai il filo. La nostra AI analizza le tue note vocali o testuali e le trasforma immediatamente in piani d'azione concreti.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Target size={24} />
          </div>
          <h3>Turn talk into action.</h3>
          <p>
            Registra i tuoi meeting o le tue chiamate. Ricevi verbali strutturati e bozze email già pronte per i tuoi clienti.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Shield size={24} />
          </div>
          <h3>Sicurezza Enterprise.</h3>
          <p>
            I tuoi dati sono protetti e crittografati. Integrazione diretta con Gmail tramite OAuth2 per un controllo totale delle tue comunicazioni.
          </p>
        </div>
      </section>

      <section className={styles.features} style={{ paddingTop: 0 }}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <MousePointer2 size={24} />
          </div>
          <h3>Efficienza AI per tutti.</h3>
          <p>
            Ottimizzato per essere interpretato correttamente dagli agenti AI e dai motori di ricerca, garantendo visibilità e prestazioni superiori.
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 Work Tracker AI. Made with ❤️ for professionals.</p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Termini di Servizio</Link>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import styles from "../landing.module.css";

export default function PrivacyPage() {
    return (
        <div className={styles.landingContainer} style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto", color: "var(--foreground)" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", background: "var(--hero-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Privacy Policy
            </h1>
            <div style={{ lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <p>La tua privacy è importante per noi. Questa pagina descrive come gestiamo i tuoi dati.</p>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>1. Raccolta dei Dati</h2>
                    <p>Raccogliamo solo i dati necessari per fornirti il servizio di tracciamento e analisi AI, inclusi i dati del tuo profilo (via Clerk) e i contenuti che inserisci nell&apos;app.</p>
                </section>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>2. Utilizzo dei Dati</h2>
                    <p>I tuoi dati vengono utilizzati esclusivamente per generare riassunti, verbali e bozze email tramite i modelli di OpenAI. Non vendiamo i tuoi dati a terzi.</p>
                </section>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>3. Integrazione Google</h2>
                    <p>Se colleghi il tuo account Google, utilizzeremo i token solo per inviare le email che tu esplicitamente decidi di spedire tramite la Gmail API.</p>
                </section>
                <Link href="/" className={styles.ctaButton} style={{ marginTop: "2rem", width: "fit-content" }}>
                    Torna alla Home
                </Link>
            </div>
        </div>
    );
}

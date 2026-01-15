import Link from "next/link";
import styles from "../landing.module.css";

export default function TermsPage() {
    return (
        <div className={styles.landingContainer} style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto", color: "var(--foreground)" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", background: "var(--hero-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Termini di Servizio
            </h1>
            <div style={{ lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <p>Benvenuto su Work Tracker AI. Utilizzando il nostro servizio, accetti i seguenti termini.</p>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>1. Utilizzo del Servizio</h2>
                    <p>Il servizio è fornito &quot;così com&apos;è&quot;. L&apos;utente è responsabile dell&apos;accuratezza dei dati inseriti e delle email inviate tramite l&apos;integrazione Gmail.</p>
                </section>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>2. Intelligenza Artificiale</h2>
                    <p>L&apos;app utilizza modelli AI di terze parti (OpenAI). Sebbene l&apos;AI sia avanzata, i risultati possono contenere inesattezze. Ti consigliamo di revisionare sempre gli artefatti generati.</p>
                </section>
                <section>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>3. Limitazione di Responsabilità</h2>
                    <p>Non siamo responsabili per eventuali danni derivanti dall&apos;uso o dall&apos;impossibilità di usare il servizio.</p>
                </section>
                <Link href="/" className={styles.ctaButton} style={{ marginTop: "2rem", width: "fit-content" }}>
                    Torna alla Home
                </Link>
            </div>
        </div>
    );
}

# 🚀 Work Tracker AI
### *L’Intelligenza Artificiale che mette ordine nel tuo lavoro quotidiano.*

**Work Tracker AI** è un assistente intelligente progettato per professionisti che hanno bisogno di trasformare note disordinate, telefonate e verbali in azioni concrete. Grazie all'integrazione di modelli linguistici avanzati (GPT-4o) e tecnologie di trascrizione (Whisper), l'app analizza ogni tuo input per creare valore immediato.

---

## ✨ Funzionalità Straordinarie

### 🗓️ Timeline Intelligente
Visualizza la tua giornata lavorativa in un flusso cronologico elegante. Ogni evento (nota, chiamata o riunione) viene catalogato e arricchito dall'AI.

### 🧠 Artefatti AI Automatici
Per ogni contenuto inserito, l'AI genera automaticamente:
- **Sommario**: Un riassunto esecutivo rapido.
- **Minutes**: Un verbale dettagliato della discussione.
- **Action Items**: Una checklist di punti d'azione chiari e pronti all'uso.
- **Bozza Email**: Una bozza professionale di follow-up pronta da inviare.

### 🎙️ Supporto Multimediale Totale
- **Audio**: Registra note vocali direttamente dall'app o carica file audio per ottenere trascrizioni perfette.
- **Immagini (OCR)**: Carica foto di documenti, lavagne o appunti scritti a mano; l'AI estrarrà il testo e lo sintetizzerà per te.

### ✉️ Integrazione Gmail Diretta
Connetti il tuo account Google per inviare le bozze di follow-up generate dall'AI con un solo click, senza mai lasciare la dashboard.

### 📱 PWA & Mobile Ready
Installabile su iOS e Android come un'app nativa. Ottimizzata per l'inserimento rapido anche in mobilità.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router, CSS Modules)
- **Backend & Database**: [Convex](https://www.convex.dev/) (Real-time database and serverless functions)
- **Authentication**: [Clerk](https://clerk.com/)
- **AI Models**: 
  - **OpenAI GPT-4o**: Analisi, OCR e generazione artefatti.
  - **OpenAI Whisper**: Trascrizione audio ad alta fedeltà.
- **Integrations**: Google OAuth 2.0 & Gmail API.

---

## ⚡ Quick Start

1. **Clona il repo**:
   ```bash
   git clone https://github.com/tuo-username/work-tracker-ai.git
   ```
2. **Installa le dipendenze**:
   ```bash
   npm install
   ```
3. **Configura le variabili d'ambiente**:
   Crea un file `.env.local` con le chiavi per Clerk, Convex e OpenAI.
4. **Avvia lo sviluppo**:
   ```bash
   npx convex dev # Avvia il backend
   npm run dev    # Avvia il frontend
   ```

---

## 📐 Architettura
L'applicazione segue un'architettura **Serverless-First**:
- Il database Convex mantiene la sincronizzazione in tempo reale tra tutti i dispositivi.
- Le Clerk middleware proteggono le rotte sensibili.
- Il design è atomico, fluido e orientato alla "Aesthetics First" per un'esperienza premium.

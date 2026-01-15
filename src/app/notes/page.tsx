"use client";

import styles from "./Notes.module.css";
import { FileText, Plus, Info } from "lucide-react";

export default function NotesPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Quick Notes</h1>
                <p className="text-muted">Jot down temporary notes or tasks.</p>
            </header>

            <div className={`${styles.empty} glass`}>
                <div className={styles.iconBox}>
                    <FileText size={48} />
                </div>
                <h2>Syncing with Matters</h2>
                <p>
                    Currently, all notes are associated with specific **Matters**.
                    Go to a Matter details page to add notes, audio, or files.
                </p>
                <div className={styles.tip}>
                    <Info size={16} />
                    <span>A global scratchpad feature is coming soon!</span>
                </div>
            </div>
        </div>
    );
}

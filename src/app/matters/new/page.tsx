"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import styles from "./NewMatter.module.css";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewMatter() {
    const router = useRouter();
    const createMatter = useMutation(api.matters.create);

    const [formData, setFormData] = useState({
        title: "",
        type: "legal",
        counterparty: "",
        priority: "medium",
        internalNotes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMatter({
                ...formData,
                status: "active",
                tags: [],
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to create matter:", error);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/dashboard" className={styles.backLink}>
                    <ChevronLeft size={20} />
                    Back to Dashboard
                </Link>
                <h1>New Matter</h1>
            </header>

            <form onSubmit={handleSubmit} className={`${styles.form} glass`}>
                <div className={styles.field}>
                    <label>Title</label>
                    <input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Case Title or Name"
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="legal">Legal Dispute</option>
                            <option value="administrative">Administrative</option>
                            <option value="personal">Personal</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label>Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className={styles.field}>
                    <label>Counterparty (Optional)</label>
                    <input
                        value={formData.counterparty}
                        onChange={(e) => setFormData({ ...formData, counterparty: e.target.value })}
                        placeholder="Company or Person name"
                    />
                </div>

                <div className={styles.field}>
                    <label>Internal Notes</label>
                    <textarea
                        rows={4}
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        placeholder="Add some context..."
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    <Save size={20} />
                    Create Matter
                </button>
            </form>
        </div>
    );
}

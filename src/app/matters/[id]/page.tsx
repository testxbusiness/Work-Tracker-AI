"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import styles from "./MatterDetails.module.css";
import { Timeline } from "@/components/Timeline";
import { EventCreator } from "@/components/EventCreator";
import { Badge } from "@/components/Badge";
import { Trash2 } from "lucide-react";

export default function MatterDetails() {
    const params = useParams();
    const router = useRouter();
    const matterId = params.id as any;
    const matter = useQuery(api.matters.get, { id: matterId });
    const removeMatter = useMutation(api.matters.remove);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this matter? This will permanently delete all events, files, and data associated with it.")) return;

        try {
            await removeMatter({ id: matterId });
            router.push("/");
        } catch (error) {
            console.error("Failed to delete matter:", error);
            alert("Failed to delete matter.");
        }
    };

    if (matter === undefined) return <div>Loading matter...</div>;
    if (matter === null) return <div>Matter not found.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1>{matter.title}</h1>
                        <Badge type={matter.priority}>{matter.priority}</Badge>
                        <Badge type="status">{matter.status}</Badge>
                    </div>
                    <button onClick={handleDelete} className={styles.deleteButton} title="Delete Matter">
                        <Trash2 size={20} />
                    </button>
                </div>
                <p className="text-muted">{matter.type} • {matter.counterparty || 'No counterparty'}</p>
            </header>

            <div className={styles.content}>
                <section className={styles.timelineSection}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2>Timeline</h2>
                    </div>
                    <EventCreator matterId={matterId} />
                    <Timeline matterId={matterId} />
                </section>

                <aside className={styles.sidebar}>
                    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
                        <h3>Internal Notes</h3>
                        <p style={{ marginTop: '12px', fontSize: '0.9375rem', whiteSpace: 'pre-wrap' }}>
                            {matter.internalNotes || "No internal notes yet."}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

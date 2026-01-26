"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import styles from "./MatterDetails.module.css";
import { Timeline } from "@/components/Timeline";
import { EventCreator } from "@/components/EventCreator";
import { Badge } from "@/components/Badge";
import { Trash2, Share2, Download, Folder, ChevronRight, FileText, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Id } from "convex/_generated/dataModel";

export default function MatterDetails() {
    const params = useParams();
    const router = useRouter();
    const matterId = params.id as Id<"matters">;
    const matter = useQuery(api.matters.get, { id: matterId });
    const removeMatter = useMutation(api.matters.remove);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this matter? This will permanently delete all events, files, and data associated with it.")) return;

        try {
            await removeMatter({ id: matterId });
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to delete matter:", error);
            alert("Failed to delete matter.");
        }
    };

    if (matter === undefined) {
        return (
            <div style={{ padding: 40, color: 'var(--text-dim)' }}>
                Loading matter dossier...
            </div>
        );
    }
    if (matter === null) return <div style={{ padding: 40 }}>Matter not found.</div>;

    const caseIdDisplay = `L-${matter._id.slice(0, 8).toUpperCase()}`;

    return (
        <div className={styles.container}>
            <nav className={styles.breadcrumbs}>
                <Link href="/matters" style={{ color: 'inherit', textDecoration: 'none' }}>Matter List</Link>
                <ChevronRight size={14} />
                <span className={styles.breadcrumbActive}>Case {caseIdDisplay}</span>
            </nav>

            <header className={styles.pageHeader}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1 className={styles.caseTitle}>{matter.title}</h1>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Badge variant={matter.status === 'active' ? 'success' : 'warning'}>
                            {matter.status}
                        </Badge>
                        <Badge variant={matter.priority}>
                            {matter.priority}
                        </Badge>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn} title="Share Case" aria-label="Share case">
                        <Share2 size={18} />
                    </button>
                    <button className={styles.actionBtn} title="Export Analysis" aria-label="Export analysis">
                        <Download size={18} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        title="Archive/Delete Dossier"
                        aria-label="Archive or delete dossier"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </header>

            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <div className={`${styles.caseBanner} glass`}>
                        <div className={styles.bannerIcon}>
                            <Folder size={32} color="var(--primary)" />
                        </div>
                        <div className={styles.bannerInfo}>
                            <h2>{matter.title}</h2>
                            <p>{matter.type} • {matter.counterparty || 'General Case'}</p>
                        </div>

                        <div className={styles.metaGroup} style={{ padding: 0 }}>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Status</span>
                                <Badge variant={matter.status === 'active' ? 'success' : 'warning'}>
                                    {matter.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Priority</span>
                                <span className={styles.metaValue} style={{ color: matter.priority === 'high' ? 'var(--error)' : 'var(--text-main)' }}>
                                    {matter.priority.toUpperCase()}
                                </span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Case ID</span>
                                <span className={styles.metaValue}>{caseIdDisplay}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div className={styles.metaGroup}>
                            <div className={styles.sidebarSection}>
                                <h3><Info size={14} /> Counterparty Details</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>
                                    {matter.counterparty || "No counterparty assigned"}
                                </p>
                            </div>

                            <div className={styles.sidebarSection}>
                                <h3><FileText size={14} /> Internal Notes</h3>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    {matter.internalNotes || "Add private notes for the team..."}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className={styles.mainSection}>
                    <div className={styles.mainHeader}>
                        <h2>Timeline of Events</h2>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Badge variant="default">Filter Events</Badge>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <EventCreator matterId={matterId} />
                        <Timeline matterId={matterId} />
                    </div>
                </main>
            </div>

            <footer style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <span>• AI SYSTEMS ONLINE</span>
                    <span>• DB ENCRYPTED</span>
                </div>
                <div>LAST SYNC: JUST NOW</div>
            </footer>
        </div>
    );
}

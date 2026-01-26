"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./Outbox.module.css";
import { Mail, CheckCircle2, Clock, AlertCircle, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { useState } from "react";

type OutboxEmail = {
    _id: string;
    status: "sent" | "queued" | "failed";
    to: string;
    subject: string;
    body: string;
    sentAt?: number | null;
    error?: string | null;
};

export default function Outbox() {
    const emails = useQuery(api.outbox.list);
    const sendEmail = useAction(api.gmail.sendEmail);
    const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

    if (emails === undefined) return <div>Loading outbox...</div>;

    const handleRetry = async (email: OutboxEmail) => {
        setRetryingIds(prev => new Set(prev).add(email._id));
        try {
            await sendEmail({
                outboxId: email._id,
                to: email.to,
                subject: email.subject,
                body: email.body,
            });
        } catch (err) {
            console.error("Retry failed:", err);
        } finally {
            setRetryingIds(prev => {
                const next = new Set(prev);
                next.delete(email._id);
                return next;
            });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Email Outbox</h1>
                <p className="text-muted">Track and manage your sent and queued emails.</p>
            </header>

            <div className={`${styles.list} glass`}>
                {emails.map((email) => (
                    <div key={email._id} className={styles.item}>
                        <div className={styles.statusIcon}>
                            {email.status === "sent" && <CheckCircle2 size={20} className={styles.sent} />}
                            {email.status === "queued" && <Clock size={20} className={styles.queued} />}
                            {email.status === "failed" && <AlertCircle size={20} className={styles.failed} />}
                        </div>
                        <div className={styles.details}>
                            <div className={styles.row}>
                                <span className={styles.to}>To: {email.to}</span>
                                <span className={styles.time}>
                                    {email.sentAt ? new Date(email.sentAt).toLocaleString() : "Queued"}
                                </span>
                            </div>
                            <h3 className={styles.subject}>{email.subject}</h3>
                            <p className={styles.preview}>{email.body.slice(0, 100)}...</p>
                            {email.error && <p className={styles.error}>{email.error}</p>}
                        </div>
                        <div className={styles.actions}>
                            <Badge variant={email.status}>{email.status}</Badge>
                            {email.status !== "sent" && (
                                <button
                                    className={styles.retryButton}
                                    onClick={() => handleRetry(email)}
                                    disabled={retryingIds.has(email._id)}
                                >
                                    {retryingIds.has(email._id) ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {emails.length === 0 && (
                    <div className={styles.empty}>
                        <Mail size={48} />
                        <p>No emails in the outbox yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

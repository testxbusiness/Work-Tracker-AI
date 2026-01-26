import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./Timeline.module.css";
import { MessageSquare, Phone, Users, FileText, Mail, Send, Paperclip, Sparkles, CheckSquare, ChevronRight, Loader2, Edit2, Trash2, X, Save, Search, RefreshCcw, FileIcon, User } from "lucide-react";
import { useState } from "react";
import { Id } from "convex/_generated/dataModel";

interface AIResults {
    summary?: string;
    minutes?: string;
    actionItems?: string[];
    emailDraft?: {
        subject: string;
        body: string;
        to?: string;
    };
}

interface Event {
    _id: Id<"events">;
    _creationTime: number;
    userId: string;
    matterId: Id<"matters">;
    type: string;
    content: string;
    aiStatus: string;
    timestamp: number;
    aiResults?: AIResults;
    emailSent?: boolean;
}

interface Attachment {
    _id: Id<"attachments">;
    storageId: Id<"_storage">;
    fileName: string;
    fileType: string;
    eventId?: Id<"events">;
}

export function Timeline({ matterId }: { matterId: Id<"matters"> }) {
    const events = useQuery(api.events.listByMatter, { matterId }) as Event[] | undefined;
    const attachments = useQuery(api.attachments.listByMatter, { matterId }) as Attachment[] | undefined;
    const userSettings = useQuery(api.users.get);
    const createEmail = useMutation(api.outbox.create);
    const updateEvent = useMutation(api.events.update);
    const deleteEvent = useMutation(api.events.remove);
    const markEmailSent = useMutation(api.events.markEmailSent);
    const sendEmail = useAction(api.gmail.sendEmail);
    const [isSending, setIsSending] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const generateActionDraft = useAction(api.ai.generateDraftFromActionItem);
    const [itemLoading, setItemLoading] = useState<string | null>(null);

    const handleActionItemEmail = async (actionItem: string, eventId: string, index: number) => {
        const loadingKey = `${eventId}-${index}`;
        setItemLoading(loadingKey);
        try {
            const draft = await generateActionDraft({ actionItem });
            await handleQueueEmail(draft, eventId);
        } catch (err) {
            console.error("Failed to generate draft:", err);
            alert("Failed to generate draft for this item.");
        } finally {
            setItemLoading(null);
        }
    };

    if (events === undefined || attachments === undefined) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.loadingHeader}>
                    <RefreshCcw className="spin" size={16} />
                    <span>Syncing events...</span>
                </div>
                <div className={styles.skeletonList}>
                    <div className={styles.skeletonItem} />
                    <div className={styles.skeletonItem} />
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <MessageSquare size={22} />
                </div>
                <div>
                    <h3>No events yet</h3>
                    <p>Log a note, call, or meeting to start building this case timeline.</p>
                </div>
            </div>
        );
    }

    const handleQueueEmail = async (draft: { subject: string; body: string; to?: string }, eventId: string) => {
        setIsSending(eventId);
        const recipient = draft.to || userSettings?.workEmail || "work@example.com";
        try {
            const outboxId = await createEmail({
                matterId,
                subject: draft.subject,
                body: draft.body,
                to: recipient,
            });

            await sendEmail({
                outboxId,
                to: recipient,
                subject: draft.subject,
                body: draft.body,
            });

            await markEmailSent({ id: eventId as Id<"events"> });
            alert("Email sent successfully!");
        } catch (err) {
            console.error("Failed to send email:", err);
            alert("Failed to send email.");
        } finally {
            setIsSending(null);
        }
    };

    const handleUpdate = async (id: Id<"events">) => {
        try {
            await updateEvent({ id, content: editContent });
            setEditingId(null);
        } catch (err) {
            console.error("Failed to update event:", err);
        }
    };

    const handleDelete = async (id: Id<"events">) => {
        if (!confirm("Delete this event from dossier?")) return;
        try {
            await deleteEvent({ id });
        } catch (err) {
            console.error("Failed to delete event:", err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "note": return <FileText size={20} />;
            case "call": return <Phone size={20} />;
            case "meeting": return <Users size={20} />;
            case "email": return <Mail size={20} />;
            case "doc_sent": return <Send size={20} />;
            case "audio_note": return <Phone size={20} />;
            default: return <MessageSquare size={20} />;
        }
    };

    const formatType = (type: string) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className={styles.timeline}>
            {events.map((event) => {
                const eventAttachments = attachments.filter(a => a.eventId === event._id);
                const results = event.aiResults;
                const isAIProcessing = event.aiStatus === "processing" || event.aiStatus === "queued";

                return (
                    <div key={event._id} className={styles.eventItem}>
                        <div className={styles.iconWrapper}>
                            <div className={styles.icon}>
                                {getIcon(event.type)}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <div className={styles.eventCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.headerLeft}>
                                        <h3 className={styles.title}>{formatType(event.type)}</h3>
                                        <span className={styles.time}>
                                            {new Date(event.timestamp).toLocaleString('it-IT', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className={styles.headerRight}>
                                        {isAIProcessing ? (
                                            <div className={`${styles.aiBadge} ${styles.aiAnalyzing}`}>
                                                <RefreshCcw size={10} className="spin" /> AI ANALYZING
                                            </div>
                                        ) : results ? (
                                            <div className={`${styles.aiBadge} ${styles.aiProcessed}`}>
                                                <Sparkles size={10} /> AI PROCESSED
                                            </div>
                                        ) : null}

                                        <div className={styles.actions}>
                                            <button
                                                className={styles.iconBtn}
                                                onClick={() => { setEditingId(event._id); setEditContent(event.content); }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDelete(event._id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {editingId === event._id ? (
                                    <div className={styles.editArea}>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className={styles.editTextarea}
                                            autoFocus
                                        />
                                        <div className={styles.editActions}>
                                            <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                                            <button onClick={() => handleUpdate(event._id)} className={styles.saveBtn}>Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.description}>{event.content}</p>
                                )}

                                {eventAttachments.length > 0 && (
                                    <div className={styles.attachments}>
                                        {eventAttachments.map(a => (
                                            <AttachmentLink key={a._id} attachment={a} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {results && (
                                <div className={styles.intelSection}>
                                    <div className={styles.intelCard}>
                                        <div className={styles.intelHeader}>
                                            <Sparkles size={14} /> Executive Summary
                                        </div>
                                        <div className={styles.intelContent}>
                                            <p>{results.summary || "Generating overview of findings..."}</p>
                                        </div>

                                        {results.actionItems && results.actionItems.length > 0 && (
                                            <div style={{ marginTop: 8 }}>
                                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginBottom: 12, fontWeight: 700 }}>Key Action Items</h4>
                                                <ul className={styles.actionList}>
                                                    {results.actionItems.map((item, i) => (
                                                        <li key={i} className={styles.actionItem}>
                                                            <div className={styles.checkbox}><CheckSquare size={12} /></div>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {results.emailDraft && (
                                        <div className={styles.emailDraft}>
                                            <div className={styles.emailHeader}>
                                                <div className={styles.emailTitle}>
                                                    <Mail size={16} color="var(--primary)" />
                                                    <span>Draft Email to Client</span>
                                                </div>
                                                <span className={styles.optimizedBadge}>Optimized for Gmail</span>
                                            </div>

                                            <div className={styles.draftBox}>
                                                <span className={styles.draftSubject}>SUBJECT: {results.emailDraft.subject}</span>
                                                <p>{results.emailDraft.body}</p>
                                            </div>

                                            <div className={styles.emailActions}>
                                                <button className={styles.secondaryBtn} onClick={() => alert("Edit mode coming soon")}>
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className={`${styles.emailBtn} ${styles.sendBtn}`}
                                                    disabled={isSending === event._id || event.emailSent}
                                                    onClick={() => results.emailDraft && handleQueueEmail(results.emailDraft, event._id)}
                                                >
                                                    {event.emailSent ? "FINALIZE ALL" : "SEND TO MY WORK EMAIL"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AttachmentLink({ attachment }: { attachment: Attachment }) {
    const url = useQuery(api.attachments.getUrl, { storageId: attachment.storageId });

    return (
        <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attachmentItem}
            download={attachment.fileName}
            onClick={(e) => !url && e.preventDefault()}
        >
            {attachment.fileType.startsWith("image/") && url ? (
                <div
                    className={styles.attachmentPreview}
                    style={{ backgroundImage: `url(${url})` }}
                    aria-hidden
                />
            ) : (
                <div className={styles.fileIcon}>
                    <FileIcon size={16} />
                </div>
            )}
            <span className={styles.attachmentName}>{attachment.fileName}</span>
            <span className={styles.viewPreview}>View Preview</span>
        </a>
    );
}

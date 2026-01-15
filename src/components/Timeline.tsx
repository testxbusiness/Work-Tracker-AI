"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./Timeline.module.css";
import { MessageSquare, Phone, Users, FileText, Mail, Send, Paperclip, Sparkles, CheckSquare, ChevronRight, Loader2, Edit2, Trash2, X, Save } from "lucide-react";
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

    if (events === undefined || attachments === undefined) return <div>Loading timeline...</div>;

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

            // Trigger actual sending logic
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
            alert("Failed to send email. Check Outbox for details.");
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
            alert("Failed to update event.");
        }
    };

    const handleDelete = async (id: Id<"events">) => {
        if (!confirm("Are you sure you want to delete this event? This will also disconnect its attachments.")) return;
        try {
            await deleteEvent({ id });
        } catch (err) {
            console.error("Failed to delete event:", err);
            alert("Failed to delete event.");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "note": return <FileText size={18} />;
            case "call": return <Phone size={18} />;
            case "meeting": return <Users size={18} />;
            case "email": return <Mail size={18} />;
            case "doc_sent": return <Send size={18} />;
            case "audio_note": return <Phone size={18} />;
            default: return <MessageSquare size={18} />;
        }
    };

    return (
        <div className={styles.timeline}>
            {events.map((event, index) => {
                const eventAttachments = attachments.filter(a => a.eventId === event._id);
                const results = event.aiResults;

                return (
                    <div key={event._id} className={styles.eventItem}>
                        <div className={styles.iconWrapper}>
                            <div className={`${styles.icon} glass`}>
                                {getIcon(event.type)}
                            </div>
                            {index !== events.length - 1 && <div className={styles.line} />}
                        </div>
                        <div className={`${styles.content} glass`}>
                            <div className={styles.header}>
                                <span className={styles.type}>{event.type.replace('_', ' ')}</span>
                                <span className={styles.time}>
                                    {new Date(event.timestamp).toLocaleString()}
                                </span>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => {
                                            setEditingId(event._id);
                                            setEditContent(event.content);
                                        }}
                                        className={styles.actionBtn}
                                        title="Edit event"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className={`${styles.actionBtn} ${styles.delete}`}
                                        title="Delete event"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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
                                        <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>
                                            <X size={14} /> Cancel
                                        </button>
                                        <button onClick={() => handleUpdate(event._id)} className={styles.saveBtn}>
                                            <Save size={14} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.text}>{event.content}</p>
                            )}

                            {eventAttachments.length > 0 && (
                                <div className={styles.attachments}>
                                    {eventAttachments.map(a => (
                                        <AttachmentLink key={a._id} attachment={a} />
                                    ))}
                                </div>
                            )}

                            {event.aiStatus === "processing" && (
                                <div className={styles.aiResult}>
                                    <Sparkles size={14} className={styles.spin} /> AI is analyzing...
                                </div>
                            )}

                            {results && (
                                <div className={styles.aiCard}>
                                    <div className={styles.aiHeader}>
                                        <Sparkles size={14} /> AI Artifacts
                                    </div>

                                    {results.summary && (
                                        <div className={styles.aiSection}>
                                            <h4>Summary</h4>
                                            <p>{results.summary}</p>
                                        </div>
                                    )}

                                    {results.actionItems && results.actionItems.length > 0 && (
                                        <div className={styles.aiSection}>
                                            <h4>Action Items</h4>
                                            <ul className={styles.actionList}>
                                                {results.actionItems.map((item, i) => {
                                                    const loadingKey = `${event._id}-${i}`;
                                                    const isLoading = itemLoading === loadingKey;
                                                    return (
                                                        <li key={i}>
                                                            <div className={styles.actionItemContent}>
                                                                <CheckSquare size={14} /> <span>{item}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleActionItemEmail(item, event._id, i)}
                                                                className={styles.inlineActionBtn}
                                                                disabled={!!itemLoading}
                                                                title="Generate email for this item"
                                                            >
                                                                {isLoading ? <Loader2 size={12} className="spin" /> : <Mail size={12} />}
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {results.emailDraft && (
                                        <div className={styles.emailDraft}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h4>Suggested Email</h4>
                                                <button
                                                    onClick={() => results.emailDraft && handleQueueEmail(results.emailDraft, event._id)}
                                                    className={`${styles.queueButton} ${event.emailSent ? styles.sent : ""}`}
                                                    disabled={isSending === event._id || event.emailSent}
                                                >
                                                    {isSending === event._id ? (
                                                        <><Loader2 size={14} className="spin" /> Sending...</>
                                                    ) : event.emailSent ? (
                                                        <>Draft Sent <CheckSquare size={14} /></>
                                                    ) : (
                                                        <>Send Draft <ChevronRight size={14} /></>
                                                    )}
                                                </button>
                                            </div>
                                            <p className={styles.draftSubject}>Subject: {results.emailDraft.subject}</p>
                                            <p className={styles.draftBody}>{results.emailDraft.body}</p>
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

    if (!url) {
        return (
            <span className={`${styles.attachmentLink} ${styles.disabled}`}>
                <Paperclip size={14} />
                {attachment.fileName}
            </span>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attachmentLink}
            download={attachment.fileName}
        >
            <Paperclip size={14} />
            {attachment.fileName}
        </a>
    );
}

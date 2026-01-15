"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./EventCreator.module.css";
import { Send, FileText, Phone, Users, X } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { AudioRecorder } from "./AudioRecorder";

import { Id } from "convex/_generated/dataModel";

export function EventCreator({ matterId }: { matterId: Id<"matters"> }) {
    const [content, setContent] = useState("");
    const [type, setType] = useState("note");
    const [attachments, setAttachments] = useState<{ storageId: string, fileName: string, fileType: string }[]>([]);
    const createEvent = useMutation(api.events.create);
    const saveAttachment = useMutation(api.attachments.saveAttachment);
    const processAI = useAction(api.ai.processEventAI);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && attachments.length === 0) return;

        try {
            const eventId = await createEvent({
                matterId,
                type: attachments.some(a => a.fileType.includes("audio")) ? "audio_note" : type,
                content: content || (attachments.length > 0 ? `Attached ${attachments.length} file(s)` : ""),
            });

            const attachmentIds = [];
            for (const attachment of attachments) {
                await saveAttachment({
                    matterId,
                    eventId,
                    storageId: attachment.storageId as Id<"_storage">,
                    fileName: attachment.fileName,
                    fileType: attachment.fileType,
                });
                attachmentIds.push(attachment.storageId as Id<"_storage">);
            }

            // Trigger AI Pipeline
            processAI({
                eventId,
                content: content,
                attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
            }).catch(err => console.error("AI trigger failed:", err));

            setContent("");
            setAttachments([]);
        } catch (error) {
            console.error("Failed to add event:", error);
        }
    };

    const addAttachment = (storageId: string, fileName: string, fileType: string) => {
        setAttachments(prev => [...prev, { storageId, fileName, fileType }]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className={`${styles.container} glass`}>
            <div className={styles.typeSelector}>
                <button
                    type="button"
                    className={type === "note" ? styles.active : ""}
                    onClick={() => setType("note")}
                >
                    <FileText size={18} /> Internal Note
                </button>
                <button
                    type="button"
                    className={type === "call" ? styles.active : ""}
                    onClick={() => setType("call")}
                >
                    <Phone size={18} /> Client Call
                </button>
                <button
                    type="button"
                    className={type === "meeting" ? styles.active : ""}
                    onClick={() => setType("meeting")}
                >
                    <Users size={18} /> Meeting
                </button>
            </div>

            <div className={styles.inputWrapper}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Case intelligence: record details of this ${type}...`}
                />

                <div className={styles.actionsBar}>
                    <div className={styles.actionsGroup}>
                        <FileUploader matterId={matterId} onUploadComplete={addAttachment} />
                        <AudioRecorder onUploadComplete={addAttachment} />
                    </div>

                    <button type="submit" className={styles.sendButton} disabled={!content.trim() && attachments.length === 0}>
                        <Send size={18} />
                        <span>Log Entry</span>
                    </button>
                </div>
            </div>

            {attachments.length > 0 && (
                <div className={styles.attachmentList}>
                    {attachments.map((a, i) => (
                        <div key={i} className={styles.attachmentBadge}>
                            <span>{a.fileName}</span>
                            <button type="button" className={styles.removeBtn} onClick={() => removeAttachment(i)}><X size={14} /></button>
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
}

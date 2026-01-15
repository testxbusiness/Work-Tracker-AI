"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./FileUploader.module.css";
import { Paperclip, Loader2 } from "lucide-react";
import { Id } from "convex/_generated/dataModel";

export function FileUploader({ onUploadComplete }: { matterId: Id<"matters">, onUploadComplete: (storageId: string, fileName: string, fileType: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            onUploadComplete(storageId, file.name, file.type);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.uploader}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={styles.attachButton}
            >
                {uploading ? <Loader2 className={styles.spin} size={18} /> : <Paperclip size={18} />}
                {uploading ? "Uploading..." : "Attach File"}
            </button>
        </div>
    );
}

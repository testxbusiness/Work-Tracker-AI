"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./AudioRecorder.module.css";
import { Mic, Square, Loader2 } from "lucide-react";

export function AudioRecorder({ onUploadComplete }: { onUploadComplete: (storageId: string, fileName: string, fileType: string) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                await uploadAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async (blob: Blob) => {
        setUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": blob.type },
                body: blob,
            });
            const { storageId } = await result.json();
            onUploadComplete(storageId, `audio-note-${Date.now()}.webm`, blob.type);
        } catch (error) {
            console.error("Audio upload failed:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.recorder}>
            {isRecording ? (
                <button type="button" onClick={stopRecording} className={styles.stopButton}>
                    <Square size={18} fill="currentColor" /> Stop
                </button>
            ) : (
                <button type="button" onClick={startRecording} disabled={uploading} className={styles.recordButton}>
                    {uploading ? <Loader2 className={styles.spin} size={18} /> : <Mic size={18} />}
                    {uploading ? "Uploading..." : "Record Audio"}
                </button>
            )}
        </div>
    );
}

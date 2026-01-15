"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import styles from "./Settings.module.css";
import { Save, Mail, Shield, Brain, Loader2, Check } from "lucide-react";

export default function Settings() {
    const settings = useQuery(api.users.get);
    const updateSettings = useMutation(api.users.update);
    const getAuthUrl = useAction(api.auth.getGoogleAuthUrl);
    const disconnect = useMutation(api.auth.disconnectGoogle);

    const [workEmail, setWorkEmail] = useState("");
    const [autoAI, setAutoAI] = useState(true);
    const [autoOCR, setAutoOCR] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleConnectGmail = async () => {
        try {
            const url = await getAuthUrl();
            window.location.href = url;
        } catch (err) {
            console.error("Auth failed:", err);
            alert("Failed to get authorization URL.");
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect your Google account?")) return;
        try {
            await disconnect();
        } catch (err) {
            console.error("Disconnect failed:", err);
            alert("Failed to disconnect.");
        }
    };

    useEffect(() => {
        if (settings) {
            setWorkEmail(settings.workEmail);
            setAutoAI(settings.autoAI);
            setAutoOCR(settings.autoOCR);
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            await updateSettings({
                workEmail,
                autoAI,
                autoOCR
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            alert("Error saving settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (settings === undefined) return <div className="p-8">Loading settings...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Settings</h1>
                <p className="text-muted">Configure your personal tracker preferences.</p>
            </header>

            <div className={styles.sectionGrid}>
                <section className={`${styles.section} glass`}>
                    <div className={styles.sectionHeader}>
                        <Mail size={20} className={styles.icon} />
                        <h2>Email Integration</h2>
                    </div>
                    <div className={styles.field}>
                        <label>Default Work Email</label>
                        <input
                            type="email"
                            value={workEmail}
                            onChange={(e) => setWorkEmail(e.target.value)}
                            placeholder="Where to send AI drafts"
                        />
                        <p className={styles.hint}>AI-generated reports and drafts will be sent here by default.</p>
                    </div>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 size={18} className="spin" /> : (saved ? <Check size={18} /> : <Save size={18} />)}
                        {isSaving ? "Saving..." : (saved ? "Saved!" : "Save Preferences")}
                    </button>
                </section>

                <section className={`${styles.section} glass`}>
                    <div className={styles.sectionHeader}>
                        <Brain size={20} className={styles.icon} />
                        <h2>AI Behavior</h2>
                    </div>
                    <div className={styles.toggleField}>
                        <div>
                            <label>Auto-process notes</label>
                            <p className={styles.hint}>Trigger AI summary automatically on new notes.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoAI}
                            onChange={(e) => setAutoAI(e.target.checked)}
                        />
                    </div>
                    <div className={styles.toggleField}>
                        <div>
                            <label>Auto-extract text (OCR)</label>
                            <p className={styles.hint}>Automatically run OCR on uploaded images/PDFs.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={autoOCR}
                            onChange={(e) => setAutoOCR(e.target.checked)}
                        />
                    </div>
                </section>

                <section className={`${styles.section} glass`}>
                    <div className={styles.sectionHeader}>
                        <Mail size={20} className={styles.icon} />
                        <h2>Gmail Connection</h2>
                    </div>
                    <p className={styles.hint} style={{ marginBottom: '16px' }}>
                        Authorize the app to send emails on your behalf via Gmail API.
                    </p>
                    {settings?.googleRefreshToken ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className={styles.connectedBadge}>
                                <Check size={16} /> Gmail Connected
                            </div>
                            <button
                                className={styles.disconnectButton}
                                onClick={handleDisconnect}
                            >
                                Disconnect Account
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.connectButton}
                            onClick={handleConnectGmail}
                        >
                            Connect Google Account
                        </button>
                    )}
                </section>

                <section className={`${styles.section} glass`}>
                    <div className={styles.sectionHeader}>
                        <Shield size={20} className={styles.icon} />
                        <h2>Account & Security</h2>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                        Managed by Clerk. Access tokens and API keys are stored securely on the server.
                    </p>
                </section>
            </div>
        </div>
    );
}

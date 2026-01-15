"use client";

import { useEffect, useState } from "react";
import { useAction, useConvexAuth } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/Loader";

export default function OAuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const handleCallback = useAction(api.auth.handleGoogleCallback);
    const [status, setStatus] = useState("Processing authorization...");
    const [processed, setProcessed] = useState(false);

    useEffect(() => {
        if (processed || isLoading || !isAuthenticated) return;

        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (code && state) {
            setProcessed(true);
            handleCallback({ code, state })
                .then(() => {
                    setStatus("Successfully connected! Redirecting...");
                    setTimeout(() => router.push("/settings"), 1500);
                })
                .catch((err) => {
                    console.error("OAuth callback failed:", err);
                    setStatus("Connection failed. Please try again.");
                });
        }
    }, [searchParams, handleCallback, router, isAuthenticated, isLoading, processed]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
        }}>
            <Loader size={40} />
            <p>{status}</p>
        </div>
    );
}

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { GMAIL_CONFIG } from "./config";

export const sendEmail = action({
    args: {
        outboxId: v.id("outbox"),
        to: v.string(),
        subject: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        // 1. Fetch outbox item and verify ownership
        const outbox = await ctx.runQuery(internal.outbox.getInternal, { id: args.outboxId });
        if (!outbox || outbox.userId !== identity.subject) {
            throw new Error("Unauthorized: Outbox item not found or ownership mismatch");
        }

        const { clientId, clientSecret } = GMAIL_CONFIG;

        // Fetch tokens from settings
        const settings = await ctx.runQuery(internal.users.getInternal, { userId: identity.subject });
        if (!settings || !settings.googleRefreshToken) {
            throw new Error("GMAIL_DISCONNECTED: Account non collegato. Collega Gmail dalle impostazioni.");
        }

        let accessToken = settings.googleAccessToken;
        const expiresAt = settings.googleTokenExpiresAt || 0;

        // 1. Refresh token if expired
        if (Date.now() > expiresAt - 60000) { // 1 min buffer
            const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: clientId!,
                    client_secret: clientSecret!,
                    refresh_token: settings.googleRefreshToken,
                    grant_type: "refresh_token",
                }),
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                accessToken = data.access_token;
                await ctx.runMutation(internal.auth.storeTokens, {
                    userId: identity.subject,
                    accessToken: data.access_token,
                    expiresIn: data.expires_in,
                });
            } else {
                const err = await refreshResponse.text();
                throw new Error("Failed to refresh Gmail token: " + err);
            }
        }

        try {
            // 2. Send Email via Gmail API
            const raw = createRawEmail(args.to, args.subject, args.body);
            const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ raw }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gmail API error: ${error}`);
            }

            const data = await response.json();

            await ctx.runMutation(internal.outbox.updateStatus, {
                id: args.outboxId,
                status: "sent",
                providerMessageId: data.id,
            });

            return { success: true };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error during Gmail send";
            console.error("Gmail send failed:", error);
            await ctx.runMutation(internal.outbox.updateStatus, {
                id: args.outboxId,
                status: "failed",
                error: errorMessage,
            });
            return { success: false, error: errorMessage };
        }
    },
});

// Helper for RFC2822 (simplified)
function createRawEmail(to: string, subject: string, body: string) {
    const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=utf-8`,
        ``,
        body,
    ].join("\r\n");

    // Use a compatible base64 implementation for Convex/Web
    const bytes = new TextEncoder().encode(email);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

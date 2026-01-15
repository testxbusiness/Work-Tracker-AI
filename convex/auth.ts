import { v } from "convex/values";
import { mutation, action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { GMAIL_CONFIG } from "./config";

export const getGoogleAuthUrl = action({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const scopes = [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/gmail.send"
        ];

        const params = new URLSearchParams({
            client_id: GMAIL_CONFIG.clientId!,
            redirect_uri: GMAIL_CONFIG.redirectUri,
            response_type: "code",
            scope: scopes.join(" "),
            access_type: "offline",
            prompt: "consent",
            state: identity.subject, // Use userId as state for simple verification
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },
});

export const handleGoogleCallback = action({
    args: { code: v.string(), state: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity || identity.subject !== args.state) {
            throw new Error(`Invalid state or unauthenticated.`);
        }

        // 2. Exchange code for tokens
        const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code: args.code,
                client_id: GMAIL_CONFIG.clientId!,
                client_secret: GMAIL_CONFIG.clientSecret!,
                redirect_uri: GMAIL_CONFIG.redirectUri,
                grant_type: "authorization_code",
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to exchange code: ${error}`);
        }

        const data = await response.json();

        // 3. Save tokens to user settings
        await ctx.runMutation(internal.auth.storeTokens, {
            userId: identity.subject,
            accessToken: data.access_token,
            refreshToken: data.refresh_token, // This is only sent on the first time or if prompt=consent
            expiresIn: data.expires_in,
        });

        return { success: true };
    },
});

export const storeTokens = internalMutation({
    args: {
        userId: v.string(),
        accessToken: v.string(),
        refreshToken: v.optional(v.string()),
        expiresIn: v.number(),
    },
    handler: async (ctx, args) => {
        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (settings) {
            await ctx.db.patch(settings._id, {
                googleAccessToken: args.accessToken,
                googleRefreshToken: args.refreshToken || (settings as any).googleRefreshToken,
                googleTokenExpiresAt: Date.now() + args.expiresIn * 1000,
            });
        } else {
            await ctx.db.insert("userSettings", {
                userId: args.userId,
                workEmail: "", // Default empty, user can update in settings
                autoAI: true,
                autoOCR: true,
                googleAccessToken: args.accessToken,
                googleRefreshToken: args.refreshToken,
                googleTokenExpiresAt: Date.now() + args.expiresIn * 1000,
            });
        }
    },
});

export const disconnectGoogle = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const settings = await ctx.db
            .query("userSettings")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .unique();

        if (settings) {
            await ctx.db.patch(settings._id, {
                googleAccessToken: null,
                googleRefreshToken: null,
                googleTokenExpiresAt: null,
            });
        }
    },
});

// This file is a placeholder for external API configurations
// In Convex, you should set these in the Dashboard > Settings > Environment Variables

export const AI_CONFIG = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    whisperModel: "whisper-1",
    gptModel: "gpt-4o",
};

export const GMAIL_CONFIG = {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET,
    redirectUri: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "") + "/oauth/callback",
};

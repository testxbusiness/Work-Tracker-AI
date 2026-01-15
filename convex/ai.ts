import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const processEventAI = action({
    args: {
        eventId: v.id("events"),
        content: v.string(),
        attachmentIds: v.optional(v.array(v.id("_storage"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthenticated");

        const event = await ctx.runQuery(internal.events.getInternal, { id: args.eventId });
        if (!event || event.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const settings = await ctx.runQuery(internal.users.getInternal, { userId: identity.subject });

        await ctx.runMutation(internal.events.updateAIStatus, { id: args.eventId, status: "processing" });

        try {
            let contextMessage = args.content;

            if (args.attachmentIds && args.attachmentIds.length > 0) {
                for (const storageId of args.attachmentIds) {
                    const attachment = await ctx.runQuery(internal.attachments.getInternal, { storageId });
                    if (!attachment) continue;

                    if (attachment.fileType.includes("audio")) {
                        const transcription = await ctx.runAction(api.ai.transcribeAudio, { storageId });
                        contextMessage += `\n\n[TRASCRIZIONE AUDIO (${attachment.fileName})]: ${transcription}`;
                    } else if (attachment.fileType.includes("image") && (settings?.autoOCR !== false)) {
                        const extractedText = await ctx.runAction(api.ai.extractTextFromImage, { storageId });
                        contextMessage += `\n\n[TESTO ESTRATTO DA IMMAGINE (${attachment.fileName})]: ${extractedText}`;
                    } else if (attachment.fileType.includes("pdf")) {
                        contextMessage += `\n\n[ALLEGATO PDF]: ${attachment.fileName} (Analisi testuale diretta in arrivo)`;
                    }
                }
            }

            if (settings?.autoAI !== false) {
                const results = await ctx.runAction(api.ai.generateAIArtifacts, {
                    eventId: args.eventId,
                    content: contextMessage
                });
                await ctx.runMutation(internal.events.updateAIResults, { id: args.eventId, results });
            } else {
                await ctx.runMutation(internal.events.updateAIStatus, { id: args.eventId, status: "done" });
            }

        } catch (error) {
            await ctx.runMutation(internal.events.updateAIStatus, { id: args.eventId, status: "failed" });
        }
    },
});

export const transcribeAudio = action({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const apiKey = AI_CONFIG.openaiApiKey;
        if (!apiKey) {
            console.warn("OpenAI API Key missing, skipping transcription.");
            return "[Trascrizione non disponibile: API Key mancante]";
        }

        const file = await ctx.storage.get(args.storageId);
        if (!file) {
            throw new Error("File not found in storage");
        }

        const formData = new FormData();
        formData.append("file", file, "audio.mp3"); // Using generic name, Whisper detects format
        formData.append("model", AI_CONFIG.whisperModel || "whisper-1");
        formData.append("language", "it"); // Optimize for Italian as requested

        try {
            const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Whisper API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.text;

        } catch (error) {
            console.error("Transcription failed:", error);
            throw error;
        }
    },
});

export const extractTextFromImage = action({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const apiKey = AI_CONFIG.openaiApiKey;
        if (!apiKey) {
            console.warn("OpenAI API Key missing, skipping OCR.");
            return "[OCR non disponibile: API Key mancante]";
        }

        const file = await ctx.storage.get(args.storageId);
        if (!file) throw new Error("File not found in storage");

        // Get file as base64 for GPT-4o vision
        const arrayBuffer = await file.arrayBuffer();
        const base64Image = btoa(
            new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        // Fetch attachment metadata for MIME type
        const attachment = await ctx.runQuery(internal.attachments.getInternal, { storageId: args.storageId });
        const mimeType = attachment?.fileType || "image/jpeg";

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Trascrivi fedelmente tutto il testo presente in questa immagine. Se ci sono tabelle o elenchi, mantieni la struttura. Rispondi solo con il testo estratto in italiano." },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${mimeType};base64,${base64Image}`,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    const error = JSON.parse(responseText);
                    errorMessage = error.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = responseText.slice(0, 200);
                }
                throw new Error(`OpenAI Vision Error: ${errorMessage}`);
            }

            const data = JSON.parse(responseText) as {
                choices: Array<{ message: { content: string } }>
            };
            return data.choices[0].message.content;

        } catch (error) {
            throw error;
        }
    },
});

import { AI_CONFIG } from "./config";

export const generateAIArtifacts = action({
    args: { eventId: v.id("events"), content: v.string() },
    handler: async (ctx, args) => {
        const apiKey = AI_CONFIG.openaiApiKey;
        const model = AI_CONFIG.gptModel;

        if (!apiKey) {
            console.warn("OpenAI API Key missing. Falling back to improved mock.");
            const contentSnippet = args.content.slice(0, 100);
            return {
                summary: args.content.length > 20 ? `Sommario di: ${contentSnippet}...` : undefined,
                minutes: `Discussione dettagliata su: ${args.content}`,
                actionItems: ["Seguire i punti discussi in: " + contentSnippet],
                emailDraft: args.content.length > 20 ? {
                    subject: "Follow-up: " + contentSnippet.split('\n')[0],
                    body: `Ciao,\n\nTi scrivo in merito alla nostra discussione su: ${args.content}.\n\nCordiali saluti,`,
                } : undefined
            };
        }

        const prompt = `
            Analizza la seguente nota/evento di lavoro e genera gli artefatti strutturati in LINGUA ITALIANA:
            1. summary: Un sommario conciso in testo semplice (stringa). IMPORTANTE: Se il contenuto è troppo breve o privo di senso, lascia questo campo vuoto o non includerlo.
            2. minutes: Verbale dettagliato in testo semplice o markdown (stringa).
            3. actionItems: Una lista di punti d'azione (array di stringhe).
            4. emailDraft: Una bozza di email professionale per il follow-up (oggetto con "subject" e corpo con "body" come stringhe). 
               REQUISITO CRITICO: Genera la bozza email SOLO SE è stato possibile generare un sommario valido. Se "summary" è vuoto o assente, NON generare "emailDraft".

            CONTENUTO DA ANALIZZARE:
            ${args.content}

            Rispondi esclusivamente in formato JSON. Assicurati che TUTTI i contenuti testuali siano in ITALIANO.
        `;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "Sei un assistente legale e amministrativo professionale. Rispondi SEMPRE in LINGUA ITALIANA e usa il formato JSON richiesto." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                }),
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    const error = JSON.parse(responseText);
                    errorMessage = error.error?.message || errorMessage;
                } catch (e) {
                    errorMessage = responseText.slice(0, 200); // Capture start of HTML if it's not JSON
                }
                throw new Error(`OpenAI API Error (${response.status}): ${errorMessage}`);
            }

            const data = JSON.parse(responseText) as {
                choices: Array<{ message: { content: string } }>
            };

            const result = typeof data.choices[0].message.content === 'string'
                ? JSON.parse(data.choices[0].message.content)
                : data.choices[0].message.content;

            interface AIResult {
                summary?: string;
                minutes?: string;
                actionItems?: string[];
                emailDraft?: { subject: string; body: string };
            }

            const typedResult = result as AIResult;

            // Sanitization: Ensure summary and minutes are strings to satisfy Convex schema
            if (typedResult.summary && typeof typedResult.summary !== 'string') typedResult.summary = JSON.stringify(typedResult.summary);
            if (typedResult.minutes && typeof typedResult.minutes !== 'string') typedResult.minutes = JSON.stringify(typedResult.minutes);

            // Ensure actionItems is an array of strings
            if (!Array.isArray(typedResult.actionItems)) {
                typedResult.actionItems = typedResult.actionItems ? [String(typedResult.actionItems)] : [];
            } else {
                typedResult.actionItems = typedResult.actionItems.map((item: unknown) => typeof item === 'string' ? item : JSON.stringify(item));
            }

            // Ensure emailDraft is removed if summary is not present (User Requirement)
            if (!typedResult.summary || (typeof typedResult.summary === 'string' && typedResult.summary.trim() === '')) {
                delete typedResult.emailDraft;
                typedResult.summary = undefined;
            }

            return typedResult;

        } catch (error) {
            console.error("AI Artifact Generation failed:", error);
            throw error;
        }
    },
});

export const generateDraftFromActionItem = action({
    args: { actionItem: v.string() },
    handler: async (ctx, args) => {
        const apiKey = AI_CONFIG.openaiApiKey;
        const model = AI_CONFIG.gptModel;

        if (!apiKey) {
            return {
                subject: `Follow-up: ${args.actionItem.slice(0, 30)}...`,
                body: `Ciao,\n\nTi scrivo in merito a: ${args.actionItem}.\n\nCordiali saluti,`,
            };
        }

        const prompt = `
            Genera una bozza di email professionale in LINGUA ITALIANA basata sul seguente punto d'azione:
            "${args.actionItem}"

            L'email deve essere breve, cortese e pronta da inviare.
            Rispondi esclusivamente in formato JSON con i campi:
            { "subject": "Oggetto dell'email", "body": "Corpo dell'email" }
        `;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "Sei un assistente legale e amministrativo professionale. Rispondi SEMPRE in LINGUA ITALIANA e usa il formato JSON richiesto." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                }),
            });

            const responseText = await response.text();
            if (!response.ok) throw new Error(`OpenAI Error: ${responseText}`);

            const data = JSON.parse(responseText) as {
                choices: Array<{ message: { content: string } }>
            };

            const result = JSON.parse(data.choices[0].message.content);
            return result as { subject: string; body: string };

        } catch (error) {
            console.error("Single draft generation failed:", error);
            throw error;
        }
    },
});

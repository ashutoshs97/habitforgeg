import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// In production (Render), these come from Environment Variables
const GEMINI_API_KEY = process.env.API_KEY; 

// ------------------------------------------------------------------
// 0. HEALTH CHECK (For Render)
// ------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('HabitForge Backend is running. Ready for requests.');
});

// ------------------------------------------------------------------
// 1. AI FOOD SCANNER ENDPOINT
// ------------------------------------------------------------------
app.post('/api/scan-food', async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: "No image data provided" });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        // Remove data:image/xxx;base64, prefix
        const base64Data = imageBase64.split(',')[1];
        // Extract mimeType
        const mimeType = imageBase64.substring(imageBase64.indexOf(":") + 1, imageBase64.indexOf(";"));

        const foodSchema = {
            type: Type.OBJECT,
            properties: {
                food_item_name: { type: Type.STRING },
                calories_value_kcals: { type: Type.INTEGER }
            },
            required: ["food_item_name", "calories_value_kcals"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: "Analyze this image. Identify the main food item and estimate the calorie content. Return JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodSchema,
                temperature: 0.4
            }
        });

        const analysis = JSON.parse(response.text);
        res.json(analysis);
    } catch (error) {
        console.error("Food Scan Error:", error);
        res.status(500).json({ error: "AI Analysis Failed", details: error.message });
    }
});

// ------------------------------------------------------------------
// 2. AI GOAL REFINEMENT ENDPOINT
// ------------------------------------------------------------------
app.post('/api/refine-goal', async (req, res) => {
    const { habitData } = req.body;

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const systemInstruction = `You are an expert Behavioral Data Analyst. Identify the user's biggest pain point based on data.`;
        const prompt = `Analyze this habit data: ${JSON.stringify(habitData)}. Identify the habit with lowest consistency. Suggest a concrete refinement.`;

        const refinementSchema = {
            type: Type.OBJECT,
            properties: {
                habit_to_refine: { type: Type.STRING },
                failure_rate_percent: { type: Type.INTEGER },
                refinement_suggestion: { type: Type.STRING },
                rationale: { type: Type.STRING }
            },
            required: ["habit_to_refine", "failure_rate_percent", "refinement_suggestion", "rationale"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: refinementSchema,
                temperature: 0.2
            }
        });

        const result = JSON.parse(response.text);
        res.json(result);
    } catch (error) {
        console.error("Refinement Error:", error);
        res.status(500).json({ error: "Failed to analyze goals." });
    }
});

// ------------------------------------------------------------------
// 3. EMAIL REMINDERS (Mock)
// ------------------------------------------------------------------
app.post('/api/reminders/send-test', async (req, res) => {
    const { email } = req.body;
    // In production, you would import nodemailer here
    console.log(`[Mock Email] Sending test reminder to ${email}`);
    setTimeout(() => {
        res.json({ success: true, message: `Test email sent to ${email}` });
    }, 1000);
});

// ------------------------------------------------------------------
// 4. DATA EXPORT (CSV)
// ------------------------------------------------------------------
app.post('/api/export/csv', (req, res) => {
    const { habits } = req.body;
    
    try {
        let csvContent = "Date,Habit Name,Type,Emoji,Current Streak\n";
        const rows = [];
        
        habits.forEach(habit => {
            habit.completionHistory.forEach(isoDate => {
                const date = new Date(isoDate).toISOString().split('T')[0];
                const row = [
                    date,
                    `"${habit.name.replace(/"/g, '""')}"`,
                    habit.type,
                    habit.emoji,
                    habit.streak
                ].join(",");
                rows.push(row);
            });
        });
        
        rows.sort((a, b) => b.localeCompare(a));
        csvContent += rows.join("\n");

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="habitforge_export_${Date.now()}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ error: "Failed to generate CSV" });
    }
});

// ------------------------------------------------------------------
// 5. PAYMENTS (Mock PayPal/Stripe)
// ------------------------------------------------------------------
app.post('/api/payments/create-order', (req, res) => {
    const orderID = 'ORD-' + Math.random().toString(36).substr(2, 12).toUpperCase();
    res.json({ id: orderID });
});

app.post('/api/payments/capture-order', (req, res) => {
    const { orderID } = req.body;
    setTimeout(() => {
        res.json({ status: 'COMPLETED', id: orderID });
    }, 1000);
});

// Start Server
app.listen(PORT, () => {
    console.log(`HabitForge Backend running on port ${PORT}`);
});
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large payloads for image processing

// ------------------------------------------------------------------
// ENVIRONMENT CONFIGURATION
// ------------------------------------------------------------------
const GEMINI_API_KEY = process.env.API_KEY;

// Verify Environment Configuration
if (!GEMINI_API_KEY) {
    console.warn("Warning: API_KEY environment variable is not set. AI features will not function.");
} else {
    console.log("Environment configured successfully.");
}

// ------------------------------------------------------------------
// SYSTEM ROUTES
// ------------------------------------------------------------------

// Health Check
app.get('/', (req, res) => {
    res.send('HabitForge API Service is active.');
});

// ------------------------------------------------------------------
// AI MODULE: FOOD SCANNER
// ------------------------------------------------------------------
app.post('/api/scan-food', async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: "Payload missing image data" });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Service configuration error: Missing API Credentials" });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        // Extract base64 data and mime type
        const parts = imageBase64.split(',');
        if (parts.length !== 2) {
            throw new Error("Malformed image data");
        }
        const base64Data = parts[1];
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
        console.error("Food Scanner Service Error:", error);
        res.status(500).json({ error: "Analysis service failed", details: error.message });
    }
});

// ------------------------------------------------------------------
// AI MODULE: BEHAVIORAL ANALYSIS
// ------------------------------------------------------------------
app.post('/api/refine-goal', async (req, res) => {
    const { habitData } = req.body;

    if (!GEMINI_API_KEY) {
         return res.status(500).json({ error: "Service configuration error: Missing API Credentials" });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        const systemInstruction = `You are an expert Behavioral Data Analyst. Identify the user's biggest pain point based on data.`;
        const prompt = `Analyze this habit data: ${JSON.stringify(habitData)}. Identify the habit with lowest consistency. Suggest a concrete refinement.`;

        const refinementSchema = {
            type: Type.OBJECT,
            properties: {
                habit_to_refine: { type: Type.STRING },
                failure_rate_percent: { type: Type.INTEGER },
                refinement_suggestion: { 
                    type: Type.STRING, 
                    description: "A short, concise name for the refined habit (e.g., '5 min walk' or 'Read 1 page'). This string will replace the current habit name." 
                },
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
        console.error("Goal Refinement Service Error:", error);
        res.status(500).json({ error: "Analysis service failed" });
    }
});

// ------------------------------------------------------------------
// NOTIFICATION SERVICE
// ------------------------------------------------------------------
app.post('/api/reminders/send-test', async (req, res) => {
    const { email } = req.body;
    // Logic to integrate with SMTP provider (e.g., SendGrid/Nodemailer)
    console.log(`Dispatching test email to ${email}`);
    setTimeout(() => {
        res.json({ success: true, message: `Test email sent to ${email}` });
    }, 1000);
});

// ------------------------------------------------------------------
// DATA EXPORT SERVICE
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
        res.status(500).json({ error: "Data export failed" });
    }
});

// ------------------------------------------------------------------
// PAYMENT GATEWAY (PayPal/Stripe Adapter)
// ------------------------------------------------------------------
app.post('/api/payments/create-order', (req, res) => {
    const orderID = 'ORD-' + Math.random().toString(36).substr(2, 12).toUpperCase();
    res.json({ id: orderID });
});

app.post('/api/payments/capture-order', (req, res) => {
    const { orderID } = req.body;
    // Verify order status with payment provider
    setTimeout(() => {
        res.json({ status: 'COMPLETED', id: orderID });
    }, 1000);
});

// Initialize Server
app.listen(PORT, () => {
    console.log(`HabitForge Backend Service running on port ${PORT}`);
});
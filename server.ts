import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze-vision', async (req, res) => {
  try {
    const { imageBase64, prompt, customKey } = req.body;
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing Gemini API Key' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              }
            }
          ]
        }
      ]
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Vision API error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

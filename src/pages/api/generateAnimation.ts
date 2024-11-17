import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

const cors = Cors({
  methods: ['POST'],
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, callback: (result: unknown) => void) => void) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const { prompt } = req.body;

    const firstPrompt = "Generate detailed and extensive Manim code based on the following user query. Do not include any comments or explanations in the code. User query: ";

    const modifiedPrompt = firstPrompt + prompt;

    try {
      console.log('Starting code generation');
      const codeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/code/generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: modifiedPrompt, model: "gpt-4o" }),
      });

      if (!codeResponse.ok) {
        throw new Error("Failed to generate code. Please try again.");
      }

      const codeData = await codeResponse.json();
      const pythonCode = codeData.code.replace(/```python|```/g, "").trim();

      console.log('Starting video rendering');
      const renderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/video/rendering`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: pythonCode,
          file_name: "GenScene.py",
          file_class: "GenScene",
          iteration: 585337 + Math.floor(Math.random() * 1000),
          project_name: "GenScene",
        }),
      });

      if (!renderResponse.ok) {
        throw new Error("Failed to render video. Please try again.");
      }

      const renderData = await renderResponse.json();

      if (!renderData.video_url) {
        throw new Error("No video URL received from the server.");
      }

      res.status(200).json({ videoUrl: renderData.video_url, code: pythonCode });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({ error: err instanceof Error ? err.message : 'An unknown error occurred' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';

interface GenerateAnimationRequest extends NextApiRequest {
  body: {
    prompt: string;
  };
}

interface GenerateAnimationResponse {
  videoUrl: string;
  code: string;
}

interface ErrorResponse {
  error: string;
}

export default async function handler(
  req: GenerateAnimationRequest,
  res: NextApiResponse<GenerateAnimationResponse | ErrorResponse>
) {
  if (req.method === 'POST') {
    const { prompt } = req.body;

    const modifiedPrompt = "YOU ARE THE BEST MANIM CODER WITH 30 YRS OF EXPERIENCE. MAKE THE MANIM CODE LONGER AND DETAILED. DON'T ADD COMMENTS. ONLY RETURN WITH THE CODE, NO COMMENTARY FROM THIS USER QUERY: " + prompt;

    try {
      const codeResponse = await fetch(`https://api.animo.video/v1/code/generation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: modifiedPrompt, model: "gpt-4o" }),
      });

      if (!codeResponse.ok) {
        throw new Error("Failed to generate code. Please try again.");
      }

      const codeData = await codeResponse.json();
      const pythonCode = codeData.code.replace(/```python|```/g, "").trim();

      const renderResponse = await fetch(`https://api.animo.video/v1/video/rendering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      res.status(500).json({ error: (err as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

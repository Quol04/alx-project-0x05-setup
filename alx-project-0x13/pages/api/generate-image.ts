import { HEIGHT, WIDTH } from "@/constants/index";
import { RequestProps } from "@/interfaces/index";
import { NextApiRequest, NextApiResponse } from "next"


const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  const gptApiKey = process.env.NEXT_PUBLIC_GPT_API_KEY;
  const gptUrl = "https://chatgpt-42.p.rapidapi.com/texttoimage";

  if (!gptApiKey || !gptUrl) {
    return response.status(500).json({ error: "API key or URL is missing in environment variables" });
  }

  try {
    const { prompt }: RequestProps = request.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return response.status(400).json({ error: "Missing or invalid 'prompt' in request body" });
    }

    const res = await fetch(gptUrl, {
      method: "POST",
      body: JSON.stringify({
        text: prompt,
        width: WIDTH,
        height: HEIGHT,
      }),
      headers: {
        "x-rapidapi-key": gptApiKey.trim(),
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      console.error("Downstream API returned non-OK status:", res.status, text);
      return response.status(502).json({ error: "Downstream API error", details: text });
    }

    const data = await res.json();

    return response.status(200).json({
      message: data?.generated_image || "https://via.placeholder.com/600x400?text=Generated+Image",
    });
  } catch (error: any) {
    console.error("Error in API route:", error?.message || error);
    return response.status(500).json({ error: "Internal server error", details: error?.message || String(error) });
  }
}

export default handler
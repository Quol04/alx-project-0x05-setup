# HookMastery: Image Generation with GPT-based APIs

HookMastery is a Next.js web application that lets users generate AI-powered images from text prompts. The project demonstrates how to build a simple React + Next.js frontend that posts prompts to a server-side API route, which forwards requests to a third-party image-generation provider (via RapidAPI in this repo). It includes client-side validation, server-side request forwarding, and a small component for displaying generated images.

## Table of contents

- Project overview
- Quick start
- Environment variables
- Project structure
- API contract (server)
- Frontend behavior and components
- Troubleshooting & common errors
- Security & deployment notes
- Next steps and improvements

## Project overview

Primary features:

- Input a text prompt and request an image to be generated
- Server-side API route that forwards the prompt to a third-party image-generation API
- Displays the most recently generated image and a small gallery of previous images

This repository contains a few similar example projects (in `alx-project-0x07`, `alx-project-0x08`, `alx-project-0x09`, `alx-project-0x11`, etc.). The active project for this readme is `alx-project-0x11` (the one with the implemented `generate-image` API route).

## Quick start

Prerequisites:

- Node.js (16+ recommended)
- npm (or pnpm/yarn)

1. Install dependencies

```powershell
npm install
```

2. Add environment variables (see Environment variables below).

3. Run the development server

```powershell
npm run dev
```

4. Open http://localhost:3000 in your browser and use the prompt input to generate images.

## Environment variables

This project expects an API key for the third-party image generation service. The code currently reads `process.env.NEXT_PUBLIC_GPT_API_KEY` in the server API. For security it's recommended to change this to a server-only variable (for example `GPT_API_KEY`) and update the API code accordingly.

Create a `.env.local` file in the project root and add:

```
# RapidAPI key for the chatgpt-42/texttoimage API
NEXT_PUBLIC_GPT_API_KEY=your_rapidapi_key_here

# (Optional) PORT override
PORT=3000
```

Important: Do NOT commit your API keys to source control.

## Project structure (relevant parts)

- `pages/index.tsx` — Main frontend page with input and gallery; contains `handleGenerateImage` that POSTs to `/api/generate-image`.
- `components/common/ImageCard.tsx` — Small presentational component that shows an image and its prompt.
- `pages/api/generate-image.ts` — Server-side Next.js API route. Validates `prompt` and forwards the request to the external API.
- `constants/index.ts` — Image width/height constants used by the server route.
- `interfaces/index.ts` — TypeScript interfaces used across components and API route.

## API contract (server)

POST /api/generate-image

Request body (application/json):

```
{
	"prompt": "A descriptive text prompt for the image"
}
```

Responses:

- 200 OK
  - { message: string } — `message` contains a URL to the generated image (or placeholder URL when the provider didn't return one)
- 400 Bad Request
  - { error: "Missing or invalid 'prompt' in request body" }
- 502 Bad Gateway
  - { error: "Downstream API error", details: string | null }
- 500 Internal Server Error
  - { error: "Internal server error", details: string }

The server-side handler forwards the prompt as JSON to the external RapidAPI endpoint:

POST https://chatgpt-42.p.rapidapi.com/texttoimage

Body example sent to provider:

```
{ "text": "<prompt>", "width": 512, "height": 512 }
```

Headers include `x-rapidapi-key` and `x-rapidapi-host`.

## Frontend behavior and components

- `handleGenerateImage` (in `pages/index.tsx`) will:
  - Validate the prompt input (non-empty).
  - POST the prompt to `/api/generate-image` with Content-Type application/json.
  - If the response is OK, parse JSON and read `message` (image URL), set it to `imageUrl`, and add it to the `generatedImages` gallery state.
  - On error, the code logs details to the console and shows a simple alert to the user.

`ImageCard` accepts:

```
{ imageUrl: string, prompt: string, action: (imagePath: string) => void, width?: string, height?: string }
```

Clicking an `ImageCard` calls `action(imageUrl)` which sets the main `imageUrl` to the clicked image, showing it at the top.

## Troubleshooting & common errors

1. Empty prompt / no UI response

   - The frontend now blocks empty prompts. If you see an alert asking to enter a prompt, type one and try again.

2. API returns 500 / 502

   - Check the server console where `npm run dev` is running. The API route logs details for downstream responses and exceptions.
   - Confirm the environment variable `NEXT_PUBLIC_GPT_API_KEY` (or renamed `GPT_API_KEY`) is set and valid.

3. No image URL in response

   - The server will return a placeholder URL when the provider does not include a `generated_image` field. Check server logs and provider response in the server console.

4. Key exposed in client bundle
   - The variable name `NEXT_PUBLIC_GPT_API_KEY` is prefixed with `NEXT_PUBLIC_`, which causes Next.js to expose it to the client bundle. Move the key to a non-public variable: rename to `GPT_API_KEY` and update the API route to read `process.env.GPT_API_KEY`.

## Security & deployment notes

- Never expose API keys to the client. Use server-side environment variables for secret keys.
- For production, store keys in your deployment platform's secure environment settings (e.g., Vercel Environment Variables, AWS Secrets Manager).
- Rate limiting: consider adding server-side rate limiting to prevent misuse.


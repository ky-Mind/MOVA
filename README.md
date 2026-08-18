# Creator AI Studio

A mobile-first AI creative studio: prompt -> prompt enhancement -> image/video generation -> preview -> download.

## Stack
- Next.js App Router
- Google Gemini API
- Gemini 3.6 Flash for prompt understanding
- Gemini 3.1 Flash Image for image generation/editing
- Veo 3.1 for video generation

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Set `GEMINI_API_KEY`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open `http://localhost:3000`.

## Deploy to Vercel

Import this repository into Vercel and add `GEMINI_API_KEY` as an Environment Variable for Production/Preview/Development as needed.

## Important

Generated video jobs are asynchronous. The browser polls the operation until completion. For production scale, add authentication, rate limiting, persistent project storage (e.g. Supabase Storage), job persistence, and a queue.

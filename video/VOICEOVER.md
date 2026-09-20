# Pocket Pact — voiceover guide

The video is **99 seconds**, with no spoken audio so you can record your own. Read naturally; the times mark visual cuts. Keep the final eight seconds clear enough to let judges read both URLs and the credits.

| Time | Suggested narration |
| --- | --- |
| 00:00–00:05 | “Pocket Pact helps families plan pocket money without turning it into surveillance.” |
| 00:05–00:11 | “Ananya is at college. Her dad Kunal gives her a thousand rupees for the week, and they make a plan together.” |
| 00:11–00:18 | “She can see what’s left for meals, commute, study and her own choices. The plan guides spending; it doesn’t lock her money.” |
| 00:18–00:25 | “When she spends, she can type it, upload a photo, or dictate it. Gemini and Sarvam help capture the details.” |
| 00:25–00:31 | “She reviews every suggestion. A food photo alone can’t tell us the price, so we ask her to confirm it.” |
| 00:31–00:38 | “If a purchase falls outside their agreed preference, Pocket Pact gently flags it. The expense is still saved, with her explanation.” |
| 00:38–00:45 | “Kunal sees her side, the shared photo and the note. He can acknowledge it and reply instead of silently judging a category.” |
| 00:45–00:51 | “Monthly insights show spending, contributions and conversations, so next week’s plan can be more realistic.” |
| 00:51–00:57 | “The same private-wallet flow works for parents, guardians and mentors. Each person has their own account and role.” |
| 00:57–01:04 | “The frontend is React and Vite. Fastify handles sessions and wallet logic. PostgreSQL stores durable records, while Cedar enforces role permissions.” |
| 01:04–01:13 | “Our live prototype runs on one low-cost Amazon Lightsail instance in Mumbai. Caddy serves the frontend over HTTPS and proxies the API; PostgreSQL runs locally on the instance.” |
| 01:13–01:19 | “Cedar runs inside that API. It allows owner expenses, supporter top-ups and mutual pact changes, and denies access to other wallets.” |
| 01:19–01:27 | “When usage grows, CloudFront can serve the frontend from S3, while replicated APIs use managed PostgreSQL and private receipt storage. That’s our next-stage design, separate from what’s deployed today.” |
| 01:27–01:31 | “We learned to start with a small cloud footprint while still designing for privacy, durability and clear permissions.” |
| 01:31–01:39 | “Try the live demo or inspect the code at the URLs on screen. Pocket Pact is by Piyush Kumar, Tanishk Khandelwal and Khushal Midha.” |

The video frames are authored in `video.html`. `render.cjs` produces the browser capture, then the MP4 export can be regenerated with the local ffmpeg binary. The captured examples are fictional; the live prototype records money sent elsewhere and does not transfer funds.

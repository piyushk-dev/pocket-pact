# Pocket Pact — spoken demo script

Video length: **2:06**. About **288 spoken words**, roughly 137 words per minute. Speak as if you’re showing the product to a friend. The times below match the recorded actions; leave small pauses rather than stretching every sentence. Say “a thousand rupees,” “AWS,” and “Cedar” normally. The three names are on the closing screen, so you don’t need to read them aloud.

## 0:00–0:07 · The hook

A burger expense tells you what someone bought. It doesn’t tell you the college mess was closed.

## 0:07–0:15 · Ananya’s week

Ananya’s at college. Her dad, Kunal, sends her a thousand rupees a week. Pocket Pact helps them plan it together.

## 0:15–0:24 · Their plan

Meals, travel, books, and a little for herself. They’ve also agreed on two fast-food meals a week. The choices are still hers.

## 0:24–0:33 · Record the purchase

Today, she buys a burger. She uploads a photo, adds what she paid, and lets the AI help fill in the details.

## 0:33–0:39 · Review it

She checks the amount and category, and confirms the fast-food tag. Nothing’s saved until she’s ready.

## 0:39–0:50 · The important bit

It’s her third fast-food meal, so there’s a flag. But the mess was closed after lab. She adds that explanation and shares the photo.

## 0:50–1:13 · Kunal’s side

Now, Kunal’s side. He sees the expense and the reason behind it. That changes the conversation.

He can reply, “Thanks for explaining. Let’s plan for late classes next week.” And acknowledge it.

The point is to give Ananya room to explain, and Kunal enough context to understand.

## 1:13–1:20 · The bigger picture

Monthly insights show where the money went, so they can make a more realistic plan for next time.

## 1:20–1:25 · Who it’s for

It works for guardians and mentors too, with separate accounts and private invitations.

## 1:25–1:45 · How we built it

We built this with React, Fastify, and PostgreSQL, on one small Amazon Lightsail instance. Caddy handles HTTPS.

AWS’s open-source Cedar checks each person’s permissions. Gemini helps read expenses; Sarvam handles voice input. That processing happens through the API, keeping the keys off the browser.

## 1:45–1:58 · How it grows

As usage grows, we’d add CloudFront and S3, run multiple API instances, and move the database to RDS. For now, Lightsail keeps the prototype inexpensive.

## 1:58–2:06 · Close

Pocket money, with a little more understanding. Try Pocket Pact and explore the code at the links on screen.

---

Recording notes: this is a real, working demo using fictional Ananya/Kunal sample data. Pocket Pact records contributions and spending; it does not transfer money. The architecture separates the current deployment from the future design. The file `v2/timing.json` records the actual chapter start times for this take.

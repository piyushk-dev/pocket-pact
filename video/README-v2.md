# Pocket Pact demo, version 2

The finished export is `output/pocket-pact-demo-v2.mp4`: **2:06, 1920 × 1080, H.264, 30 fps**, with silent audio ready for a recorded voiceover. The script is `VOICEOVER-v2.md`; its chapter cues match this take.

This version records the actual deployed app using fictional demo-wallet data. The first 85 seconds show the product: landing, weekly plan, photo upload, real AI analysis, owner review, expense flag, shared explanation, supporter reply, monthly insights, and the account page. The final section shows professional diagrams for the current deployment and future scale, followed by both URLs and the three team members.

`capture-v2.cjs` automates the real UI in Playwright and saves high-quality timestamped frames. `export-v2.sh` encodes those frames; it does not globally speed up the take. `architecture-v2.html` holds the editable diagrams and closing card. `v2/timing.json` records the chapter times and browser errors (none in the completed take). The completed take had no AI retry cuts.

The capture uses the installed local Playwright/Chromium and ffmpeg paths in these scripts. To repeat it in this workspace:

```sh
node capture-v2.cjs
bash export-v2.sh
```

Run from `/home/thequacker/pocket-pact-video`, where the source assets and frame directories live. Set `DEMO_ORIGIN` to change the app URL. Re-recording creates a fresh isolated demo wallet and calls the configured AI provider. Frame images and the MP4 are kept outside the product repository; editable source is backed up under the repository's `video/` directory.

Verification: the recorded flow reached acknowledgement and monthly insights without browser errors; sampled frames of the input, reply, both diagrams, and credits were checked for legibility. The export duration and codec were checked. This is a desktop demonstration, not a new mobile-app QA run.

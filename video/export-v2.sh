#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
ffmpeg_bin="/tmp/pocket-video-tools/node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
"$ffmpeg_bin" -hide_banner -y -f concat -safe 0 -i "$root/v2/frames.ffconcat" \
  -f lavfi -i anullsrc=r=48000:cl=stereo \
  -map 0:v:0 -map 1:a:0 -vf 'fps=30,scale=1920:1080:flags=lanczos' \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -threads 6 \
  -c:a aac -b:a 96k -shortest -movflags +faststart \
  "$root/output/pocket-pact-demo-v2.mp4"

#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
ffmpeg_bin="/tmp/pocket-video-tools/node_modules/@ffmpeg-installer/linux-x64/ffmpeg"
"$ffmpeg_bin" -hide_banner -y \
  -ss 2 -i "$root/raw/pocket-pact-film.webm" \
  -f lavfi -i anullsrc=r=48000:cl=stereo \
  -map 0:v:0 -map 1:a:0 \
  -vf 'setpts=0.8865*(PTS-STARTPTS),fps=30' \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -t 99 -shortest -movflags +faststart \
  "$root/output/pocket-pact-demo.mp4"

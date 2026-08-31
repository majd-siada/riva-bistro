#!/usr/bin/env bash
# Fallback cinematic placeholders when generated images are missing.
set -euo pipefail
ROOT="/workspace/apps/web/public"
MENU="$ROOT/menu"
SCENES="$ROOT/scenes"
mkdir -p "$MENU" "$SCENES"

make_image() {
  local out="$1"
  local hue="${2:-30}"
  if [[ -f "$out" ]]; then return 0; fi
  ffmpeg -y -f lavfi -i "color=c=0x120f0e:s=1200x900" -vf "noise=alls=20:allf=t+u,eq=brightness=-0.05:saturation=1.2,hue=h=${hue}" -frames:v 1 -q:v 3 "$out" 2>/dev/null
}

SLUGS=(
  burrata carpaccio skagen-pa-brioche tomatsoppa getost marinerade-oliver
  entrecote laxfile ribs pasta-alfredo pasta-carbonara pasta-scampi
  caesarsallad raksallad halloumisallad pommes-frites sotpotatispommes grillade-gronsaker
  chokladfondant tiramisu creme-brulee lemonad coca-cola mineralvatten
  rott-vin vitt-vin rose-vin
)

i=0
for slug in "${SLUGS[@]}"; do
  make_image "$MENU/${slug}.jpg" "$((20 + i % 40))"
  i=$((i + 1))
done

make_image "$SCENES/hero-food.jpg" 25
make_image "$SCENES/menu-tabletop.jpg" 35
make_image "$SCENES/home-interior.jpg" 15
make_image "$SCENES/contact-interior.jpg" 20
make_image "$SCENES/booking-table.jpg" 30
make_image "$SCENES/private-event.jpg" 18

if [[ ! -f "$ROOT/og-image.jpg" ]]; then
  cp "$SCENES/hero-food.jpg" "$ROOT/og-image.jpg"
fi

echo "Placeholder images ready under $ROOT"

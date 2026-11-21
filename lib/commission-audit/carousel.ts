/**
 * Pure manual horizontal carousel helpers for mobile swipe sections.
 * No autoplay, no infinite looping, no auto-scroll — strictly tracks the
 * nearest snapped card to the user's current manual scroll position.
 */

export function computeActiveCarouselIndex(
  scrollLeft: number,
  cardOffsets: readonly number[],
): number {
  if (cardOffsets.length === 0) return 0;

  let closestIndex = 0;
  let smallestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < cardOffsets.length; i += 1) {
    const distance = Math.abs(scrollLeft - cardOffsets[i]);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex;
}

export function clampCarouselIndex(index: number, itemCount: number): number {
  if (itemCount <= 0) return 0;
  return Math.max(0, Math.min(itemCount - 1, Math.trunc(index)));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampCarouselIndex,
  computeActiveCarouselIndex,
} from './carousel';

test('computeActiveCarouselIndex returns 0 for empty offsets or initial scrollLeft', () => {
  assert.equal(computeActiveCarouselIndex(0, []), 0);
  assert.equal(computeActiveCarouselIndex(0, [0, 340, 680]), 0);
});

test('computeActiveCarouselIndex picks nearest snapped card offset without wrap-around', () => {
  const offsets = [0, 340, 680, 1020];
  assert.equal(computeActiveCarouselIndex(120, offsets), 0);
  assert.equal(computeActiveCarouselIndex(210, offsets), 1);
  assert.equal(computeActiveCarouselIndex(650, offsets), 2);
  assert.equal(computeActiveCarouselIndex(1180, offsets), 3);
});

test('clampCarouselIndex bounds target index cleanly without infinite looping', () => {
  assert.equal(clampCarouselIndex(-2, 3), 0);
  assert.equal(clampCarouselIndex(1, 3), 1);
  assert.equal(clampCarouselIndex(9, 3), 2);
  assert.equal(clampCarouselIndex(1, 0), 0);
});

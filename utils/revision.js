import addDays from 'date-fns/addDays';

export const REVISION_INTERVALS = [1, 3, 7, 15, 30, 90];

export function scheduleRevision(dayNum, existingState = {}) {
  const reviewCount = existingState.reviewCount || 0;
  const intervalIndex = Math.min(reviewCount, REVISION_INTERVALS.length - 1);
  const intervalDays = REVISION_INTERVALS[intervalIndex];
  const now = new Date();

  return {
    nextReviewAt: addDays(now, intervalDays),
    intervalDays,
    reviewCount: reviewCount + 1,
    lastReviewedAt: now,
  };
}

export function initRevisionOnComplete(dayNum) {
  return scheduleRevision(dayNum, { reviewCount: 0 });
}

export function markRevisionDone(dayNum, existingState) {
  return scheduleRevision(dayNum, existingState);
}

export const REVIEW_TRANSITIONS = {
  Submitted: ['Reviewed', 'Returned'],
  Reviewed: ['Finalized', 'Returned'],
  Draft: [],
  Returned: [],
  Finalized: [],
};

export function canEvaluatorEditStatus(status) {
  return status === 'Draft' || status === 'Returned';
}

export function canStartNewEvaluation(windowState) {
  return windowState === 'Open';
}

export function canContinueEvaluation(windowState, currentStatus) {
  if (windowState === 'Closed') return false;
  if (!canEvaluatorEditStatus(currentStatus)) return false;
  return windowState === 'Open' || windowState === 'Grace Period';
}

export function assertReviewTransition(fromStatus, toStatus) {
  const allowed = REVIEW_TRANSITIONS[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    throw Object.assign(new Error(`Invalid evaluation transition: ${fromStatus} → ${toStatus}.`), {
      code: 'INVALID_TRANSITION',
      fromStatus,
      toStatus,
    });
  }
}

export function assertEvaluationWindow(windowState, { isNew, currentStatus }) {
  if (windowState === 'Closed') {
    throw Object.assign(new Error('The evaluation window is closed.'), { code: 'WINDOW_CLOSED' });
  }
  if (isNew && windowState !== 'Open') {
    throw Object.assign(new Error('New evaluations can only be started while the evaluation window is Open.'), { code: 'WINDOW_RESTRICTED' });
  }
  if (!isNew && !canContinueEvaluation(windowState, currentStatus)) {
    throw Object.assign(new Error('This evaluation can no longer be edited by the evaluator.'), { code: 'IMMUTABLE_EVALUATION' });
  }
}

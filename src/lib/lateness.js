// Helpers to determine whether a submission was on time or late.
// Task deadlines are DATE columns (YYYY-MM-DD); submissions carry a
// full timestamp. A submission counts as late when it lands after the
// end of the deadline day.

function toDateOnly(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isSubmissionLate(submittedAt, deadline) {
  const submittedDay = toDateOnly(submittedAt);
  const deadlineDay = toDateOnly(deadline);
  if (!submittedDay || !deadlineDay) return false;
  return submittedDay.getTime() > deadlineDay.getTime();
}

export function lateDaysCount(submittedAt, deadline) {
  const submittedDay = toDateOnly(submittedAt);
  const deadlineDay = toDateOnly(deadline);
  if (!submittedDay || !deadlineDay) return 0;
  const diff = submittedDay.getTime() - deadlineDay.getTime();
  return Math.max(0, Math.round(diff / (24 * 60 * 60 * 1000)));
}

export function submissionTiming(submittedAt, deadline) {
  const late = isSubmissionLate(submittedAt, deadline);
  if (!late) return { late: false, label: 'On time', daysLate: 0 };
  const daysLate = lateDaysCount(submittedAt, deadline);
  return {
    late: true,
    label: daysLate <= 1 ? 'Late' : `${daysLate} days late`,
    daysLate,
  };
}

export function taskTiming(deadline, status) {
  if (status === 'verified' || status === 'rejected') {
    return { show: false };
  }
  const deadlineDay = toDateOnly(deadline);
  if (!deadlineDay) return { show: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((deadlineDay.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) {
    return { show: true, overdue: true, label: Math.abs(diffDays) <= 1 ? 'Yesterday' : `${Math.abs(diffDays)}d late` };
  }
  if (diffDays <= 3) {
    return {
      show: true,
      overdue: false,
      label: diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `${diffDays}d left`,
    };
  }
  return { show: false };
}

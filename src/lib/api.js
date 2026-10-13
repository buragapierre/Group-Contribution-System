import supabase from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function recalculateContributions(classId) {
  const res = await fetch(`${API_URL}/api/contributions/recalculate`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ class_id: classId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to recalculate contributions');
  }
  return res.json();
}

export async function fetchReminders() {
  const res = await fetch(`${API_URL}/api/tasks/reminders`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch reminders');
  }
  return res.json();
}

export async function submitTaskViaApi(taskId, files, comment) {
  const res = await fetch(`${API_URL}/api/submissions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ task_id: taskId, files, comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to submit task');
  }
  return res.json();
}

export async function reviewSubmissionViaApi(submissionId, action) {
  const res = await fetch(`${API_URL}/api/submissions/${submissionId}/review`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify({ action }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to review submission');
  }
  return res.json();
}

export async function getSubmissionFileUrl(submissionId, path) {
  const res = await fetch(
    `${API_URL}/api/submissions/${submissionId}/file?path=${encodeURIComponent(path)}`,
    { headers: await authHeaders() }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to open file');
  }
  const { url } = await res.json();
  return url;
}

export async function startTaskViaApi(taskId) {
  const res = await fetch(`${API_URL}/api/tasks/${taskId}/start`, {
    method: 'PATCH',
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to start task');
  }
  return res.json();
}

export async function exportContributionsPdf(classId) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const res = await fetch(`${API_URL}/api/reports/contributions?class_id=${classId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to export PDF');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `contributions-class-${classId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchNotifications() {
  const res = await fetch(`${API_URL}/api/notifications`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch notifications');
  }
  return res.json();
}

export async function fetchRatings(groupId) {
  const res = await fetch(`${API_URL}/api/ratings?group_id=${groupId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch ratings');
  }
  return res.json();
}

export async function fetchClassRatings(classId) {
  const res = await fetch(`${API_URL}/api/ratings?class_id=${classId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch ratings');
  }
  return res.json();
}

export async function saveRating(groupId, ratedUserId, score, comment = '') {
  const res = await fetch(`${API_URL}/api/ratings`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ group_id: groupId, rated_user_id: ratedUserId, score, comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to save rating');
  }
  return res.json();
}

export async function verifySessionViaApi() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || 'Session verification failed');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

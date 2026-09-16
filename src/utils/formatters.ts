export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString?: string): string {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeString;
  }
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case 'registration':
    case 'registered':
      return {
        label: 'Registration',
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'pitched':
      return {
        label: 'Pitched',
        bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      };
    case 'interested':
      return {
        label: 'Interested',
        bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
      };
    case 'call back':
    case 'callback':
      return {
        label: 'Call Back',
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'not interested':
      return {
        label: 'Not Interested',
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status || 'New Lead',
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

export function getCallBackUrgency(callBackTime?: string): { isOverdue: boolean; isToday: boolean; text: string } {
  if (!callBackTime) return { isOverdue: false, isToday: false, text: 'No time set' };
  
  try {
    const cbDate = new Date(callBackTime);
    const now = new Date();
    
    const isOverdue = cbDate.getTime() < now.getTime();
    const isToday = cbDate.toDateString() === now.toDateString();

    const formatted = formatDateTime(callBackTime);
    return {
      isOverdue,
      isToday,
      text: formatted,
    };
  } catch {
    return { isOverdue: false, isToday: false, text: callBackTime };
  }
}

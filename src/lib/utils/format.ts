/** Returns a relative time string like "2 min ago", "3h ago", "1d ago" */
export function formatRelativeTime(isoDate: string): string {
	const now = Date.now();
	const then = new Date(isoDate).getTime();
	const diffMs = now - then;

	if (diffMs < 0) return 'just now';

	const seconds = Math.floor(diffMs / 1000);
	if (seconds < 60) return `${seconds}s ago`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} min ago`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;

	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;

	const years = Math.floor(months / 12);
	return `${years}y ago`;
}

/** Returns a formatted absolute date string */
export function formatAbsoluteTime(isoDate: string): string {
	const date = new Date(isoDate);
	return date.toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
}

/** Returns a human-readable duration string like "1.2s", "45ms" */
export function formatDuration(ms: number): string {
	if (ms < 1) return '0ms';
	if (ms < 1000) return `${Math.round(ms)}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	const minutes = Math.floor(ms / 60_000);
	const remainingSeconds = ((ms % 60_000) / 1000).toFixed(0);
	return `${minutes}m ${remainingSeconds}s`;
}

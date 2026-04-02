import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatAbsoluteTime, formatDuration } from './format';

describe('formatRelativeTime', () => {
	it('returns seconds ago for recent times', () => {
		const now = new Date(Date.now() - 30_000).toISOString();
		expect(formatRelativeTime(now)).toBe('30s ago');
	});

	it('returns minutes ago', () => {
		const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
		expect(formatRelativeTime(fiveMinAgo)).toBe('5 min ago');
	});

	it('returns hours ago', () => {
		const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
		expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
	});

	it('returns days ago', () => {
		const twoDaysAgo = new Date(Date.now() - 2 * 86400_000).toISOString();
		expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
	});

	it('returns "just now" for future dates', () => {
		const future = new Date(Date.now() + 60_000).toISOString();
		expect(formatRelativeTime(future)).toBe('just now');
	});
});

describe('formatAbsoluteTime', () => {
	it('returns a formatted date string', () => {
		const result = formatAbsoluteTime('2024-01-15T10:30:00Z');
		expect(result).toBeTruthy();
		expect(typeof result).toBe('string');
		// Should contain year and some time component
		expect(result).toContain('2024');
	});
});

describe('formatDuration', () => {
	it('formats sub-millisecond as 0ms', () => {
		expect(formatDuration(0.5)).toBe('0ms');
	});

	it('formats milliseconds', () => {
		expect(formatDuration(45)).toBe('45ms');
		expect(formatDuration(999)).toBe('999ms');
	});

	it('formats seconds', () => {
		expect(formatDuration(1200)).toBe('1.2s');
		expect(formatDuration(5000)).toBe('5.0s');
	});

	it('formats minutes and seconds', () => {
		expect(formatDuration(90_000)).toBe('1m 30s');
	});
});

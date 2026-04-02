import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from './logger';
import { mockInvoke } from '$lib/test/setup';

describe('Logger', () => {
	beforeEach(() => {
		mockInvoke.clearResponses();
		mockInvoke.mockResponse('append_log', undefined);
		vi.restoreAllMocks();
		logger.setDebug(false);
	});

	it('logs WARN and ERROR when debug is disabled', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		logger.warn('test', 'warning message');
		logger.error('test', 'error message');
		logger.debug('test', 'debug message');
		logger.info('test', 'info message');

		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(errorSpy).toHaveBeenCalledTimes(1);
		expect(logSpy).not.toHaveBeenCalled();
	});

	it('logs all levels when debug is enabled', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		logger.setDebug(true);
		logger.debug('test', 'debug message');
		logger.info('test', 'info message');
		logger.warn('test', 'warning message');
		logger.error('test', 'error message');

		expect(logSpy).toHaveBeenCalledTimes(2); // debug + info
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(errorSpy).toHaveBeenCalledTimes(1);
	});

	it('includes timestamp, level, and module in console output', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		logger.warn('my-module', 'test message');

		const call = warnSpy.mock.calls[0][0] as string;
		expect(call).toMatch(/\[\d{4}-\d{2}-\d{2}T/);
		expect(call).toContain('[WARN]');
		expect(call).toContain('[my-module]');
	});

	it('fires Tauri append_log for WARN/ERROR even when debug is off', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		logger.warn('test', 'warn msg');
		logger.error('test', 'error msg');

		expect(mockInvoke.fn).toHaveBeenCalledTimes(2);
		expect(mockInvoke.fn).toHaveBeenCalledWith('append_log', expect.any(Object));
	});
});

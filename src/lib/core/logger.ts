import { invoke } from '@tauri-apps/api/core';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	module: string;
	message: string;
	data?: Record<string, unknown>;
}

class Logger {
	private debugEnabled = false;

	setDebug(enabled: boolean): void {
		this.debugEnabled = enabled;
	}

	debug(module: string, message: string, data?: Record<string, unknown>): void {
		if (this.debugEnabled) this.log('DEBUG', module, message, data);
	}

	info(module: string, message: string, data?: Record<string, unknown>): void {
		if (this.debugEnabled) this.log('INFO', module, message, data);
	}

	warn(module: string, message: string, data?: Record<string, unknown>): void {
		this.log('WARN', module, message, data);
	}

	error(module: string, message: string, data?: Record<string, unknown>): void {
		this.log('ERROR', module, message, data);
	}

	private log(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): void {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			module,
			message,
			data
		};

		const prefix = `[${entry.timestamp}] [${level}] [${module}]`;
		if (level === 'ERROR') console.error(prefix, message, data ?? '');
		else if (level === 'WARN') console.warn(prefix, message, data ?? '');
		else console.log(prefix, message, data ?? '');

		// File output via Tauri (fire-and-forget)
		if (this.debugEnabled || level === 'ERROR' || level === 'WARN') {
			invoke('append_log', { entry: JSON.stringify(entry) }).catch(() => {});
		}
	}
}

export const logger = new Logger();

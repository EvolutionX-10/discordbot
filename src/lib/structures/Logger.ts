import {
	cyanBright,
	Color,
	yellowBright,
	redBright,
	magentaBright,
} from 'colorette';
import { LogLevel } from '#lib/enums';

export class Logger {
	public setLevel(level: LogLevel): void {
		this.level = level;
	}
	public getLevel(): LogLevel {
		return this.level;
	}
	public log(
		level: LogLevel,
		type: LogLevelString,
		color: Color,
		message: string,
		...args: unknown[]
	): void {
		if (level > this.level) return;
		console.log(`[${color(type)}] - ${message}`, ...args);
	}
	public info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Info, 'INFO', cyanBright, message, ...args);
	}
	public warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Warn, 'WARN', yellowBright, message, ...args);
	}
	public error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Error, 'ERROR', redBright, message, ...args);
	}
	public debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Debug, 'DEBUG', magentaBright, message, ...args);
	}
	private level: LogLevel = LogLevel.Info;
}

type LogLevelString = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

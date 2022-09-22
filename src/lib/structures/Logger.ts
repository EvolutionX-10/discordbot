import { LogLevel } from '#lib/enums';
import {
	Color,
	cyanBright,
	gray,
	magentaBright,
	redBright,
	yellowBright,
} from 'colorette';

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
		console[type](
			`[${color(
				type
					.toUpperCase()
					.padStart(type.length + (7 - type.length) / 2)
					.padEnd(7)
			)}] - ${message}`,
			...args
		);
	}
	public info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Info, 'info', cyanBright, message, ...args);
	}
	public warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Warn, 'warn', yellowBright, message, ...args);
	}
	public error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Error, 'error', redBright, message, ...args);
	}
	public debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Debug, 'debug', magentaBright, gray(message), ...args);
	}
	private level: LogLevel = LogLevel.Info;
}

type LogLevelString = 'info' | 'warn' | 'error' | 'debug';

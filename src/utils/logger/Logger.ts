import type { ILogContext, ILogger } from './ILogger';
import { LogLevel } from './LogLevel';

const LEVEL_LABELS: Readonly<Record<LogLevel, string>> = {
  [LogLevel.Trace]: 'TRACE',
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO',
  [LogLevel.Warning]: 'WARNING',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
};

function formatContext(context?: ILogContext): string {
  if (!context) return '';
  const parts: string[] = [];
  if (context.entityId) parts.push(`entity=${context.entityId}`);
  if (context.commandId) parts.push(`command=${context.commandId}`);
  return parts.length > 0 ? ` (${parts.join(', ')})` : '';
}

/** Writes timestamped, leveled log lines for one subsystem to the console. */
export class Logger implements ILogger {
  private readonly subsystem: string;
  private readonly minLevel: LogLevel;

  constructor(subsystem: string, minLevel: LogLevel) {
    this.subsystem = subsystem;
    this.minLevel = minLevel;
  }

  trace(message: string, context?: ILogContext): void { this.write(LogLevel.Trace, message, context); }
  debug(message: string, context?: ILogContext): void { this.write(LogLevel.Debug, message, context); }
  info(message: string, context?: ILogContext): void { this.write(LogLevel.Info, message, context); }
  warning(message: string, context?: ILogContext): void { this.write(LogLevel.Warning, message, context); }
  error(message: string, context?: ILogContext): void { this.write(LogLevel.Error, message, context); }
  fatal(message: string, context?: ILogContext): void { this.write(LogLevel.Fatal, message, context); }

  private write(level: LogLevel, message: string, context?: ILogContext): void {
    if (level < this.minLevel) return;
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${LEVEL_LABELS[level]}] [${this.subsystem}] ${message}${formatContext(context)}`;
    this.emit(level, line);
  }

  private emit(level: LogLevel, line: string): void {
    if (level >= LogLevel.Error) console.error(line);
    else if (level === LogLevel.Warning) console.warn(line);
    else if (level === LogLevel.Info) console.info(line);
    else console.debug(line);
  }
}
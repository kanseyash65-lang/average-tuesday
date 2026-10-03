/** Optional identifiers attached to a log line so it can be traced later. */
export interface ILogContext {
  readonly entityId?: string;
  readonly commandId?: string;
}

/** Subsystem-scoped logger. Depend on this interface, not on the class. */
export interface ILogger {
  trace(message: string, context?: ILogContext): void;
  debug(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  warning(message: string, context?: ILogContext): void;
  error(message: string, context?: ILogContext): void;
  fatal(message: string, context?: ILogContext): void;
}
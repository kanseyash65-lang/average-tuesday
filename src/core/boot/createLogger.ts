import type { ILogger } from '../../utils/logger/ILogger';
import { Logger } from '../../utils/logger/Logger';
import { LOG_CONFIG } from '../config/logConfig';

/** Creates a logger for one subsystem, using the project-wide log level. */
export function createLogger(subsystem: string): ILogger {
  return new Logger(subsystem, LOG_CONFIG.minLevel);
}
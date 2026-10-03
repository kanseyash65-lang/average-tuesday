export const LogLevel = {
  Trace: 0,
  Debug: 1,
  Info: 2,
  Warning: 3,
  Error: 4,
  Fatal: 5,
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
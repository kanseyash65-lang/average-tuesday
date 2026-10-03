import { describe, expect, it, vi } from 'vitest';
import type { ILogger } from '../../utils/logger/ILogger';
import { EventBus } from './EventBus';

interface ITestEvents {
  readonly Ping: { readonly id: number };
  readonly Pong: { readonly id: number };
}

function createFakeLogger(): ILogger {
  return {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };
}

function createBus(maxEventsPerFlush = 100): { bus: EventBus<ITestEvents>; logger: ILogger } {
  const logger = createFakeLogger();
  return { bus: new EventBus<ITestEvents>(logger, maxEventsPerFlush), logger };
}

describe('EventBus', () => {
  it('does not call handlers until flush', () => {
    const { bus } = createBus();
    const handler = vi.fn();
    bus.on('Ping', handler);
    bus.emit('Ping', { id: 1 });
    expect(handler).not.toHaveBeenCalled();
    bus.flush();
    expect(handler).toHaveBeenCalledWith({ id: 1 });
  });

  it('delivers events in the order they were emitted', () => {
    const { bus } = createBus();
    const received: number[] = [];
    bus.on('Ping', (event) => received.push(event.id));
    bus.on('Pong', (event) => received.push(event.id));
    bus.emit('Ping', { id: 1 });
    bus.emit('Pong', { id: 2 });
    bus.emit('Ping', { id: 3 });
    bus.flush();
    expect(received).toEqual([1, 2, 3]);
  });

  it('stops delivering after unsubscribe', () => {
    const { bus } = createBus();
    const handler = vi.fn();
    const unsubscribe = bus.on('Ping', handler);
    unsubscribe();
    bus.emit('Ping', { id: 1 });
    bus.flush();
    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps delivering when one handler throws, and logs the error', () => {
    const { bus, logger } = createBus();
    const survivor = vi.fn();
    bus.on('Ping', () => {
      throw new Error('boom');
    });
    bus.on('Ping', survivor);
    bus.emit('Ping', { id: 1 });
    bus.flush();
    expect(survivor).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('delivers events emitted by handlers within the same flush', () => {
    const { bus } = createBus();
    const pongs: number[] = [];
    bus.on('Ping', (event) => bus.emit('Pong', { id: event.id + 1 }));
    bus.on('Pong', (event) => pongs.push(event.id));
    bus.emit('Ping', { id: 1 });
    bus.flush();
    expect(pongs).toEqual([2]);
  });

  it('defers events past the flush limit to the next flush and warns', () => {
    const { bus, logger } = createBus(2);
    const received: number[] = [];
    bus.on('Ping', (event) => received.push(event.id));
    [1, 2, 3].forEach((id) => bus.emit('Ping', { id }));
    bus.flush();
    expect(received).toEqual([1, 2]);
    expect(logger.warning).toHaveBeenCalledTimes(1);
    bus.flush();
    expect(received).toEqual([1, 2, 3]);
  });

  it('freezes payloads so events stay immutable', () => {
    const { bus } = createBus();
    const payload = { id: 1 };
    bus.emit('Ping', payload);
    expect(Object.isFrozen(payload)).toBe(true);
  });
});
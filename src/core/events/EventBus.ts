import type { ILogger } from '../../utils/logger/ILogger';
import type { EventHandler, IEventBus, Unsubscribe } from './IEventBus';

type QueuedTask = () => void;

/**
 * Queues events and delivers them in order on flush().
 * Events emitted by handlers during a flush are delivered in the same flush,
 * up to maxEventsPerFlush; the rest wait for the next flush.
 */
export class EventBus<TEvents extends object> implements IEventBus<TEvents> {
  private readonly logger: ILogger;
  private readonly maxEventsPerFlush: number;
  private readonly listeners = new Map<keyof TEvents, Set<EventHandler<TEvents[keyof TEvents]>>>();
  private queue: QueuedTask[] = [];

  constructor(logger: ILogger, maxEventsPerFlush: number) {
    this.logger = logger;
    this.maxEventsPerFlush = maxEventsPerFlush;
  }

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): Unsubscribe {
    const stored = handler as EventHandler<TEvents[keyof TEvents]>;
    const handlers = this.getOrCreateHandlers(event);
    handlers.add(stored);
    return () => {
      handlers.delete(stored);
    };
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    // Events describe facts that already happened, so nobody may change them.
    Object.freeze(payload);
    this.queue.push(() => this.dispatch(event, payload));
  }

  flush(): void {
    let processed = 0;
    while (processed < this.queue.length && processed < this.maxEventsPerFlush) {
      this.queue[processed]?.();
      processed += 1;
    }
    this.finishFlush(processed);
  }

  private finishFlush(processed: number): void {
    if (processed >= this.queue.length) {
      this.queue.length = 0;
      return;
    }
    this.queue = this.queue.slice(processed);
    this.logger.warning(
      `Flush limit of ${this.maxEventsPerFlush} reached; ${this.queue.length} events deferred to the next frame.`,
    );
  }

  private dispatch<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    // Copy so a handler can unsubscribe itself while we iterate.
    for (const handler of [...handlers]) {
      this.invoke(event, handler, payload);
    }
  }

  private invoke<K extends keyof TEvents>(
    event: K,
    handler: EventHandler<TEvents[keyof TEvents]>,
    payload: TEvents[K],
  ): void {
    try {
      handler(payload);
    } catch (error) {
      this.logger.error(`Handler for "${String(event)}" threw: ${String(error)}`);
    }
  }

  private getOrCreateHandlers(event: keyof TEvents): Set<EventHandler<TEvents[keyof TEvents]>> {
    let handlers = this.listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this.listeners.set(event, handlers);
    }
    return handlers;
  }
}
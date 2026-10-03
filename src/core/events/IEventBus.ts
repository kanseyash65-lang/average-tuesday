export type EventHandler<TPayload> = (payload: TPayload) => void;
export type Unsubscribe = () => void;

/** Typed publish/subscribe channel. TEvents maps each event name to its payload type. */
export interface IEventBus<TEvents extends object> {
  /** Subscribe to an event. Returns a function that removes the subscription. */
  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): Unsubscribe;

  /** Queue an event. Handlers run later, when flush() is called. */
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void;

  /** Deliver all queued events in order. Called once per frame by the main loop. */
  flush(): void;
}
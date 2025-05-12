/**
 * A simple event emitter for the game engine
 * Allows systems to communicate via events
 */
export class EventEmitter {
  private events: Map<string, Function[]> = new Map();
  
  /**
   * Register an event listener
   * @param event The event name to listen for
   * @param callback The function to call when the event is emitted
   */
  public on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
  }
  
  /**
   * Remove an event listener
   * @param event The event name
   * @param callback The callback function to remove
   */
  public off(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      return;
    }
    
    const callbacks = this.events.get(event)!;
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
      
      if (callbacks.length === 0) {
        this.events.delete(event);
      }
    }
  }
  
  /**
   * Emit an event with optional data
   * @param event The event name to emit
   * @param data Optional data to pass to the event listeners
   */
  public emit(event: string, ...data: any[]): void {
    if (!this.events.has(event)) {
      return;
    }
    
    const callbacks = this.events.get(event)!;
    
    for (const callback of callbacks) {
      callback(...data);
    }
  }
  
  /**
   * Register a one-time event listener
   * @param event The event name to listen for
   * @param callback The function to call when the event is emitted
   */
  public once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    
    this.on(event, onceCallback);
  }
  
  /**
   * Remove all listeners for an event, or all events
   * @param event Optional event name. If not provided, all events will be cleared.
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  /**
   * Get the number of listeners for an event
   * @param event The event name
   */
  public listenerCount(event: string): number {
    if (!this.events.has(event)) {
      return 0;
    }
    
    return this.events.get(event)!.length;
  }
}

// Create a global event emitter instance
export const globalEvents = new EventEmitter();

export default EventEmitter;

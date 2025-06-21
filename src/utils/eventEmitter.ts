type EventCallback = (data?: any) => void;
type EventListeners = Record<string, EventCallback[]>;

class EventEmitter {
    private listeners: EventListeners = {};

    on(event: string, callback: EventCallback): () => void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback); // Return an unsubscribe function
    }

    off(event: string, callback: EventCallback): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(
            (listener) => listener !== callback
        );
    }

    emit(event: string, data?: any): void {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => callback(data));
    }
}
export const appEmitter = new EventEmitter();

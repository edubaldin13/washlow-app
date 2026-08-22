export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastSubscriber = (toasts: Toast[]) => void;

class ToastServiceClass {
  private toasts: Toast[] = [];
  private subscribers: ToastSubscriber[] = [];

  subscribe(subscriber: ToastSubscriber): () => void {
    this.subscribers.push(subscriber);
    subscriber([...this.toasts]);

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    };
  }

  private notify(): void {
    const snapshot = [...this.toasts];
    this.subscribers.forEach((subscriber) => subscriber(snapshot));
  }

  show(message: string, type: ToastType = 'info', duration = 4000): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, message, type, duration };

    this.toasts = [...this.toasts, toast];
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  success(message: string, duration?: number): string {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): string {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): string {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): string {
    return this.show(message, 'info', duration);
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  dismissAll(): void {
    this.toasts = [];
    this.notify();
  }
}

export const ToastService = new ToastServiceClass();

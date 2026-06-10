import { AsyncLocalStorage } from 'async_hooks';

/**
 * LoggerStorage - Utiliza AsyncLocalStorage para persistir el Correlation ID
 * a lo largo del ciclo de vida de la petición.
 */
export class LoggerStorage {
  private static storage = new AsyncLocalStorage<Map<string, any>>();

  static getStore() {
    return this.storage.getStore();
  }

  static run(store: Map<string, any>, callback: () => any) {
    return this.storage.run(store, callback);
  }
}
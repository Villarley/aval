import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';

function createInMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      const keys = [...store.keys()];
      return keys[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

function installStorage(name: 'localStorage' | 'sessionStorage', storage: Storage) {
  const target = globalThis as typeof globalThis & Window;

  Object.defineProperty(target, name, {
    value: storage,
    configurable: true,
    writable: true,
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      value: storage,
      configurable: true,
      writable: true,
    });
  }
}

const localStorage = createInMemoryStorage();
const sessionStorage = createInMemoryStorage();

installStorage('localStorage', localStorage);
installStorage('sessionStorage', sessionStorage);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

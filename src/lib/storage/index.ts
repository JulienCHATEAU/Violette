export interface StorageAdapter {
  save(buffer: Buffer, mimeType: string): Promise<{ url: string }>;
}

import { localStorageAdapter } from "./local";

export const storage: StorageAdapter = localStorageAdapter;

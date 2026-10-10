import { Complaint, AuditEntry } from '../types';

const DB_NAME = 'LokSuno_Metro_Ops_DB';
const DB_VERSION = 1;
const STORE_NAME = 'complaints';

class LokSunoStorage {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isFallback = false;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        this.isFallback = true;
        return reject(new Error('IndexedDB not supported, falling back to localStorage'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('urgencyScore', 'urgencyScore', { unique: false });
          store.createIndex('department', 'department', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('station', 'station', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[LokSuno] IndexedDB open error, using localStorage fallback', request.error);
        this.isFallback = true;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Fallback storage helpers
  private getFallbackComplaints(): Complaint[] {
    try {
      const data = localStorage.getItem('loksuno_fallback_complaints');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveFallbackComplaints(list: Complaint[]): void {
    try {
      localStorage.setItem('loksuno_fallback_complaints', JSON.stringify(list));
    } catch (err) {
      console.error('[LokSuno] localStorage quota exceeded', err);
    }
  }

  public async getAllComplaints(): Promise<Complaint[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = (req.result as Complaint[]) || [];
          // Sort by urgencyScore DESC, then createdAt DESC
          list.sort((a, b) => {
            if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      const list = this.getFallbackComplaints();
      list.sort((a, b) => {
        if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return list;
    }
  }

  public async getComplaintById(id: string): Promise<Complaint | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => resolve((req.result as Complaint) || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallbackComplaints();
      return list.find(c => c.id === id) || null;
    }
  }

  public async saveComplaint(complaint: Complaint): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(complaint);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallbackComplaints();
      const idx = list.findIndex(c => c.id === complaint.id);
      if (idx >= 0) list[idx] = complaint;
      else list.unshift(complaint);
      this.saveFallbackComplaints(list);
    }
  }

  public async saveComplaintsBatch(complaints: Complaint[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        for (const item of complaints) {
          store.put(item);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = this.getFallbackComplaints();
      const map = new Map<string, Complaint>();
      for (const item of list) map.set(item.id, item);
      for (const item of complaints) map.set(item.id, item);
      this.saveFallbackComplaints(Array.from(map.values()));
    }
  }

  public async updateComplaint(
    id: string,
    updates: Partial<Complaint>,
    auditNote?: string,
    operator = 'Station Controller'
  ): Promise<Complaint> {
    const existing = await this.getComplaintById(id);
    if (!existing) throw new Error(`Complaint with id ${id} not found`);

    const now = new Date().toISOString();
    const updatedAudit: AuditEntry[] = [...(existing.auditTrail || [])];

    if (auditNote) {
      updatedAudit.push({
        timestamp: now,
        action: 'UPDATE',
        details: auditNote,
        operator
      });
    }

    const updated: Complaint = {
      ...existing,
      ...updates,
      auditTrail: updatedAudit,
      updatedAt: now,
      // If we made changes offline, ensure syncStatus reflects pending
      syncStatus: updates.syncStatus || 'pending_sync'
    };

    await this.saveComplaint(updated);
    return updated;
  }

  public async deleteComplaint(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = this.getFallbackComplaints().filter(c => c.id !== id);
      this.saveFallbackComplaints(list);
    }
  }

  public async clearAllComplaints(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      localStorage.removeItem('loksuno_fallback_complaints');
    }
  }

  public async exportBackupJSON(): Promise<string> {
    const all = await this.getAllComplaints();
    const payload = {
      application: 'JanAwaaz (जनआवाज़) Metro Operations Control Desk',
      exportDate: new Date().toISOString(),
      recordCount: all.length,
      complaints: all
    };
    return JSON.stringify(payload, null, 2);
  }

  public async importBackupJSON(jsonStr: string): Promise<number> {
    const parsed = JSON.parse(jsonStr);
    const complaints: Complaint[] = Array.isArray(parsed) 
      ? parsed 
      : (parsed.complaints && Array.isArray(parsed.complaints) ? parsed.complaints : []);

    if (!complaints.length) throw new Error('No valid complaint records found in backup payload');

    await this.saveComplaintsBatch(complaints);
    return complaints.length;
  }
}

export const lokSunoStorage = new LokSunoStorage();

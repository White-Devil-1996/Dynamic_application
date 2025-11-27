import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UdfFlatRecord = { key?: string; fields?: any[]; id?: string };

/**
 * Lightweight shared service to hold the record to edit.
 * Also keeps a small in-memory map keyed by `id` so components can reliably fetch
 * a record by id as a fallback for navigation-state timing issues.
 */
@Injectable({ providedIn: 'root' })
export class EditRecordService {
  private _record = new BehaviorSubject<UdfFlatRecord | null>(null);
  private byId = new Map<string, UdfFlatRecord>();

  set(record: UdfFlatRecord | null) {
    this._record.next(record);
    try {
      const id = record?.id ?? (record as any)?.key;
      if (id) this.byId.set(String(id), record as UdfFlatRecord);
    } catch (err) { /* ignore */ }
  }

  get(): UdfFlatRecord | null { return this._record.getValue(); }
  watch() { return this._record.asObservable(); }

  setById(id: string, record: UdfFlatRecord) {
    if (!id) return;
    this.byId.set(String(id), record);
  }

  getById(id: string): UdfFlatRecord | null {
    if (!id) return null;
    return this.byId.get(String(id)) ?? null;
  }

  // Optional: clear stored id entry
  clearById(id: string) { if (!id) return; this.byId.delete(String(id)); }
}

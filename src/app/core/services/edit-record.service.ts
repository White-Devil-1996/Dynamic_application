import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UdfFlatRecord = { key?: string; fields?: any[]; id?: string };

/** lightweight shared service to hold the record to edit */
@Injectable({ providedIn: 'root' })
export class EditRecordService {
  private _record = new BehaviorSubject<UdfFlatRecord | null>(null);

  set(record: UdfFlatRecord | null) { this._record.next(record); }
  get(): UdfFlatRecord | null { return this._record.getValue(); }
  watch() { return this._record.asObservable(); }
}

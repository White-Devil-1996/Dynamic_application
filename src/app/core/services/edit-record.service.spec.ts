import { TestBed } from '@angular/core/testing';

import { EditRecordService } from './edit-record.service';

describe('EditRecordService', () => {
  let service: EditRecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditRecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

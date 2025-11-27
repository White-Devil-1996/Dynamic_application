import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EditRecordService } from '../core/services/edit-record.service';

export type UdfFieldInput = {
  key: string;
  value: any;
  label?: string;
  mandatory?: string | boolean;
  currency?: string;
};

export type CustomerRecordInput = {
  id?: string;
  fields: UdfFieldInput[];
};

export type ColumnDef = {
  key: string;
  label: string;
  mandatory: boolean;
  currency?: string;
};

@Component({
  selector: 'app-dynamic-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './dynamic-grid.html',
  styleUrls: ['./dynamic-grid.css'],
})
export class DynamicGrid implements OnInit {
  @Input() data: CustomerRecordInput[] | null = null;

  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  itemsPerPage = 8;
  pPage = 1;

  records: CustomerRecordInput[] = [];
  columns: ColumnDef[] = [];

  constructor(private cdr: ChangeDetectorRef, private router: Router, private editSvc: EditRecordService) { }

  ngOnInit(): void {
    const sample: CustomerRecordInput[] = [
      {
        id: 'c1',
        fields: [
          { key: 'udf1', value: 'Navin', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '2025-11-13', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9765555577', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'navin@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf6', value: 'Ramesh Kumar', label: "Father's / Guardian’s Name", mandatory: 'no' },
          { key: 'udf7', value: '12 MG Street', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Chennai', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Tamil Nadu', label: 'State', mandatory: 'yes' },
          { key: 'udf10', value: '600001', label: 'Pincode', mandatory: 'yes' },
          { key: 'udf11', value: 'Aadhaar Card', label: 'ID Type', mandatory: 'yes' },
          { key: 'udf12', value: '123456789000', label: 'ID Number', mandatory: 'yes' },
          { key: 'udf13', value: 'C:\\fakepath\\id1.jpg', label: 'Upload ID Proof', mandatory: 'yes' },
          { key: 'udf14', value: 'C:\\fakepath\\photo1.jpg', label: 'Passport Photo', mandatory: 'no' },
          { key: 'udf15', value: '2025-11-14', label: 'Check-in Date', mandatory: 'yes' },
          { key: 'udf16', value: 'Single', label: 'Room Sharing Type', mandatory: 'yes' },
          { key: 'udf17', value: '101', label: 'Room Numbers', mandatory: 'yes' },
          { key: 'udf18', value: '1', label: 'Bed Numbers', mandatory: 'no' },
          { key: 'udf19', value: 10000, label: 'Advance Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf20', value: 8000, label: 'Rent Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf21', value: 'Suresh', label: 'Emergency Contact Name', mandatory: 'yes' },
          { key: 'udf22', value: 'Brother', label: 'Relationship', mandatory: 'yes' },
          { key: 'udf23', value: '9876543210', label: 'Contact Number', mandatory: 'yes' },
          { key: 'udf24', value: true, label: 'Show Filled Details', mandatory: 'yes' },
          { key: 'udf25', value: true, label: 'Accept T&C', mandatory: 'yes' }
        ]
      },
      {
        id: 'c2',
        fields: [
          { key: 'udf1', value: 'Arjun Kumar', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '1998-05-10', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9876543210', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'arjun.k@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf6', value: 'Sudarshan', label: "Father's Name", mandatory: 'no' },
          { key: 'udf7', value: 'BTM Layout', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Bengaluru', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Karnataka', label: 'State', mandatory: 'yes' },
          { key: 'udf10', value: '560076', label: 'Pincode', mandatory: 'yes' },
          { key: 'udf11', value: 'PAN Card', label: 'ID Type', mandatory: 'yes' },
          { key: 'udf12', value: 'ABCDE1234F', label: 'ID Number', mandatory: 'yes' },
          { key: 'udf13', value: 'C:\\fakepath\\id2.pdf', label: 'Upload ID Proof', mandatory: 'yes' },
          { key: 'udf14', value: 'C:\\fakepath\\photo2.jpg', label: 'Passport Photo', mandatory: 'no' },
          { key: 'udf15', value: '2025-10-01', label: 'Check-in Date', mandatory: 'yes' },
          { key: 'udf16', value: 'Double', label: 'Room Sharing Type', mandatory: 'yes' },
          { key: 'udf17', value: '202', label: 'Room Numbers', mandatory: 'yes' },
          { key: 'udf18', value: '2', label: 'Bed Numbers', mandatory: 'no' },
          { key: 'udf19', value: 15000, label: 'Advance Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf20', value: 10000, label: 'Rent Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf21', value: 'Karthik', label: 'Emergency Contact Name', mandatory: 'yes' },
          { key: 'udf22', value: 'Friend', label: 'Relationship', mandatory: 'yes' },
          { key: 'udf23', value: '9123456780', label: 'Contact Number', mandatory: 'yes' },
          { key: 'udf24', value: true, label: 'Show Filled Details', mandatory: 'yes' },
          { key: 'udf25', value: true, label: 'Accept T&C', mandatory: 'yes' }
        ]
      },
      {
        id: 'c3',
        fields: [
          { key: 'udf1', value: 'Sneha Rao', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '2001-02-20', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Female', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9988776655', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'sneha.rao@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf6', value: 'Raghav Rao', label: "Father's Name", mandatory: 'no' },
          { key: 'udf7', value: 'Pune Road', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Pune', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Maharashtra', label: 'State', mandatory: 'yes' },
          { key: 'udf10', value: '411001', label: 'Pincode', mandatory: 'yes' },
          { key: 'udf11', value: 'Driving License', label: 'ID Type', mandatory: 'yes' },
          { key: 'udf12', value: 'DL-98231-112', label: 'ID Number', mandatory: 'yes' },
          { key: 'udf13', value: 'C:\\fakepath\\id3.jpg', label: 'Upload ID Proof', mandatory: 'yes' },
          { key: 'udf14', value: 'C:\\fakepath\\photo3.jpg', label: 'Passport Photo', mandatory: 'no' },
          { key: 'udf15', value: '2025-09-12', label: 'Check-in Date', mandatory: 'yes' },
          { key: 'udf16', value: 'Triple', label: 'Room Sharing Type', mandatory: 'yes' },
          { key: 'udf17', value: '305', label: 'Room Numbers', mandatory: 'yes' },
          { key: 'udf18', value: '3', label: 'Bed Numbers', mandatory: 'no' },
          { key: 'udf19', value: 9000, label: 'Advance Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf20', value: 7500, label: 'Rent Paid So Far', currency: 'INR', mandatory: 'no' },
          { key: 'udf21', value: 'Megha', label: 'Emergency Contact Name', mandatory: 'yes' },
          { key: 'udf22', value: 'Sister', label: 'Relationship', mandatory: 'yes' },
          { key: 'udf23', value: '9876501234', label: 'Contact Number', mandatory: 'yes' },
          { key: 'udf24', value: true, label: 'Show Filled Details', mandatory: 'yes' },
          { key: 'udf25', value: true, label: 'Accept T&C', mandatory: 'yes' }
        ]
      },
      {
        id: 'c4',
        fields: [
          { key: 'udf1', value: 'Rahul Sharma', mandatory: 'yes', label: 'Full Name' },
          { key: 'udf2', value: '1995-01-12', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9911223344', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'rahul.sharma@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'Delhi Cantt', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'New Delhi', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Delhi', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c5',
        fields: [
          { key: 'udf1', value: 'Ria Mehta', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '2000-10-15', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Female', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9192929192', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'ria.mehta@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'Juhu Lane', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Mumbai', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Maharashtra', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c6',
        fields: [
          { key: 'udf1', value: 'Vishal Patil', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '1999-06-03', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9988442211', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'vishal.patil@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'Camp Area', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Pune', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Maharashtra', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c7',
        fields: [
          { key: 'udf1', value: 'Ananya Pillai', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '2002-03-22', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Female', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9080765544', label: 'Medical Number', mandatory: 'yes' },
          { key: 'udf5', value: 'ananya.pillai@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'MG Road', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Kochi', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Kerala', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c8',
        fields: [
          { key: 'udf1', value: 'Rohan Singh', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '1997-09-10', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9090908080', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'rohan.singh@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'Sector 22', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Chandigarh', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Punjab', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c9',
        fields: [
          { key: 'udf1', value: 'Tanvi Desai', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '2001-12-11', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Female', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9797976767', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'tanvi.desai@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'CG Road', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Ahmedabad', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Gujarat', label: 'State', mandatory: 'yes' }
        ],
      },
      {
        id: 'c10',
        fields: [
          { key: 'udf1', value: 'Karan Verma', label: 'Full Name', mandatory: 'yes' },
          { key: 'udf2', value: '1994-04-18', label: 'Date of Birth', mandatory: 'yes' },
          { key: 'udf3', value: 'Male', label: 'Gender', mandatory: 'yes' },
          { key: 'udf4', value: '9099665544', label: 'Mobile Number', mandatory: 'yes' },
          { key: 'udf5', value: 'karan.verma@example.com', label: 'Email ID', mandatory: 'yes' },
          { key: 'udf7', value: 'Civil Lines', label: 'Permanent Address', mandatory: 'yes' },
          { key: 'udf8', value: 'Jaipur', label: 'City', mandatory: 'yes' },
          { key: 'udf9', value: 'Rajasthan', label: 'State', mandatory: 'yes' }
        ],
      }
    ];

    const src = this.data && this.data.length ? this.data : sample;

    this.records = src.map((rec, i) => ({
      id: rec.id ?? `rec${i + 1}`,
      fields: rec.fields
    }));

    // Build union of all mandatory fields
    const allMandatory: ColumnDef[] = [];

    for (const rec of this.records) {
      for (const f of rec.fields) {
        const isMand =
          f.mandatory === true ||
          String(f.mandatory).toLowerCase() === 'yes';

        if (isMand && !allMandatory.some(x => x.key === f.key)) {
          allMandatory.push({
            key: f.key,
            label: f.label ?? f.key,
            mandatory: true,
            currency: f.currency
          });
        }
      }
    }

    // Use only first 6 mandatory fields in grid
    this.columns = allMandatory.slice(0, 6);

    this.cdr.detectChanges();
  }

  getValue(record: CustomerRecordInput, key: string): any {
    const f = record.fields.find(x => x.key === key);
    return f ? f.value : null;
  }

  get filteredRecords(): CustomerRecordInput[] {
    let arr = [...this.records];
    const q = (this.searchText || '').trim().toLowerCase();

    if (q) {
      arr = arr.filter(rec =>
        this.columns.some(col => {
          const v = this.getValue(rec, col.key);
          return (
            (col.label || '').toLowerCase().includes(q) ||
            String(v ?? '').toLowerCase().includes(q)
          );
        })
      );
    }

    if (this.sortColumn) {
      arr.sort((a, b) => {
        const A =
          this.sortColumn === 'id'
            ? a.id ?? ''
            : this.getValue(a, this.sortColumn) ?? '';
        const B =
          this.sortColumn === 'id'
            ? b.id ?? ''
            : this.getValue(b, this.sortColumn) ?? '';

        const vA = typeof A === 'number' ? A : String(A).toLowerCase();
        const vB = typeof B === 'number' ? B : String(B).toLowerCase();

        if (vA < vB) return this.sortDirection === 'asc' ? -1 : 1;
        if (vA > vB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }

  toggleSort(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  trackByRecord(_: number, item: CustomerRecordInput) {
    return item.id;
  }

  confirmDelete(id?: string) {
    if (!id) return;

    Swal.fire({
      title: 'Delete record?',
      text: 'This will remove the record locally.',
      icon: 'warning',
      showCancelButton: true,
    }).then(res => {
      if (res.isConfirmed) {
        this.records = this.records.filter(r => r.id !== id);
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          timer: 1000,
          showConfirmButton: false,
        });
      }
    });
  }

  goToEditForm(record: CustomerRecordInput) {
    // set record in shared service (so form can pick it up even on refresh fallback)
    this.editSvc.set(record);
    this.router.navigate(['/home/container/dynamic-form'], {
      state: { record }, // also pass via navigation state
      queryParams: { mode: 'edit', id: record.id }
    });
  }

  goToAddForm() {
    this.editSvc.set(null);
    this.router.navigate(['/home/container/dynamic-form'], {
      queryParams: { mode: 'add' },
    });
  }

  exportCSV() {
    const header = ['ID', ...this.columns.map(c => c.label)];
    const rows: string[] = [];

    rows.push(header.join(','));

    this.filteredRecords.forEach(rec => {
      const row = [
        rec.id ?? '',
        ...this.columns.map(col => {
          const v = this.getValue(rec, col.key);
          return `"${String(v ?? '').replace(/"/g, '""')}"`;
        }),
      ];
      rows.push(row.join(','));
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  showRangeText() {
    const total = this.filteredRecords.length;
    if (!total) return '0 to 0 of 0';

    const start = (this.pPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.pPage * this.itemsPerPage, total);
    return `${start} to ${end} of ${total}`;
  }

  isObject(v: any) {
    return v !== null && typeof v === 'object';
  }


  /** Open form in view (read-only) mode. Pass the full record in navigation state. */
  goToViewForm(record: CustomerRecordInput) {
    // store record in shared service so the dynamic form can pick it up
    console.debug('DynamicGrid: goToViewForm - setting editSvc and sessionStorage for id', record?.id);
    this.editSvc.set(record);
    // also store in service map keyed by id so form can fetch by id
    try { if (record?.id) this.editSvc.setById(String(record.id), record); } catch (err) { /* ignore */ }
    // also persist temporarily in sessionStorage as a fallback for navigation state loss
    try {
      if (record && record.id) {
        sessionStorage.setItem(`dynamic_record_${record.id}`, JSON.stringify(record));
        console.debug('DynamicGrid: saved to sessionStorage key', `dynamic_record_${record.id}`);
      }
    } catch (err) { console.debug('DynamicGrid: sessionStorage save error', err); }
    this.router.navigate(['/home/container/dynamic-form'], {
      state: { record },
      queryParams: { mode: 'view', id: record.id }
    });
  }

}

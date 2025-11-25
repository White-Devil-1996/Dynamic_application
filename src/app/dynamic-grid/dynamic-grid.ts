import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export type Product = {
  id: string;
  productName: string;
  productCode: string;
  hsnCode: string;
  salePrice: number;
  barcode?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-dynamic-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './dynamic-grid.html',
  styleUrls: ['./dynamic-grid.css'],
})
export class DynamicGrid implements OnInit {
  @Input() data: Product[] = [];

  // UI state
  searchText = '';
  sortColumn: keyof Product | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  itemsPerPage = 8;
  pPage = 1; // current page for ngx-pagination

  // internal products
  products: Product[] = [];

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    // mock JSON response; replace with HTTP fetch if required
    const jsonResponse: Product[] = [
      { id: 'p1', productName: 'Potato', productCode: '03', hsnCode: '02', salePrice: 50, barcode: '03', imageUrl: '/mnt/data/cef196f3-865c-4493-97de-9aaf85660420.png' },
      { id: 'p2', productName: 'Onion', productCode: '04', hsnCode: '03', salePrice: 40, barcode: '04' },
      { id: 'p3', productName: 'Tomato', productCode: '05', hsnCode: '04', salePrice: 30, barcode: '05' },
      { id: 'p4', productName: 'Carrot', productCode: '06', hsnCode: '05', salePrice: 45, barcode: '06' },
      { id: 'p5', productName: 'Beetroot', productCode: '07', hsnCode: '06', salePrice: 35, barcode: '07' },
      { id: 'p6', productName: 'Radish', productCode: '08', hsnCode: '07', salePrice: 25, barcode: '08' },
      { id: 'p7', productName: 'Brinjal', productCode: '09', hsnCode: '08', salePrice: 55, barcode: '09' },
      { id: 'p8', productName: 'Cabbage', productCode: '10', hsnCode: '09', salePrice: 60, barcode: '10' },
      { id: 'p9', productName: 'Spinach', productCode: '11', hsnCode: '10', salePrice: 20, barcode: '11' },
      { id: 'p10', productName: 'Capsicum', productCode: '12', hsnCode: '11', salePrice: 70, barcode: '12' }
    ];

    this.products = jsonResponse.map((p, i) => ({ ...p, id: p.id ?? `p${i + 1}` }));

    // If parent passed @Input() data, prefer it
    if (this.data && this.data.length) {
      this.products = this.data.map((d, i) => ({ ...d, id: d.id ?? `p${i + 1}` }));
    }

    this.cdr.detectChanges();
  }

  /* ----------------- Utilities: search / sort / pagination ----------------- */

  get filteredProducts(): Product[] {
    let arr = [...this.products];

    // global search across key fields
    const q = (this.searchText || '').trim().toLowerCase();
    if (q) {
      arr = arr.filter(p =>
        (p.productName || '').toLowerCase().includes(q) ||
        (p.productCode || '').toLowerCase().includes(q) ||
        (p.hsnCode || '').toLowerCase().includes(q) ||
        String(p.salePrice).includes(q)
      );
    }

    // sorting
    if (this.sortColumn) {
      const col = this.sortColumn;
      arr.sort((a, b) => {
        const A = (a[col] ?? '') as any;
        const B = (b[col] ?? '') as any;
        if (typeof A === 'number' && typeof B === 'number') {
          return this.sortDirection === 'asc' ? A - B : B - A;
        }
        const sA = String(A).toLowerCase();
        const sB = String(B).toLowerCase();
        if (sA < sB) return this.sortDirection === 'asc' ? -1 : 1;
        if (sA > sB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return arr;
  }

  toggleSort(column: keyof Product) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  trackById(_: number, item: Product) {
    return item.id;
  }

  /* ----------------- Actions ----------------- */

  // route to the form to add a record
  goToAddForm() {
    this.router.navigate(['/home/container/dynamic-form'], { queryParams: { mode: 'add' } });
  }

  // optional: route to the form to edit a product (pass id)
  goToEditForm(product: Product) {
    this.router.navigate(['/home/container/dynamic-form'], { queryParams: { mode: 'edit', id: product.id } });
  }

  editProduct(product: Product) {
    // fallback quick-edit (keeps existing prompt-based edit)
    const name = prompt('Product name:', product.productName);
    if (name === null) return;
    const code = prompt('Product code:', product.productCode) ?? product.productCode;
    const hsn = prompt('HSN code:', product.hsnCode) ?? product.hsnCode;
    const priceStr = prompt('Sale price:', String(product.salePrice)) ?? String(product.salePrice);
    const price = parseFloat(priceStr) || product.salePrice;

    product.productName = name;
    product.productCode = code;
    product.hsnCode = hsn;
    product.salePrice = price;
    product.barcode = code;
    this.cdr.detectChanges();
    Swal.fire({ icon: 'success', title: 'Updated', text: `${product.productName} updated.` });
  }

  confirmDelete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        this.products = this.products.filter(p => p.id !== id);
        this.cdr.detectChanges();
        Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
      }
    });
  }

  exportCSV() {
    const rows = [['S.No', 'Product Name', 'Product Code', 'HSN Code', 'Sale Price']];
    this.products.forEach((p, i) => rows.push([String(i + 1), p.productName, p.productCode, p.hsnCode, String(p.salePrice)]));
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  printBarcode(product: Product) {
    const content = `
      <html><head><title>Barcode - ${product.productName}</title>
      <style>body{font-family:Arial;padding:20px;text-align:center}.barcode{font-size:34px;letter-spacing:6px;margin-top:24px;font-family:monospace}.meta{margin-top:12px;color:#444}</style>
      </head>
      <body>
        <h2>${product.productName}</h2>
        <div class="barcode">${(product.barcode || product.productCode || '---')}</div>
        <div class="meta">Code: ${product.productCode} &nbsp;&nbsp; Price: ₹${product.salePrice}</div>
        <script>window.onload=()=>window.print();</script>
      </body></html>`;
    const w = window.open('', '_blank', 'width=500,height=400');
    if (!w) { alert('Popup blocked - allow popups for this site to print barcode'); return; }
    w.document.open();
    w.document.write(content);
    w.document.close();
  }

  printAll() {
    const tableHtml = this.products.map((p, i) => `<tr><td>${i + 1}</td><td>${p.productName}</td><td>${p.productCode}</td><td>${p.hsnCode}</td><td>₹${p.salePrice}</td></tr>`).join('');
    const content = `<html><head><title>Products</title><style>table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}</style></head><body><h3>Products</h3><table><thead><tr><th>S.No</th><th>Product Name</th><th>Product Code</th><th>HSN</th><th>Sale Price</th></tr></thead><tbody>${tableHtml}</tbody></table><script>window.onload=()=>setTimeout(()=>window.print(),100);</script></body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { alert('Popup blocked - allow popups to print'); return; }
    w.document.open();
    w.document.write(content);
    w.document.close();
  }

  openFilters() {
    Swal.fire({ title: 'Filters', text: 'Add advanced filter UI here (not implemented).', icon: 'info' });
  }

  showRangeText() {
    const total = this.filteredProducts.length;
    if (total === 0) return '0 to 0 of 0';
    const start = (this.pPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.pPage * this.itemsPerPage, total);
    return `${start} to ${end} of ${total}`;
  }
}

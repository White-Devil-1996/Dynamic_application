import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

// types
type UdfField = { key: string; value: any; label?: string; mandatory?: string; currency?: string; };
type CustomerRecordInput = { id: string; fields: UdfField[] };
type ChartData = { title: string; data: any; options?: any; type: any };


// --- SAMPLE_DATA (unchanged from your input) ---
const SAMPLE_DATA: CustomerRecordInput[] = [
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
// --- end SAMPLE_DATA ---

@Component({
  selector: 'app-dashboard',
  imports: [NgChartsModule,CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  sample: CustomerRecordInput[] = [];

  // KPI cards
  public kpis: Array<{ title: string; value: string; subtitle?: string }> = [];

  // raw KPI numeric values available if needed
  public totalTenants = 0;
  public totalAdvance = 0;
  public totalRent = 0;
  public avgAge = 0;
  public acceptRate = 0; // percent
  public missingMobileCount = 0;
  public avgMandatoryPerRecord = 0;

  // chart support
  public barChartType: any = 'bar';
  public lineChartType: any = 'line';
  public pieChartType: any = 'pie';
  public doughnutChartType: any = 'doughnut';
  public polarChartType: any = 'polarArea';
  public radarChartType: any = 'radar';
  public horizontalBarType: any = 'bar';

  // Color palette - diverse colors
  private colorPalette = [
    { bg: '#2725BB', border: '#1A1A7F', light: 'rgba(39, 37, 187, 0.1)' },      // Primary Purple
    { bg: '#1ABC9C', border: '#0E8B7C', light: 'rgba(26, 188, 156, 0.1)' },     // Turquoise
    { bg: '#E74C3C', border: '#B73E2D', light: 'rgba(231, 76, 60, 0.1)' },      // Red
    { bg: '#F39C12', border: '#C87F0A', light: 'rgba(243, 156, 18, 0.1)' },     // Orange
    { bg: '#9B59B6', border: '#6C3A6F', light: 'rgba(155, 89, 182, 0.1)' },     // Purple
    { bg: '#3498DB', border: '#2874A6', light: 'rgba(52, 152, 219, 0.1)' },     // Blue
    { bg: '#1E8449', border: '#145A32', light: 'rgba(30, 132, 73, 0.1)' },      // Green
    { bg: '#D35400', border: '#A04000', light: 'rgba(211, 84, 0, 0.1)' },       // Dark Orange
    { bg: '#8E44AD', border: '#6C2E7F', light: 'rgba(142, 68, 173, 0.1)' },     // Dark Purple
    { bg: '#16A085', border: '#0D5D4F', light: 'rgba(22, 160, 133, 0.1)' }      // Dark Turquoise
  ];

  public chartData: Array<{ title: string, data: any, options?: any, type: any }> = [];

  constructor() {}

  ngOnInit(): void {
    this.sample = SAMPLE_DATA;

    // helper to retrieve field
    const getField = (rec: CustomerRecordInput, key?: string, label?: string) =>
      key ? rec.fields.find(f => f.key === key)?.value : rec.fields.find(f => f.label === label)?.value;

    // accumulators
    const cityCounts = new Map<string, number>();
    const genderCounts = new Map<string, number>();
    const sharingCounts = new Map<string, number>();
    const checkinMonthCounts = new Map<number, number>();
    const cityAdvanceTotals = new Map<string, number>();
    const cityRentTotals = new Map<string, number>();
    const idTypeCounts = new Map<string, number>();
    const pincodeCounts = new Map<string, number>();
    const stateCounts = new Map<string, number>();
    const roomNumberCounts = new Map<string, number>();
    const mandatoryPerRecord: number[] = [];
    const acceptanceCounts = new Map<string, number>();
    const showDetailsCounts = new Map<string, number>();
    const mobilePresentCount = { present: 0, missing: 0 };
    const ages: number[] = [];

    const today = new Date();

    // iterate
    this.sample.forEach((rec) => {
      const city = getField(rec, 'udf8') ?? getField(rec, undefined, 'City') ?? 'Unknown';
      const gender = getField(rec, 'udf3') ?? 'Unknown';
      const roomShare = getField(rec, 'udf16') ?? 'Unknown';
      const checkin = getField(rec, 'udf15') ?? getField(rec, undefined, 'Check-in Date');
      const advance = Number(getField(rec, 'udf19') ?? 0) || 0;
      const rent = Number(getField(rec, 'udf20') ?? 0) || 0;
      const idType = getField(rec, 'udf11') ?? getField(rec, undefined, 'ID Type') ?? 'Unknown';
      const pincode = String(getField(rec, 'udf10') ?? '');
      const state = getField(rec, 'udf9') ?? 'Unknown';
      const roomNum = String(getField(rec, 'udf17') ?? 'Unknown');

      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
      genderCounts.set(gender, (genderCounts.get(gender) || 0) + 1);
      sharingCounts.set(roomShare, (sharingCounts.get(roomShare) || 0) + 1);

      if (checkin) {
        const d = new Date(checkin);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth() + 1;
          checkinMonthCounts.set(m, (checkinMonthCounts.get(m) || 0) + 1);
        }
      }

      cityAdvanceTotals.set(city, (cityAdvanceTotals.get(city) || 0) + advance);
      cityRentTotals.set(city, (cityRentTotals.get(city) || 0) + rent);

      idTypeCounts.set(idType, (idTypeCounts.get(idType) || 0) + 1);
      if (pincode) pincodeCounts.set(pincode, (pincodeCounts.get(pincode) || 0) + 1);
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
      roomNumberCounts.set(roomNum, (roomNumberCounts.get(roomNum) || 0) + 1);

      // mandatory fields count for this record
      let mandCountForThis = 0;
      rec.fields.forEach(f => {
        if ((f.mandatory ?? '').toString().toLowerCase() === 'yes') mandCountForThis++;
      });
      mandatoryPerRecord.push(mandCountForThis);

      // accept / show details
      const accept = getField(rec, 'udf25') ?? false;
      acceptanceCounts.set(String(Boolean(accept)), (acceptanceCounts.get(String(Boolean(accept))) || 0) + 1);

      const show = getField(rec, 'udf24') ?? false;
      showDetailsCounts.set(String(Boolean(show)), (showDetailsCounts.get(String(Boolean(show))) || 0) + 1);

      // mobile presence
      const mobile = getField(rec, 'udf4');
      if (mobile) mobilePresentCount.present++; else mobilePresentCount.missing++;

      // ages
      const dobRaw = getField(rec, 'udf2');
      if (dobRaw) {
        const d = new Date(dobRaw);
        if (!isNaN(d.getTime())) {
          let age = today.getFullYear() - d.getFullYear();
          const m = today.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
          ages.push(age);
        }
      }
    });

    // KPIs
    this.totalTenants = this.sample.length;
    this.totalAdvance = this.sample.reduce((s, r) => s + (Number(getField(r, 'udf19')) || 0), 0);
    this.totalRent = this.sample.reduce((s, r) => s + (Number(getField(r, 'udf20')) || 0), 0);
    this.avgAge = ages.length ? Math.round(ages.reduce((a,b) => a+b,0) / ages.length) : 0;
    const acceptTrue = Number(acceptanceCounts.get('true') || 0);
    this.acceptRate = this.totalTenants ? Math.round((acceptTrue / this.totalTenants) * 100) : 0;
    this.missingMobileCount = mobilePresentCount.missing;
    this.avgMandatoryPerRecord = mandatoryPerRecord.length ? Math.round(mandatoryPerRecord.reduce((a,b)=>a+b,0) / mandatoryPerRecord.length) : 0;

    const nf = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

    this.kpis = [
      { title: 'Total Tenants', value: String(this.totalTenants) },
      { title: 'Total Advance Collected', value: nf.format(this.totalAdvance) },
      { title: 'Total Rent Collected', value: nf.format(this.totalRent) },
      { title: 'Average Age', value: `${this.avgAge} yrs` },
      { title: 'Accept T&C', value: `${this.acceptRate}%` },
      { title: 'Missing Mobile Numbers', value: String(this.missingMobileCount) },
      // optional extra KPI
      { title: 'Avg Mandatory Fields / Record', value: String(this.avgMandatoryPerRecord) }
    ];

    // --- prepare the same 15 charts as before ---
    const topEntries = (map: Map<any, number>, top = 10) => Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, top);

    // Chart 1: Tenants per City (Bar)
    const cityTop = topEntries(cityCounts, 10);
    this.chartData.push({
      title: 'Tenants per City',
      type: this.barChartType,
      data: { 
        labels: cityTop.map(e => e[0]), 
        datasets: [this.generateMultiColorDataset(cityTop.map(e => e[0]), cityTop.map(e => e[1]), 0)] 
      },
      options: { responsive: true, indexAxis: undefined }
    });

    // Chart 2: Total Payment per Customer (Line)
    const lineLabels = this.sample.map(s => s.id);
    const lineValues = this.sample.map(rec => (Number(getField(rec, 'udf19') ?? 0) || 0) + (Number(getField(rec, 'udf20') ?? 0) || 0));
    const lineColor = this.getColor(1);
    this.chartData.push({
      title: 'Total Payment per Customer',
      type: this.lineChartType,
      data: { 
        labels: lineLabels, 
        datasets: [{ 
          label: 'Advance+Rent', 
          data: lineValues, 
          fill: false,
          borderColor: lineColor.bg,
          backgroundColor: lineColor.light,
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: lineColor.bg,
          pointRadius: 4
        }] 
      },
      options: { responsive: true }
    });

    // Chart 3: Gender Distribution (Pie)
    const genderEntries = Array.from(genderCounts.entries());
    this.chartData.push({
      title: 'Gender Distribution',
      type: this.pieChartType,
      data: { 
        labels: genderEntries.map(e => e[0]), 
        datasets: [{ 
          data: genderEntries.map(e => e[1]),
          backgroundColor: this.colorPalette.map(c => c.bg).slice(0, genderEntries.length),
          borderColor: this.colorPalette.map(c => c.border).slice(0, genderEntries.length),
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 4: Room Sharing Types (Doughnut)
    const sharingEntries = Array.from(sharingCounts.entries());
    this.chartData.push({
      title: 'Room Sharing Types',
      type: this.doughnutChartType,
      data: { 
        labels: sharingEntries.map(e => e[0]), 
        datasets: [{ 
          data: sharingEntries.map(e => e[1]),
          backgroundColor: this.colorPalette.map(c => c.bg).slice(0, sharingEntries.length),
          borderColor: this.colorPalette.map(c => c.border).slice(0, sharingEntries.length),
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 5: Check-in Months (Polar Area)
    const months = Array.from(checkinMonthCounts.entries()).sort((a, b) => a[0] - b[0]);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.chartData.push({
      title: 'Check-in Months',
      type: this.polarChartType,
      data: { 
        labels: months.map(m => monthNames[m[0]-1] ?? `M${m[0]}`), 
        datasets: [{ 
          data: months.map(m => m[1]),
          backgroundColor: this.colorPalette.map(c => c.light).slice(0, months.length),
          borderColor: this.colorPalette.map(c => c.bg).slice(0, months.length),
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 6: Avg Advance vs Avg Rent per City (Radar)
    const topCityList = cityTop.map(([c]) => c);
    const avgAdvance = topCityList.map(c => {
      const total = cityAdvanceTotals.get(c) || 0;
      const count = cityCounts.get(c) || 1;
      return Math.round(total / count);
    });
    const avgRent = topCityList.map(c => {
      const total = cityRentTotals.get(c) || 0;
      const count = cityCounts.get(c) || 1;
      return Math.round(total / count);
    });
    const advanceColor = this.getColor(5);
    const rentColor = this.getColor(6);
    this.chartData.push({
      title: 'Avg Advance vs Avg Rent per City',
      type: this.radarChartType,
      data: { 
        labels: topCityList, 
        datasets: [
          { 
            label: 'Avg Advance', 
            data: avgAdvance,
            borderColor: advanceColor.bg,
            backgroundColor: advanceColor.light,
            borderWidth: 2,
            pointBackgroundColor: advanceColor.bg
          }, 
          { 
            label: 'Avg Rent', 
            data: avgRent,
            borderColor: rentColor.bg,
            backgroundColor: rentColor.light,
            borderWidth: 2,
            pointBackgroundColor: rentColor.bg
          }
        ] 
      },
      options: { responsive: true }
    });

    // Chart 7: Mandatory Fields Count per Record (Bar)
    this.chartData.push({
      title: 'Mandatory Fields Count per Record',
      type: this.barChartType,
      data: { 
        labels: this.sample.map(s => s.id), 
        datasets: [{ 
          label: 'Mandatory Fields', 
          data: mandatoryPerRecord,
          backgroundColor: this.getColor(7).bg,
          borderColor: this.getColor(7).border,
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 8: ID Type Distribution (Horizontal Bar)
    const idTop = topEntries(idTypeCounts, 10);
    this.chartData.push({
      title: 'ID Type Distribution',
      type: this.horizontalBarType,
      data: { 
        labels: idTop.map(e => e[0]), 
        datasets: [this.generateMultiColorDataset(idTop.map(e => e[0]), idTop.map(e => e[1]), 0)] 
      },
      options: { responsive: true, indexAxis: 'y' }
    });

    // Chart 9: Pincode Top (Bar)
    const pincodeTop = topEntries(pincodeCounts, 10);
    this.chartData.push({
      title: 'Top Pincodes',
      type: this.barChartType,
      data: { 
        labels: pincodeTop.map(e => e[0]), 
        datasets: [this.generateMultiColorDataset(pincodeTop.map(e => e[0]), pincodeTop.map(e => e[1]), 1)] 
      },
      options: { responsive: true }
    });

    // Chart 10: Age Distribution (Line over bins)
    const ageBins = [0, 18, 25, 30, 40, 50, 100];
    const ageLabels = ['<18','18-24','25-29','30-39','40-49','50+'];
    const ageCounts = ageBins.slice(0, -1).map((_, i) => 0);
    ages.forEach(a => {
      for (let i = 0; i < ageBins.length - 1; i++) {
        if (a >= ageBins[i] && a < ageBins[i+1]) { ageCounts[i]++; break; }
      }
    });
    const ageColor = this.getColor(8);
    this.chartData.push({
      title: 'Age Distribution',
      type: this.lineChartType,
      data: { 
        labels: ageLabels, 
        datasets: [{ 
          label: 'Count', 
          data: ageCounts, 
          fill: true,
          borderColor: ageColor.bg,
          backgroundColor: ageColor.light,
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: ageColor.bg,
          pointRadius: 5
        }] 
      },
      options: { responsive: true }
    });

    // Chart 11: Mobile Presence (Pie)
    this.chartData.push({
      title: 'Mobile Number Presence',
      type: this.pieChartType,
      data: { 
        labels: ['Present','Missing'], 
        datasets: [{ 
          data: [mobilePresentCount.present, mobilePresentCount.missing],
          backgroundColor: [this.colorPalette[0].bg, this.colorPalette[2].bg],
          borderColor: [this.colorPalette[0].border, this.colorPalette[2].border],
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 12: Accept T&C (Doughnut)
    const acceptLabels = Array.from(acceptanceCounts.keys());
    this.chartData.push({
      title: 'Accept T&C',
      type: this.doughnutChartType,
      data: { 
        labels: acceptLabels, 
        datasets: [{ 
          data: Array.from(acceptanceCounts.values()),
          backgroundColor: this.colorPalette.map(c => c.bg).slice(0, acceptLabels.length),
          borderColor: this.colorPalette.map(c => c.border).slice(0, acceptLabels.length),
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 13: Show Filled Details (Pie)
    const showLabels = Array.from(showDetailsCounts.keys());
    this.chartData.push({
      title: 'Show Filled Details',
      type: this.pieChartType,
      data: { 
        labels: showLabels, 
        datasets: [{ 
          data: Array.from(showDetailsCounts.values()),
          backgroundColor: this.colorPalette.map(c => c.bg).slice(0, showLabels.length),
          borderColor: this.colorPalette.map(c => c.border).slice(0, showLabels.length),
          borderWidth: 2
        }] 
      },
      options: { responsive: true }
    });

    // Chart 14: Tenants per State (Bar)
    const stateTop = topEntries(stateCounts, 10);
    this.chartData.push({
      title: 'Tenants per State',
      type: this.barChartType,
      data: { 
        labels: stateTop.map(e => e[0]), 
        datasets: [this.generateMultiColorDataset(stateTop.map(e => e[0]), stateTop.map(e => e[1]), 2)] 
      },
      options: { responsive: true }
    });

    // Chart 15: Room Number Occupancy (Horizontal Bar)
    const roomTop = topEntries(roomNumberCounts, 10);
    this.chartData.push({
      title: 'Room Number Occupancy',
      type: this.horizontalBarType,
      data: { 
        labels: roomTop.map(e => e[0]), 
        datasets: [this.generateMultiColorDataset(roomTop.map(e => e[0]), roomTop.map(e => e[1]), 3)] 
      },
      options: { responsive: true, indexAxis: 'y' }
    });
  } // ngOnInit

  trackByKPI(index: number, item: any) {
    return item.title;
  }

  trackByChart(index: number, item: ChartData) {
    return item.title;
  }

  private getColor(index: number) {
    return this.colorPalette[index % this.colorPalette.length];
  }

  private generateMultiColorDataset(labels: string[], data: number[], colorIndex: number) {
    const colors = this.colorPalette;
    return {
      label: 'Count',
      data: data,
      backgroundColor: labels.map((_, i) => colors[i % colors.length].bg),
      borderColor: labels.map((_, i) => colors[i % colors.length].border),
      borderWidth: 2
    };
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Subscription, lastValueFrom } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditRecordService } from '../core/services/edit-record.service';

/**
 * Field and Section typing so Angular template type-checker knows `regex` may exist.
 */
interface Field {
  id?: string;
  label: string;
  mandatory?: boolean;
  type?: string;
  options?: string[];
  regex?: string;
  // allow extra props without strict errors
  [key: string]: any;
}

interface Section {
  title: string;
  description?: string;
  fields: Field[];
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgSelectModule],
  templateUrl: './dynamic-form.html',
  styleUrls: ['./dynamic-form.css'],
})
export class DynamicForm implements OnInit, OnDestroy {
  form!: FormGroup;
  mode: 'add' | 'edit' | 'view' = 'add';
  editingId?: string;
  returnUrl = '/home/container/dynamic-grid';

  private valueSubs: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router,
    private ar: ActivatedRoute,
    private editSvc: EditRecordService
  ) { }

  menuLabel = 'Customer Onboarding';
  @Input() text: string = '';
  @Input() customerDatafromgrid: any;
  @Input() readonly = false;

  currencies = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
  baseCurrency = 'INR';
  exchangeRates: { [currency: string]: number } = { INR: 1, USD: 82, EUR: 90, GBP: 105, AED: 22 };

  // room sharing -> monthly rent mapping (INR)
  sharingRates: { [k: string]: number } = {
    'Single': 24000,
    'Double': 12000,
    'Triple': 9000,
    'Four Sharing Top': 7000,
    'Four Sharing Bottom': 7500
  };

  // Explicitly type onboardingForm so field.regex is allowed (optional)
  onboardingForm: Section[] = [
    {
      title: 'Personal Information',
      fields: [
        { id: 'udf1', label: 'Full Name', mandatory: true },
        { id: 'udf2', label: 'Date of Birth', mandatory: true },
        { id: 'udf3', label: 'Gender', type: 'dropdown', options: ['Male', 'Female', 'Other'], mandatory: true },
        { id: 'udf4', label: 'Mobile Number', mandatory: true, regex: '^\\d{10}$' },
        { id: 'udf5', label: 'Email ID', mandatory: true, regex: '^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
        { id: 'udf6', label: "Father's / Guardian’s Name", mandatory: false }
      ]
    },
    {
      title: 'Address Details',
      fields: [
        { id: 'udf7', label: 'Permanent Address', mandatory: true },
        {
          id: 'udf8',
          label: 'City',
          type: 'dropdown',
          options: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
          mandatory: true
        },
        {
          id: 'udf9',
          label: 'State',
          type: 'dropdown',
          options: ['Tamil Nadu', 'Karnataka', 'Kerala'],
          mandatory: true
        },
        { id: 'udf10', label: 'Pincode', mandatory: true, regex: '^\\d{6}$' }
      ]
    },
    {
      title: 'ID Verification',
      description: 'Collect identity proof and verify authenticity.',
      fields: [
        {
          id: 'udf11',
          label: 'ID Type',
          type: 'dropdown',
          options: ['Aadhaar Card', 'Passport', 'Voter ID', 'PAN Card'],
          mandatory: true
        },
        { id: 'udf12', label: 'ID Number', mandatory: true, regex: '^[A-Za-z0-9- ]{3,50}$' },
        { id: 'udf13', label: 'Upload ID Proof (PDF/Image)', mandatory: true },
        { id: 'udf14', label: 'Upload Passport Size Photo', mandatory: false }
      ]
    },
    {
      title: 'PG Stay Details',
      fields: [
        { id: 'udf15', label: 'Check-in Date', mandatory: true },
        {
          id: 'udf16',
          label: 'Room Sharing Type',
          type: 'dropdown',
          options: ['Single', 'Double', 'Triple', 'Four Sharing Top', 'Four Sharing Bottom'],
          mandatory: true
        },
        {
          id: 'udf17',
          label: 'Room Numbers',
          type: 'dropdown',
          options: ['0001', '0002', '0010'],
          mandatory: true
        },
        // explicitly mark bed number as text to avoid tel fallback
        { id: 'udf18', label: 'Bed Numbers', mandatory: false, type: 'text' },
        { id: 'udf19', label: 'Advance Paid So For', mandatory: false },
        // udf20 is the rent (amount field). We'll auto-populate this when udf16 changes.
        { id: 'udf20', label: 'Rent Paid So For', mandatory: false }
      ]
    },
    {
      title: 'Emergency Contact',
      fields: [
        // Emergency Contact Name should be text; Contact Number has regex
        { id: 'udf21', label: 'Emergency Contact Name', mandatory: true, type: 'text' },
        { id: 'udf22', label: 'Relationship', mandatory: true },
        { id: 'udf23', label: 'Contact Number', mandatory: true, regex: '^\\d{10}$' }
      ]
    },
    {
      title: 'Review & Confirm',
      fields: [
        { id: 'udf24', label: 'Display all filled details for confirmation', mandatory: true },
        { id: 'udf25', label: 'Accept terms & conditions checkbox', mandatory: true }
      ]
    }
  ];

  profileForm = new FormGroup({});

  ngOnInit(): void {
    // add common currency control
    this.profileForm.addControl('common_currency', new FormControl<any>(this.baseCurrency));

    this.generateDynamicForm();

    const commonCurrencyCtrl = this.profileForm.get('common_currency') as unknown as FormControl<any> | null;
    if (commonCurrencyCtrl) {
      const s = (commonCurrencyCtrl as FormControl<any>).valueChanges.subscribe((v: string) => {
        for (const sec of this.onboardingForm) {
          for (const f of sec.fields) {
            const controlName = this.sanitizeControlName(f);
            if (this.isAmountField(f)) {
              const currencyCtrl = this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any> | null;
              const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any> | null;
              if (currencyCtrl) (currencyCtrl as FormControl<any>).setValue(v, { emitEvent: false });
              const raw = this.parseNumberFromFormatted(String(this.profileForm.get(controlName)?.value || ''));
              if (baseCtrl) (baseCtrl as FormControl<any>).setValue(this.convertToBase(raw, v), { emitEvent: false });
            }
          }
        }
      });
      this.valueSubs.push(s);
    }

    // read query params to decide mode (add/edit/view)
    this.ar.queryParams.subscribe(params => {
      console.debug('DynamicForm: queryParams ->', params);
      const m = params['mode'];
      const id = params['id'];
      // set mode
      this.mode = (m === 'edit' || m === 'view') ? m : 'add';
      // set readonly if view
      this.readonly = (this.mode === 'view');
      // ensure controls reflect readonly state (disable/enable)
      this.applyReadonlyToControls();
      // attempt to load from service map by id as a reliable fallback
      if (id && !this.profileForm.getRawValue) {
        // noop - keep for type-safety path (no-op)
      }
      if (id) {
        try {
          const byId = this.editSvc.getById ? this.editSvc.getById(String(id)) : null;
          if (byId) {
            console.debug('DynamicForm: loaded record from EditRecordService.getById for id', id, byId);
            this.populateFormFromRecord(byId);
            if (this.readonly) this.applyReadonlyToControls();
          }
        } catch (err) { console.debug('DynamicForm: getById error', err); }
      }
      // attempt to load from sessionStorage (fallback) when id present
      if (id) {
        try {
          const raw = sessionStorage.getItem(`dynamic_record_${id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            console.debug('DynamicForm: loaded record from sessionStorage for id', id, parsed);
            this.populateFormFromRecord(parsed);
            if (this.readonly) this.applyReadonlyToControls();
          }
        } catch (err) { console.debug('DynamicForm: sessionStorage parse error', err); }
      }
      if (id) this.editingId = id;

      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    // navigation state record (grid passed)
    const nav = this.router.getCurrentNavigation();
    console.debug('DynamicForm: currentNavigation ->', !!nav, nav?.extras?.state);
    const rec = nav?.extras?.state?.['record'];

    // If there's a record in navigation state, populate the form
    if (rec) {
      // ensure form controls exist (generateDynamicForm created them)
      this.populateFormFromRecord(rec);
      // if view mode, ensure controls are disabled for extra safety
      if (this.mode === 'view') this.applyReadonlyToControls();
    }

    // Try to populate from shared service or navigation state
    // Subscribe to shared service so form reacts when other components set the record (handles route reuse)
    const svcSub = this.editSvc.watch().subscribe(svcRec => {
      console.debug('DynamicForm: editSvc.watch emitted ->', svcRec);
      if (svcRec) {
        setTimeout(() => {
          this.populateFormFromRecord(svcRec);
          if (this.readonly) this.applyReadonlyToControls();
        }, 0);
      }
    });
    this.valueSubs.push(svcSub);

    // Also check immediate snapshot value and navigation state as a fallback
    const immediate = this.editSvc.get();
    console.debug('DynamicForm: editSvc.get() immediate ->', immediate);
    if (immediate) {
      setTimeout(() => {
        this.populateFormFromRecord(immediate);
        if (this.readonly) this.applyReadonlyToControls();
      }, 0);
    } else {
      const nav2 = this.router.getCurrentNavigation();
      console.debug('DynamicForm: nav2 currentNavigation ->', !!nav2, nav2?.extras?.state);
      const rec2 = nav2?.extras?.state?.['record'];
      if (rec2) {
        this.populateFormFromRecord(rec2);
        if (this.readonly) this.applyReadonlyToControls();
      }

      // Fallback: also check window.history.state (works when getCurrentNavigation is null)
      try {
        const hist = (window as any).history?.state;
        console.debug('DynamicForm: window.history.state ->', hist);
        if (hist && hist.record) {
          this.populateFormFromRecord(hist.record);
          if (this.readonly) this.applyReadonlyToControls();
        }
      } catch (err) {
        console.debug('DynamicForm: could not read window.history.state', err);
      }

      // Also listen for navigation end in case route reuse causes component to persist
      const routerEventsSub = this.router.events.subscribe(e => {
        if (e instanceof NavigationEnd) {
          try {
            const hs = (window as any).history?.state;
            if (hs && hs.record) {
              console.debug('DynamicForm: NavigationEnd detected, history.state.record ->', hs.record);
              this.populateFormFromRecord(hs.record);
              if (this.readonly) this.applyReadonlyToControls();
            }
          } catch (err) { /* ignore */ }
        }
      });
      this.valueSubs.push(routerEventsSub as unknown as Subscription);
    }
  }

  // ensure controls reflect `this.readonly` state; keep `common_currency` enabled intentionally
  private applyReadonlyToControls() {
    if (!this.profileForm) return;
    Object.keys(this.profileForm.controls).forEach(k => {
      const ctrl = this.profileForm.get(k);
      if (!ctrl) return;
      try {
        if (this.readonly) ctrl.disable({ emitEvent: false });
        else ctrl.enable({ emitEvent: false });
      } catch (err) { /* ignore */ }
    });
  }


  private populateFormFromRecord(rec: any) {
    if (!rec) return;

    // debug
    console.debug('populateFormFromRecord called, rec keys:', Object.keys(rec || {}));
    console.debug('profileForm controls:', Object.keys(this.profileForm.controls));
    if (Array.isArray(rec.fields)) console.debug('rec.fields[0] example:', rec.fields[0]);

    // Normalize incoming record into an array of entries
    const entries: Array<{ key: string, payload: any }> = [];
    const pushKey = (k: string, payload: any) => { if (!k) return; entries.push({ key: String(k), payload }); };

    if (Array.isArray(rec.fields)) {
      for (const f of rec.fields) {
        // prefer explicit key/id if present
        let key = (f && (f.key ?? f.id)) ? (f.key ?? f.id) : null;

        // If no key but payload has a label, try to find onboardingForm field by label
        if (!key && f && typeof f.label === 'string' && f.label.trim() !== '') {
          const incomingLabel = f.label.trim().toLowerCase();
          let matchedId: string | undefined;
          // exact
          for (const sec of this.onboardingForm) {
            for (const fld of sec.fields) {
              if ((fld.label || '').toString().trim().toLowerCase() === incomingLabel) {
                matchedId = fld.id;
                break;
              }
            }
            if (matchedId) break;
          }
          // partial fallback
          if (!matchedId) {
            for (const sec of this.onboardingForm) {
              for (const fld of sec.fields) {
                const fldLabel = (fld.label || '').toString().trim().toLowerCase();
                if (!fldLabel) continue;
                if (fldLabel.includes(incomingLabel) || incomingLabel.includes(fldLabel)) {
                  matchedId = fld.id;
                  break;
                }
              }
              if (matchedId) break;
            }
          }
          if (matchedId) {
            key = matchedId;
          }
        }

        // As a final fallback preserve previous behavior (sanitize label->controlName)
        if (!key) {
          key = (f && f.label) ? this.sanitizeControlName(f) : null;
        }

        if (key) pushKey(key, f);
      }
    } else if (rec.fields && typeof rec.fields === 'object') {
      for (const k of Object.keys(rec.fields)) pushKey(k, rec.fields[k]);
    } else {
      for (const k of Object.keys(rec)) {
        if (k === 'fields') continue;
        pushKey(k, rec[k]);
      }
    }

    console.debug('populateFormFromRecord: resolved entries ->', entries);

    // helper: find control name in profileForm using heuristics (for safety)
    const findControlName = (rawKey: string, payload: any): string | null => {
      if (!rawKey) return null;
      // direct
      if (this.profileForm.contains(rawKey)) return rawKey;
      // lowercase
      const lc = rawKey.toLowerCase();
      if (this.profileForm.contains(lc)) return lc;
      // sanitized
      const sanitized = this.sanitizeControlName({ id: rawKey, label: rawKey });
      if (this.profileForm.contains(sanitized)) return sanitized;
      // payload id/key
      if (payload && (payload.id || payload.key)) {
        const pk = String(payload.id ?? payload.key);
        if (this.profileForm.contains(pk)) return pk;
        if (this.profileForm.contains(pk.toLowerCase())) return pk.toLowerCase();
      }
      // match by label against onboardingForm definitions
      try {
        const labelToMatch = (payload && payload.label) ? String(payload.label).toLowerCase().trim() : rawKey.toLowerCase().trim();
        for (const sec of this.onboardingForm) {
          for (const fld of sec.fields) {
            const fldLabel = (fld.label || '').toString().toLowerCase().trim();
            const fldId = this.sanitizeControlName(fld);
            if (!fldLabel) continue;
            if (fldLabel === labelToMatch || fldLabel.includes(labelToMatch) || labelToMatch.includes(fldLabel)) {
              if (this.profileForm.contains(fldId)) return fldId;
            }
          }
        }
      } catch (err) { /* ignore */ }

      return null;
    };

    for (const entry of entries) {
      const rawKey = entry.key;
      const payload = entry.payload;
      // Try to resolve an existing control name first. If not found, create
      // a tolerant fallback control so incoming records always populate the form
      // (this addresses timing/route-reuse cases where navigation state arrives
      // before controls are present or naming mismatches occur).
      let ctrlName = findControlName(rawKey, payload);
      if (!ctrlName) {
        const fallbackName = String(rawKey || '').toLowerCase().replace(/[^a-z0-9]/g, '_') || this.sanitizeControlName(payload ?? rawKey);
        try {
          // Amount fields need currency/base controls
          if (this.isAmountField(payload ?? { label: fallbackName })) {
            if (!this.profileForm.contains(fallbackName)) this.profileForm.addControl(fallbackName, new FormControl<any>('', []));
            if (!this.profileForm.contains(`${fallbackName}_currency`)) this.profileForm.addControl(`${fallbackName}_currency`, new FormControl<any>(this.profileForm.get('common_currency')?.value || this.baseCurrency));
            if (!this.profileForm.contains(`${fallbackName}_base`)) this.profileForm.addControl(`${fallbackName}_base`, new FormControl<any>(0));
          } else if (this.getInputType(payload) === 'checkbox') {
            if (!this.profileForm.contains(fallbackName)) this.profileForm.addControl(fallbackName, new FormControl<any>(false, []));
          } else {
            const initial = (payload && payload.type === 'dropdown') ? null : '';
            if (!this.profileForm.contains(fallbackName)) this.profileForm.addControl(fallbackName, new FormControl<any>({ value: initial, disabled: this.readonly }, []));
          }
          ctrlName = fallbackName;
          console.debug('populateFormFromRecord: created fallback control', fallbackName);
        } catch (err) {
          console.warn('populateFormFromRecord: could not create fallback control for', rawKey, err);
          continue;
        }
      }

      // value extraction (primitive or { value: ... } or { val: ... })
      const incomingVal = (payload === null || payload === undefined || typeof payload === 'string' || typeof payload === 'number' || typeof payload === 'boolean')
        ? payload
        : (payload.value !== undefined ? payload.value : (payload.val !== undefined ? payload.val : null));

      const inputType = this.getInputType(payload ?? { label: ctrlName });

      // skip files
      if (inputType === 'file' || String(payload?.label || '').toLowerCase().includes('upload')) {
        console.debug('populateFormFromRecord: skipping file input', ctrlName);
        continue;
      }

      // amount
      if (this.isAmountField(payload ?? { label: ctrlName })) {
        const currencyKey = `${ctrlName}_currency`;
        const baseKey = `${ctrlName}_base`;
        const rawVal = (typeof incomingVal === 'number') ? incomingVal : this.parseNumberFromFormatted(String(incomingVal ?? ''));
        const currency = (payload && (payload.currency || payload.cur)) ? (payload.currency || payload.cur) : (this.profileForm.get('common_currency')?.value || this.baseCurrency);
        if (this.profileForm.contains(currencyKey)) this.profileForm.get(currencyKey)!.setValue(currency, { emitEvent: false });
        this.profileForm.get(ctrlName)!.setValue(this.formatNumberForDisplay(Number(rawVal || 0), currency), { emitEvent: false });
        if (this.profileForm.contains(baseKey)) this.profileForm.get(baseKey)!.setValue(this.convertToBase(Number(rawVal || 0), currency), { emitEvent: false });
        console.debug('populateFormFromRecord: set amount', ctrlName, rawVal, currency);
        continue;
      }

      // checkbox
      if (inputType === 'checkbox') {
        this.profileForm.get(ctrlName)!.setValue(Boolean(incomingVal), { emitEvent: false });
        console.debug('populateFormFromRecord: set checkbox', ctrlName, incomingVal);
        continue;
      }

      // date handling
      if (inputType === 'date') {
        let dateVal: string | null = null;
        if (incomingVal === null || incomingVal === undefined || incomingVal === '') {
          dateVal = null;
        } else {
          const raw = String(incomingVal);
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) dateVal = raw;
          else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
            const [m, d, y] = raw.split('/');
            dateVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
            const [d, m, y] = raw.split('-');
            dateVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            const dt = new Date(raw);
            if (!isNaN(dt.getTime())) {
              const y = dt.getFullYear();
              const m = String(dt.getMonth() + 1).padStart(2, '0');
              const d = String(dt.getDate()).padStart(2, '0');
              dateVal = `${y}-${m}-${d}`;
            } else dateVal = raw;
          }
        }
        this.profileForm.get(ctrlName)!.setValue(dateVal, { emitEvent: false });
        console.debug('populateFormFromRecord: set date', ctrlName, dateVal);
        continue;
      }

      // dropdown / ng-select - set to exact value (or null)
      const matchingDefinedField = this.onboardingForm.reduce((acc: any[], s) => acc.concat(s.fields), []).find(ff => this.sanitizeControlName(ff) === ctrlName);
      if ((payload && payload.type === 'dropdown') || Array.isArray((payload as any)?.options) ||
        Array.isArray(matchingDefinedField?.options)) {
        this.profileForm.get(ctrlName)!.setValue(incomingVal ?? null, { emitEvent: false });
        console.debug('populateFormFromRecord: set dropdown', ctrlName, incomingVal);
        continue;
      }

      // default
      this.profileForm.get(ctrlName)!.setValue(incomingVal ?? '', { emitEvent: false });
      console.debug('populateFormFromRecord: set default', ctrlName, incomingVal);
    }
  }




  ngOnDestroy(): void {
    this.valueSubs.forEach(s => s.unsubscribe());
  }

  // public so template can call it
  public isAmountField(field: Field | any): boolean {
    const label = (typeof field === 'string' ? field : (field?.label || '')).toLowerCase();
    return (field && field.type === 'number') || label.includes('amount') || label.includes('deposit') || label.includes('rent') || label.includes('paid') || label.includes('advance');
  }

  // improved input type detection
  public getInputType(field: Field | any): string {
    const label = typeof field === 'string' ? field : (field?.label || '');
    const lower = (label || '').toLowerCase().trim();

    // explicit special cases
    if (lower.includes('display all filled details for confirmation') || lower.includes('accept terms & conditions')) {
      return 'checkbox';
    }
    if (lower.includes('email')) return 'email';
    if (lower.includes('date')) return 'date';
    if (lower.includes('password')) return 'password';
    if (lower.includes('upload') || lower.includes('file') || lower.includes('photo')) return 'file';

    // prefer name/text when label mentions name
    if (lower.includes('name')) return 'text';

    // explicit number patterns — be precise
    if (lower.includes('mobile') || lower.includes('mobile number') || lower.includes('contact number') ||
      lower.includes('contact no') || lower.includes('pincode') || /\bnumber\b/.test(lower)) {
      return 'tel';
    }

    // currency/amount handled as text (we format separately)
    if (lower.includes('amount') || lower.includes('deposit') || lower.includes('rent') || lower.includes('paid')) return 'text';

    return 'text';
  }

  generateDynamicForm() {
    // cleanup previous subs
    this.valueSubs.forEach(s => s.unsubscribe());
    this.valueSubs = [];

    if (!Array.isArray(this.onboardingForm)) {
      console.error('onboardingForm is not an array', this.onboardingForm);
      return;
    }

    for (const section of this.onboardingForm) {
      for (const field of section.fields) {
        const controlName = this.sanitizeControlName(field);

        // build validators list
        const validators: any[] = [];
        if (field && (field as any).mandatory) validators.push(Validators.required);

        const inputType = this.getInputType(field);

        // explicitly skip pattern for dropdowns
        let effectiveRegex: string | undefined = undefined;
        if (field && field.type === 'dropdown') {
          effectiveRegex = undefined;
        }

        if (inputType === 'email') {
          validators.push(Validators.email);
        }

        if (inputType === 'tel') {
          const fieldRegex = (field as Field)?.regex;
          if (!fieldRegex) {
            effectiveRegex = (field.label || '').toLowerCase().includes('pincode') ? '^\\d{6}$' : '^\\d{10}$';
          } else {
            effectiveRegex = fieldRegex;
          }
        } else {
          // if field has regex (and it's not a dropdown), prefer that
          if (!(field && field.type === 'dropdown') && field && typeof (field as Field).regex === 'string' && (field as Field).regex!.trim() !== '') {
            effectiveRegex = (field as Field).regex!.trim();
          }
        }

        // add regex pattern validator if effectiveRegex present and valid
        if (typeof effectiveRegex === 'string' && effectiveRegex.trim() !== '') {
          try {
            new RegExp(effectiveRegex);
            validators.push(Validators.pattern(effectiveRegex));
          } catch (err) {
            console.warn('Skipping invalid regex for', controlName, effectiveRegex, err);
          }
        }

        // If control exists, update validators & ensure amount currency/base exist and re-hook subs.
        if (this.profileForm.contains(controlName)) {
          const existing = this.profileForm.get(controlName) as FormControl;
          if (existing) {
            existing.setValidators(validators);
            existing.updateValueAndValidity({ emitEvent: false });
          }

          // ensure currency/base exist for amount fields
          if (this.isAmountField(field)) {
            if (!this.profileForm.contains(`${controlName}_currency`)) {
              this.profileForm.addControl(`${controlName}_currency`, new FormControl<any>(this.profileForm.get('common_currency')?.value || this.baseCurrency));
            }
            if (!this.profileForm.contains(`${controlName}_base`)) {
              this.profileForm.addControl(`${controlName}_base`, new FormControl<any>(0));
            }

            // re-add subscriptions for amount fields (we unsubscribed all at start)
            const currCtrl = this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>;
            const amtCtrl = this.profileForm.get(controlName) as unknown as FormControl<any>;
            const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any>;

            if (currCtrl && amtCtrl && baseCtrl) {
              const s1 = (currCtrl as FormControl<any>).valueChanges.subscribe((newCurrency: string) => {
                const raw = this.parseNumberFromFormatted(String(amtCtrl.value || ''));
                const converted = this.convertToBase(raw, newCurrency);
                (baseCtrl as FormControl<any>).setValue(converted, { emitEvent: false });
              });
              this.valueSubs.push(s1);

              const s2 = (amtCtrl as FormControl<any>).valueChanges.subscribe(() => {
                const raw = this.parseNumberFromFormatted(String(amtCtrl.value || ''));
                const currency = currCtrl.value || (this.profileForm.get('common_currency')?.value || this.baseCurrency);
                (baseCtrl as FormControl<any>).setValue(this.convertToBase(raw, currency), { emitEvent: false });
              });
              this.valueSubs.push(s2);

              const initialRaw = this.parseNumberFromFormatted(String(this.profileForm.get(controlName)?.value || ''));
              (baseCtrl as FormControl<any>).setValue(this.convertToBase(initialRaw, currCtrl.value), { emitEvent: false });
            }
          }
        } else {
          // Control doesn't exist yet -> create it
          if (this.isAmountField(field)) {
            this.profileForm.addControl(controlName, new FormControl<any>('', validators));
            this.profileForm.addControl(`${controlName}_currency`, new FormControl<any>(this.profileForm.get('common_currency')?.value || this.baseCurrency));
            this.profileForm.addControl(`${controlName}_base`, new FormControl<any>(0));

            const currCtrl = this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>;
            const amtCtrl = this.profileForm.get(controlName) as unknown as FormControl<any>;
            const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any>;

            const s1 = (currCtrl as FormControl<any>).valueChanges.subscribe((newCurrency: string) => {
              const raw = this.parseNumberFromFormatted(String(amtCtrl.value || ''));
              const converted = this.convertToBase(raw, newCurrency);
              (baseCtrl as FormControl<any>).setValue(converted, { emitEvent: false });
            });
            this.valueSubs.push(s1);

            const s2 = (amtCtrl as FormControl<any>).valueChanges.subscribe(() => {
              const raw = this.parseNumberFromFormatted(String(amtCtrl.value || ''));
              const currency = currCtrl.value || (this.profileForm.get('common_currency')?.value || this.baseCurrency);
              (baseCtrl as FormControl<any>).setValue(this.convertToBase(raw, currency), { emitEvent: false });
            });
            this.valueSubs.push(s2);

            const initialRaw = this.parseNumberFromFormatted(String(this.profileForm.get(controlName)?.value || ''));
            (baseCtrl as FormControl<any>).setValue(this.convertToBase(initialRaw, currCtrl.value), { emitEvent: false });

          } else if (inputType === 'checkbox') {
            this.profileForm.addControl(controlName, new FormControl<any>(false, validators));
          } else {
            // For dropdowns we want the value to start as null so ng-select shows the placeholder.
            const initial = (field && field.type === 'dropdown') ? null : '';
            // this.profileForm.addControl(controlName, new FormControl<any>(initial, validators));
            this.profileForm.addControl(controlName, new FormControl<any>({ value: initial, disabled: this.readonly }, validators));

          }
        }

        // special subscription: if this is Room Sharing Type (udf16), when it changes populate rent field
        if (controlName === 'udf16') {
          const sharingCtrl = this.profileForm.get(controlName) as unknown as FormControl<any>;
          // ensure we don't double-subscribe: the valueSubs were cleared above so it's safe to add
          const s3 = (sharingCtrl as FormControl<any>).valueChanges.subscribe((selected: string) => {
            const rate = this.sharingRates[selected] ?? 0;
            // populate udf20 (Rent Paid So For)
            const rentControlName = 'udf20';
            if (this.profileForm.contains(rentControlName)) {
              this.setAmountControlValue(rentControlName, rate, 'INR');
            }
          });
          this.valueSubs.push(s3);
        }
      }
    }
  }

  // helper to set an amount control's value in formatted display + currency + base
  private setAmountControlValue(controlName: string, amount: number, currency: string) {
    const displayCtrl = this.profileForm.get(controlName) as unknown as FormControl<any> | null;
    const currencyCtrl = this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any> | null;
    const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any> | null;

    if (currencyCtrl) (currencyCtrl as FormControl<any>).setValue(currency, { emitEvent: false });

    if (displayCtrl) {
      const formatted = this.formatNumberForDisplay(amount, currency);
      displayCtrl.setValue(formatted, { emitEvent: false });
    }

    if (baseCtrl) {
      baseCtrl.setValue(this.convertToBase(amount, currency), { emitEvent: false });
    }
  }

  sanitizeControlName(field: Field | any): string {
    if (!field) return '';
    if (typeof field === 'string') return field.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if ((field as Field).id) return (field as Field).id!;
    return (field.label || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  parseNumberFromFormatted(val: string | null): number {
    if (val === null || val === undefined || val === '') return 0;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }

  formatNumberForDisplay(value: number, currency: string): string {
    const num = Number(value) || 0;
    try {
      const locale = (currency === 'INR') ? 'en-IN' : 'en-US';
      return num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch {
      return num.toString();
    }
  }

  convertToBase(value: number | string | null, currency: string): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value) || 0;
    const srcRate = this.exchangeRates[currency] ?? 1;
    const baseRate = this.exchangeRates[this.baseCurrency] ?? 1;
    return num * (srcRate / baseRate);
  }

  onAmountInput(controlName: string) {
    const ctrl = this.profileForm.get(controlName) as unknown as FormControl<any> | null;
    if (!ctrl) return;
    const raw = this.parseNumberFromFormatted(String(ctrl.value || ''));
    const currency = (this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>)?.value || (this.profileForm.get('common_currency') as unknown as FormControl<any>)?.value || this.baseCurrency;
    const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any> | null;
    if (baseCtrl) (baseCtrl as FormControl<any>).setValue(this.convertToBase(raw, currency), { emitEvent: false });
  }

  onAmountBlur(controlName: string) {
    const ctrl = this.profileForm.get(controlName) as unknown as FormControl<any> | null;
    if (!ctrl) return;
    const raw = this.parseNumberFromFormatted(String(ctrl.value || ''));
    const currency = (this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>)?.value || (this.profileForm.get('common_currency') as unknown as FormControl<any>)?.value || this.baseCurrency;
    const formatted = this.formatNumberForDisplay(raw, currency);
    ctrl.setValue(formatted, { emitEvent: false });
    const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any> | null;
    if (baseCtrl) (baseCtrl as FormControl<any>).setValue(this.convertToBase(raw, currency), { emitEvent: false });
  }

  numberToWords(value: number, currency: string): string {
    if (value === null || value === undefined) return '';
    const num = Math.abs(Math.floor(value));
    const decimals = Math.round((Math.abs(Number(String(value))) - Math.floor(Math.abs(Number(value)))) * 100);

    if (num === 0 && decimals === 0) {
      return `Zero ${this.currencyUnitMajor(currency)} only`;
    }

    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function inWords(n: number): string {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    }

    const major = inWords(num);
    const minor = (decimals > 0) ? `${decimals}/100` : null;

    if (minor) {
      return `${major} ${this.currencyUnitMajor(currency)} and ${minor} ${this.currencyUnitMinor(currency)} only`;
    } else {
      return `${major} ${this.currencyUnitMajor(currency)} only`;
    }
  }

  currencyUnitMajor(currency: string) {
    switch ((currency || '').toUpperCase()) {
      case 'INR': return 'Rupees';
      case 'USD': return 'Dollars';
      case 'EUR': return 'Euros';
      case 'GBP': return 'Pounds';
      case 'AED': return 'Dirhams';
      default: return currency || 'Units';
    }
  }
  currencyUnitMinor(currency: string) {
    switch ((currency || '').toUpperCase()) {
      case 'INR': return 'Paise';
      case 'USD': return 'Cents';
      case 'EUR': return 'Cents';
      case 'GBP': return 'Pence';
      case 'AED': return 'Fils';
      default: return 'Cents';
    }
  }

  // returns words for the typed amount (same as before)
  getAmountInWords(controlName: string): string {
    const ctrl = this.profileForm.get(controlName) as unknown as FormControl<any> | null;
    if (!ctrl) return '';
    const raw = this.parseNumberFromFormatted(String(ctrl.value || ''));
    const currency = (this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>)?.value || (this.profileForm.get('common_currency') as unknown as FormControl<any>)?.value || this.baseCurrency;
    return this.numberToWords(raw, currency);
  }

  // NEW: returns words for the base-converted value
  public getBaseAmountInWords(controlName: string): string {
    const baseCtrl = this.profileForm.get(`${controlName}_base`) as unknown as FormControl<any> | null;
    if (!baseCtrl) return '';
    const rawBase = Number(baseCtrl.value) || 0;
    return this.numberToWords(rawBase, this.baseCurrency);
  }

  getConvertedLabelFor(controlName: string): string {
    const ctrl = this.profileForm.get(controlName) as unknown as FormControl<any> | null;
    if (!ctrl) return '';
    const raw = this.parseNumberFromFormatted(String(ctrl.value || ''));
    const currency = (this.profileForm.get(`${controlName}_currency`) as unknown as FormControl<any>)?.value || (this.profileForm.get('common_currency') as unknown as FormControl<any>)?.value || this.baseCurrency;
    const converted = this.convertToBase(raw, currency);
    const formatted = this.formatNumberForDisplay(converted, this.baseCurrency);
    return `${this.baseCurrency} ${formatted}`;
  }

  private buildStructuredPayload(flatValues: { [k: string]: any }): { [k: string]: any } {
    const result: { [k: string]: any } = {};
    for (const section of this.onboardingForm) {
      for (const field of section.fields) {
        const controlName = this.sanitizeControlName(field);
        const label = typeof field === 'string' ? field : field.label ?? controlName;
        const rawValFormatted = flatValues.hasOwnProperty(controlName) ? flatValues[controlName] : null;
        const value = this.isAmountField(field) ? this.parseNumberFromFormatted(String(rawValFormatted)) : rawValFormatted;
        const mandatory = (field && (field as any).mandatory) ? 'yes' : 'no';
        const obj: any = { value, label, mandatory };

        if (this.isAmountField(field)) {
          const currencyKey = `${controlName}_currency`;
          const baseKey = `${controlName}_base`;
          const currency = flatValues.hasOwnProperty(currencyKey) ? flatValues[currencyKey] : this.profileForm.get('common_currency')?.value || this.baseCurrency;
          const converted = flatValues.hasOwnProperty(baseKey) ? Number(flatValues[baseKey]) : this.convertToBase(value, currency);
          obj.currency = currency;
          obj.convertedToBase = converted;
        }

        result[controlName] = obj;
      }
    }
    return result;
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const flatInputMap = this.profileForm.getRawValue();
    const structuredPayload = this.buildStructuredPayload(flatInputMap);

    // -------------------------------
    // EDIT MODE
    // -------------------------------
    if (this.customerDatafromgrid) {

      try {
        await lastValueFrom(this.updateCustomerFull(this.customerDatafromgrid.key, structuredPayload));

        // ✓ SUCCESS POPUP → redirect afterwards
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'Customer details have been updated!',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          this.profileForm.reset();
          this.router.navigate(['/home/container/dynamic-grid']);
        });

      } catch (error) {

        console.error('HTTP Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'Something went wrong while updating customer!',
          confirmButtonColor: '#d33'
        });
      }

      return;
    }

    // -------------------------------
    // ADD MODE
    // -------------------------------
    try {

      await lastValueFrom(this.http.post(
        'https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json',
        structuredPayload,
        { headers: { 'Content-Type': 'application/json' } }
      ));

      // ✓ SUCCESS POPUP → redirect afterwards
      Swal.fire({
        icon: 'success',
        title: 'Created Successfully',
        text: 'New customer has been added!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.profileForm.reset();
        this.router.navigate(['/home/container/dynamic-grid']);
      });

    } catch (error) {

      console.error('HTTP Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Creation Failed',
        text: 'Something went wrong while creating customer!',
        confirmButtonColor: '#d33'
      });

    }
  }


  updateCustomerFull(key: string, val: object) {
    return this.http.put(`https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer/${key}.json`, val);
  }

  resetForm() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will clear all entered data!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset it!',
      cancelButtonText: 'No, keep it',
      reverseButtons: true,
      customClass: { popup: 'swal-top' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.profileForm.reset();
        (this.profileForm.get('common_currency') as unknown as FormControl<any>)?.setValue(this.baseCurrency);
        this.generateDynamicForm();
        Swal.fire({ icon: 'success', title: 'Form Reset', text: 'All fields have been cleared.', timer: 2000, showConfirmButton: false, customClass: { popup: 'swal-top' } });
      }
    });
  }

  goToGrid() {
    this.router.navigate(['home/container/dynamic-grid']);
  }

  // Focus helpers ---------------------------------------------------------

  focusNext(event: Event) {
    try { event.preventDefault(); } catch { /* ignore */ }
    const current = event.target as HTMLElement | null;
    if (!current) return;
    this.focusNextFromElement(current);
  }

  private focusNextFromElement(current: HTMLElement) {
    // limit search to the current form so we don't jump outside
    const formEl = current.closest('form') as HTMLFormElement | null;
    const selector = [
      'input:not([type="hidden"]):not([disabled]):not([readonly])',
      'select:not([disabled]):not([readonly])',
      'textarea:not([disabled]):not([readonly])',
      'button:not([disabled])'
    ].join(', ');

    const all = formEl ? Array.from(formEl.querySelectorAll<HTMLElement>(selector)) : Array.from(document.querySelectorAll<HTMLElement>(selector));
    const index = all.indexOf(current);

    if (index === -1 && current.id) {
      const fallbackIdx = all.findIndex(el => el.id === current.id);
      if (fallbackIdx !== -1 && fallbackIdx < all.length - 1) {
        const nextFallback = all[fallbackIdx + 1];
        nextFallback.focus();
        if (nextFallback instanceof HTMLInputElement) nextFallback.select();
      }
      return;
    }

    if (index >= 0 && index < all.length - 1) {
      const next = all[index + 1];
      next.focus();
      if (next instanceof HTMLInputElement) {
        try { next.select(); } catch { }
      }
    }
  }

  // ---------- end (old custom dropdown code removed — ng-select handles dropdown behavior) ----------
}

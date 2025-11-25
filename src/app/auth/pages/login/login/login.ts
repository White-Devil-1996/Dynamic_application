import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';

type FieldConfig = {
  name: string;
  type: string;
  placeholder?: string;
  iconClass?: string;
  required?: boolean;
  validators?: any[];
  errors?: Record<string, string>;
  attrs?: Record<string, any>;
  imageSrc?: string;
};

type LoginConfig = {
  signIn: {
    logoSrc: string;
    title: string;
    submitText: string;
    loadingText: string;
    fields: FieldConfig[];
    rememberMe?: { id: string; label: string };
    forgot?: { href: string; textPrefix: string; textSuffix: string };
  };
  signUp: {
    title: string;
    submitText: string;
    loadingText: string;
    themeDefault?: string;
    fields: FieldConfig[];
  };
  panels: { left: any; right: any };
  general?: { missingValuesToast?: string };
};

/**
 * Local request interfaces (match your example payloads).
 * Replace these with imports from your central models if available.
 */
export interface LoginRequest {
  email: string;
  password: string;
  [key: string]: any;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  theme: string;
  [key: string]: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class Login implements OnInit {
  signinform!: FormGroup;
  signupform!: FormGroup;

  isSignUpMode = false;
  isSigningIn = false;
  isSigningUp = false;

  // config initialised in ngOnInit; template uses *ngIf="loginConfig"
  loginConfig: LoginConfig | null = null;

  // server-side field errors override (field -> message)
  serverFieldErrors: Record<string, string> = {};

  // password show toggles keyed by "section.field"
  showPassword: Record<string, boolean> = {};

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildConfig();
    this.buildFormsFromConfig();
  }

  private buildConfig(): void {
    this.loginConfig = {
      signIn: {
        logoSrc: './assets/images/login/loginn.PNG',
        title: 'Sign in',
        submitText: 'Login',
        loadingText: 'Logging in...',
        fields: [
          {
            name: 'email',
            type: 'text',
            placeholder: 'Enter User Id',
            iconClass: 'fa fa-user',
            required: true,
            errors: {
              required: 'Please enter value',
              invalid: 'Please enter a valid value',
            },
          },
          {
            name: 'password',
            type: 'password',
            placeholder: 'Enter Password',
            iconClass: 'fa fa-lock',
            required: true,
            errors: { required: 'Please enter password' },
            imageSrc: './assets/images/login/visible-opened-eye-interface-option.png',
          },
        ],
        rememberMe: { id: 'RememberMe', label: 'Remember Me' },
        forgot: {
          href: '../login/forgot-password.html',
          textPrefix: 'Forgot',
          textSuffix: 'Username / Password?',
        },
      },
      signUp: {
        title: 'Sign up',
        submitText: 'Sign up',
        loadingText: 'Creating...',
        themeDefault: '#ccc',
        fields: [
          {
            name: 'fullName',
            type: 'text',
            placeholder: 'Enter Full Name',
            iconClass: 'fa fa-user',
            required: true,
            errors: { required: 'Please enter full name' },
          },
          {
            name: 'email',
            type: 'email',
            placeholder: 'Enter Email',
            iconClass: 'fa fa-envelope',
            required: true,
            errors: { required: 'Please enter value', email: 'Please enter a valid email' },
          },
          {
            name: 'password',
            type: 'password',
            placeholder: 'Enter Password',
            iconClass: 'fa fa-lock',
            required: true,
            errors: { required: 'Please enter password' },
            imageSrc: './assets/images/login/visible-opened-eye-interface-option.png',
          },
          {
            name: 'phone',
            type: 'tel',
            placeholder: 'Enter Phone Number',
            iconClass: 'fa fa-mobile',
            required: true,
            errors: { required: 'Please enter phone number' },
            attrs: { maxlength: 15 },
          },
          {
            name: 'theme',
            type: 'color',
            placeholder: '',
            iconClass: '',
            required: true,
            errors: {},
          },
        ],
      },
      panels: {
        left: {
          title: 'New here ?',
          text: "Don't have an Account?",
          buttonText: 'Sign up',
          imageSrc: './assets/images/login/log.svg',
        },
        right: {
          title: 'One of us ?',
          text: 'Already have an Account?',
          buttonText: 'Sign in',
          imageSrc: './assets/images/login/register.svg',
        },
      },
      general: { missingValuesToast: 'Please enter required values.' },
    };

    // initialize password toggles
    this.loginConfig.signIn.fields.forEach((f) => {
      if (f.type === 'password') this.showPassword[`signIn.${f.name}`] = false;
    });
    this.loginConfig.signUp.fields.forEach((f) => {
      if (f.type === 'password') this.showPassword[`signUp.${f.name}`] = false;
    });
  }

  private buildFormsFromConfig(): void {
    // sign-in group
    const signInGroup: Record<string, any> = {};
    this.loginConfig?.signIn.fields.forEach((f) => {
      const validators = [];
      if (f.required) validators.push(Validators.required);
      if (f.type === 'email') validators.push(Validators.email);
      if (Array.isArray(f.validators)) validators.push(...f.validators);
      const defaultVal = f.type === 'color' ? (this.loginConfig?.signUp.themeDefault ?? '#ccc') : '';
      signInGroup[f.name] = [defaultVal, validators];
    });
    this.signinform = this.fb.group(signInGroup);

    // sign-up group
    const signUpGroup: Record<string, any> = {};
    this.loginConfig?.signUp.fields.forEach((f) => {
      const validators = [];
      if (f.required) validators.push(Validators.required);
      if (f.type === 'email') validators.push(Validators.email);
      if (Array.isArray(f.validators)) validators.push(...f.validators);
      const defaultVal = f.type === 'color' ? (this.loginConfig?.signUp.themeDefault ?? '#ccc') : '';
      signUpGroup[f.name] = [defaultVal, validators];
    });
    this.signupform = this.fb.group(signUpGroup);
  }

  switchToSignup(): void {
    this.isSignUpMode = true;
  }
  switchToSignin(): void {
    this.isSignUpMode = false;
  }

  controlInvalid(form: FormGroup, controlName: string): boolean {
    const c = form.get(controlName);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  getErrorMessage(form: FormGroup, controlName: string, section: 'signIn' | 'signUp' = 'signIn'): string {
    if (this.serverFieldErrors && this.serverFieldErrors[controlName]) {
      return this.serverFieldErrors[controlName];
    }

    const control = form.get(controlName);
    if (!control || !control.errors) return '';

    const cfgSection = section === 'signIn' ? this.loginConfig?.signIn : this.loginConfig?.signUp;
    const controlCfgObj: FieldConfig | undefined = cfgSection?.fields?.find((f) => f.name === controlName);
    const errorsCfg: Record<string, string> = (controlCfgObj && controlCfgObj.errors) ? controlCfgObj.errors : {};

    if (control.hasError('required') && errorsCfg['required']) return errorsCfg['required'];
    if (control.hasError('required')) return 'Please enter value';

    if (control.hasError('email') && errorsCfg['email']) return errorsCfg['email'];
    if (control.hasError('email')) return 'Please enter a valid email';

    if (errorsCfg['invalid']) return errorsCfg['invalid'];

    return 'Invalid value';
  }

  togglePassword(section: 'signIn' | 'signUp', fieldName: string): void {
    const key = `${section}.${fieldName}`;
    this.showPassword[key] = !this.showPassword[key];
  }

  /**
   * Build a payload object using only fields declared in loginConfig for the given section.
   * This ensures payload shape is driven by the JSON config.
   */
  private buildPayload(form: FormGroup, section: 'signIn' | 'signUp'): Record<string, any> {
    const payload: Record<string, any> = {};
    const cfgSection = section === 'signIn' ? this.loginConfig?.signIn : this.loginConfig?.signUp;
    if (!cfgSection || !Array.isArray(cfgSection.fields)) return payload;

    cfgSection.fields.forEach((f) => {
      const ctrl = form.get(f.name);
      if (ctrl) {
        payload[f.name] = ctrl.value;
      } else {
        payload[f.name] = undefined;
      }
    });

    return payload;
  }

  signin(): void {
    this.signinform.markAllAsTouched();
    if (this.signinform.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing values',
        text: this.loginConfig?.general?.missingValuesToast || 'Please enter required values.',
        toast: true,
        timer: 1800,
        showConfirmButton: false,
        position: 'top-end',
      });
      return;
    }

    const rawPayload = this.buildPayload(this.signinform, 'signIn');
    const cfgFields = this.loginConfig?.signIn.fields ?? [];

    // Build payload purely from JSON-defined fields (dynamic)
    const dynamicPayload: Record<string, any> = {};
    cfgFields.forEach((f) => {
      // prefer values already collected in rawPayload, otherwise fallback to FormControl
      const val = rawPayload[f.name] !== undefined ? rawPayload[f.name] : this.signinform.get(f.name)?.value;
      dynamicPayload[f.name] = val;
    });

    // cast to request type (we built the payload based on config fields)
    const payloadTyped = dynamicPayload as unknown as LoginRequest;

    this.isSigningIn = true;
    this.serverFieldErrors = {};

    this.authService
      .login(payloadTyped)
      .pipe(finalize(() => (this.isSigningIn = false)))
      .subscribe({
        next: () => {
          const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
          this.router.navigateByUrl(redirect);
        },
        error: (err) => {
          if (err?.error?.fields && typeof err.error.fields === 'object') {
            this.serverFieldErrors = err.error.fields;
            Object.keys(this.serverFieldErrors).forEach((f) => {
              const ctrl = this.signinform.get(f);
              if (ctrl) ctrl.markAsTouched();
            });
          }
          const msg = err?.error?.message || err?.error?.error || 'Login failed';
          Swal.fire({ icon: 'error', title: 'Login failed', text: msg, confirmButtonText: 'OK' });
        },
      });
  }

  signup(): void {
    this.signupform.markAllAsTouched();
    if (this.signupform.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing values',
        text: this.loginConfig?.general?.missingValuesToast || 'Please enter required values.',
        toast: true,
        timer: 1800,
        showConfirmButton: false,
        position: 'top-end',
      });
      return;
    }

    const rawPayload = this.buildPayload(this.signupform, 'signUp');
    const cfgFields = this.loginConfig?.signUp.fields ?? [];

    // Build payload purely from JSON-defined fields (dynamic)
    const dynamicPayload: Record<string, any> = {};
    cfgFields.forEach((f) => {
      const val = rawPayload[f.name] !== undefined ? rawPayload[f.name] : this.signupform.get(f.name)?.value;
      dynamicPayload[f.name] = val;
    });

    // cast to SignupRequest
    const payloadTyped = dynamicPayload as unknown as SignupRequest;

    this.isSigningUp = true;
    this.serverFieldErrors = {};

    this.authService
      .signup(payloadTyped)
      .pipe(finalize(() => (this.isSigningUp = false)))
      .subscribe({
        next: (res) => {
          const msg = (res && (res.user || res.user)) || 'Account created successfully';
          Swal.fire({ icon: 'success', title: 'Success', text: msg, confirmButtonText: 'OK' }).then(() => {
            this.switchToSignin();
            const patch: any = {};
            this.loginConfig?.signUp.fields?.forEach((f) => {
              patch[f.name] = f.type === 'color' ? (this.loginConfig?.signUp.themeDefault ?? '#ccc') : '';
            });
            this.signupform.reset(patch);
          });
        },
        error: (err) => {
          if (err?.error?.fields && typeof err.error.fields === 'object') {
            this.serverFieldErrors = err.error.fields;
            Object.keys(this.serverFieldErrors).forEach((f) => {
              const ctrl = this.signupform.get(f);
              if (ctrl) ctrl.markAsTouched();
            });
          }
          const msg = err?.error?.message || err?.error?.error || 'Something went wrong';
          Swal.fire({ icon: 'error', title: 'Registration failed', text: msg, confirmButtonText: 'OK' });
        },
      });
  }
}

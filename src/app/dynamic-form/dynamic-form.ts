// import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { Label } from '../label/label';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormsModule, RouterModule],
templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.css',
})
export class DynamicForm implements OnInit {
form!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  editingId?: string;
  returnUrl = '/home/container/dynamic-grid';

  constructor(private http: HttpClient,private fb: FormBuilder, private router: Router, private ar: ActivatedRoute) {}
  menuLabel = 'Customer Onboarding';
   @Input() text: string = '';
   @Input() customerDatafromgrid: any;
    @Input() readonly = false; 
    // form: any = {};
 




  onboardingForm = [
    // { title: "Personal Information", fields: ["Full Name", "Date of Birth", { label: 'Gender', type: 'dropdown', options: ['Male', 'Female', 'Other'] }, "Mobile Number", "Alternate Number", "Email ID", "Father's / Guardian’s Name"] },
        { title: "Personal Information", fields: ["Full Name", "Date of Birth", { label: 'Gender', type: 'dropdown', options: ['Male', 'Female', 'Other'] }, "Mobile Number", "Email ID", "Father's / Guardian’s Name"] },
    // { title: "Address Details", fields: ["Permanent Address", "Current Address",{ label: 'City', type: 'dropdown', options:   [ 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Cuddalore', 'Kanchipuram', 'Nagercoil', 'Karur', 'Tiruppur', 'Virudhunagar', 'Nagapattinam', 'Sivakasi', 'Ambur', 'Rajapalayam', 'Ariyalur', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Krishnagiri', 'Dharmapuri', 'Theni', 'Ramanathapuram', 'Sivagangai', 'Tenkasi', 'Ranipet', 'Tirupattur', 'Viluppuram', 'Mayiladuthurai' ] }, { label: 'State', type: 'dropdown', options:     [ 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal' ] }, "Pincode"] },
    { title: "Address Details", fields: ["Permanent Address",{ label: 'City', type: 'dropdown', options:   [ 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Cuddalore', 'Kanchipuram', 'Nagercoil', 'Karur', 'Tiruppur', 'Virudhunagar', 'Nagapattinam', 'Sivakasi', 'Ambur', 'Rajapalayam', 'Ariyalur', 'Namakkal', 'Perambalur', 'Pudukkottai', 'Krishnagiri', 'Dharmapuri', 'Theni', 'Ramanathapuram', 'Sivagangai', 'Tenkasi', 'Ranipet', 'Tirupattur', 'Viluppuram', 'Mayiladuthurai' ] }, { label: 'State', type: 'dropdown', options:     [ 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal' ] }, "Pincode"] },
    { title: "ID Verification", description: "Collect identity proof and verify authenticity.", fields: [{ label: 'ID Type', type: 'dropdown', options: [ 'Aadhaar Card', 'Passport', 'Voter ID', 'PAN Card', 'Driving License', 'Ration Card', 'NREGA Job Card', 'Government Employee ID', 'Student ID Card', 'Senior Citizen ID', 'Bank Passbook with Photo', 'Armed Forces ID Card' ] }, "ID Number", "Upload ID Proof (PDF/Image)", "Upload Passport Size Photo"] },
    // { title: "Professional / Academic Details", fields: [{ label: 'Occupation', type: 'dropdown', options: [ 'Student', 'Working'] }, "Company / College Name", "Work / Study Address", "Upload Work/College ID (Optional)"] },
    // { title: "PG Stay Details", fields: ["Check-in Date", { label: 'Room Sharing Type', type: 'dropdown', options: ['Single', 'Double', 'Triple', 'Four (Up)', 'Four (Down)'] }, { label: 'Room Number', type: 'dropdown', options: [ '0001', '0002','0010','0020','0030','0100','0200','0300','1000','2000'] },"Bed Number", { label: 'Monthly Rent', type: 'dropdown', options: [ '24000', '12000','9000','7500','7000'] }, { label: 'Security Deposit', type: 'dropdown', options: [ '24000', '12000','9000','7500','7000'] }, "Advance Paid So For","Rent Paid So For"] },

    { title: "PG Stay Details", fields: ["Check-in Date", { label: 'Room Sharing Type', type: 'dropdown', options: ['Single', 'Double', 'Triple', 'Four (Up)', 'Four (Down)'] }, { label: 'Room Number', type: 'dropdown', options: [ '0001', '0002','0010','0020','0030','0100','0200','0300','1000','2000'] },"Bed Number",  "Advance Paid So For","Rent Paid So For"] },
    // { title: "Services & Preferences", fields: ["Food Preference (Veg / Non-Veg / None)", "Laundry Subscription (Yes/No)", "Wi-Fi Required (Yes/No)", "Locker or Parking Needed (if applicable)"] },
    { title: "Emergency Contact", fields: ["Emergency Contact Name", "Relationship", "Contact Number"] },
    // { title: "Documents Upload", fields: ["ID Proof", "Address Proof (if separate)", "College/Company ID", "Photo", "Signed Agreement / Consent Form"] },
    { title: "Review & Confirm", fields: ["Display all filled details for confirmation", "Accept terms & conditions checkbox"] }

  ];

  profileForm = new FormGroup({});


  ngOnInit(): void {
    this.generateDynamicForm();
    this.form = this.fb.group({
      productName: ['', Validators.required],
      productCode: ['', Validators.required],
      hsnCode: [''],
      salePrice: [0, [Validators.required, Validators.min(0)]]
    });

    // read query params to decide mode
    this.ar.queryParams.subscribe(params => {
      const m = params['mode'];
      const id = params['id'];
      this.mode = m === 'edit' ? 'edit' : 'add';
      if (id) {
        this.editingId = id;
        // TODO: load the product by id (call service) and patch the form
        // For now keep form empty or prefill with example
        // this.form.patchValue({ productName: 'Loaded name', productCode: 'xx', salePrice: 10 });
      }
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;
    if (this.mode === 'add') {
      // TODO: call service to create
      // navigate back to grid after creation
      this.router.navigateByUrl(this.returnUrl);
    } else {
      // TODO: call service update with this.editingId
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  back() {
    // simply navigate back to grid (or to returnUrl)
    this.router.navigateByUrl(this.returnUrl);
  }


ngAfterViewInit() {
  if (this.readonly) {
      this.profileForm.disable();
    }
  if (this.customerDatafromgrid && this.profileForm) {
    this.profileForm.patchValue(this.customerDatafromgrid);
    
  }
}





  generateDynamicForm() {
    for (const section of this.onboardingForm) {
      for (const field of section.fields) {
        const controlName = this.sanitizeControlName(field);
        if (!this.profileForm.contains(controlName)) {
          this.profileForm.addControl(controlName, new FormControl('', Validators.required));
        }
      }
    }
  }

  // sanitizeControlName(field: string): string {
  //   return field.toLowerCase().replace(/[^\w]+/g, '_');
  // }

  sanitizeControlName(field: any): string {
  const label = typeof field === 'string' ? field : field.label;
  return label.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

  // async onSubmit() {
  //   if (this.profileForm.invalid) {
  //     this.profileForm.markAllAsTouched();
  //     return;
  //   }

  //   const inputMap = this.profileForm.value;



  //   if(this.customerDatafromgrid){
  //     try {
  //       await this.updateCustomerFull(this.customerDatafromgrid.key, inputMap).toPromise();
  //     } catch (error) {
  //       console.error('HTTP Error:', error);
  //     }
  //   }
  //   else{
  //   try {
  //     const response = await this.http.post( 'https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json', inputMap, { headers: { 'Content-Type': 'application/json' } } ).toPromise();
  //   } catch (error) {
  //     console.error('HTTP Error:', error);
  //   }
  // }
  // }



async onSubmit() {
  if (this.profileForm.invalid) {
    this.profileForm.markAllAsTouched();
    return;
  }

  const inputMap = this.profileForm.value;

  if (this.customerDatafromgrid) {
    // ✅ Update existing record
    try {
      await this.updateCustomerFull(this.customerDatafromgrid.key, inputMap).toPromise();
//  this.dialogRef.close(true); 
      Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        text: 'Customer details have been updated!',
        confirmButtonColor: '#3085d6'
      });
      // this.dialogRef.close(true); 

    } catch (error) {
      console.error('HTTP Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong while updating customer!',
        confirmButtonColor: '#d33'
      });
    }
  } else {
    // ✅ Create new record
    try {
      await this.http.post(
        'https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer.json',
        inputMap,
        { headers: { 'Content-Type': 'application/json' } }
      ).toPromise();
//  this.dialogRef.close(true); 
      Swal.fire({
        icon: 'success',
        title: 'Created Successfully',
        text: 'New customer has been added!',
        confirmButtonColor: '#3085d6'
      });
      this.profileForm.reset();

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
}



  updateCustomerFull(key: string, val: object) {
  return this.http.put(
    `https://hostel-management-system-4f29a-default-rtdb.firebaseio.com/newcustomer/${key}.json`,
    val
  );
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
    customClass: {
      popup: 'swal-top'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.profileForm.reset();

      Swal.fire({
        icon: 'success',
        title: 'Form Reset',
        text: 'All fields have been cleared.',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'swal-top'
        }
      });
    }
  });
}

  goToDashboard() {
    this.router.navigate(['Landingscreen']);  
  }

  getInputType(field: string): string {
  const lower = field.toLowerCase();

 if (lower.includes('display all filled details for confirmation') || lower.includes('accept terms & conditions')) {
    return 'checkbox';
  }  
  if (lower.includes('Email ID')) return 'email';
  if (lower.includes('date')) return 'date';
  if (lower.includes('mobile') || lower.includes('number') || lower.includes('pincode')) return 'tel';
  if (lower.includes('password')) return 'password';
  if (lower.includes('amount') || lower.includes('deposit') || lower.includes('rent')) return 'number';
  if (lower.includes('upload') || lower.includes('file')) return 'file';


  return 'text';
}

}






// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';

// @Component({
//   selector: 'app-dynamic-form',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
// templateUrl: './dynamic-form.html',
//   styleUrl: './dynamic-form.css',
// })
// export class DynamicForm implements OnInit {
//   form!: FormGroup;
//   mode: 'add' | 'edit' = 'add';
//   editingId?: string;
//   returnUrl = '/home/container/dynamic-grid';

//   constructor(private fb: FormBuilder, private router: Router, private ar: ActivatedRoute) {}

//   ngOnInit(): void {
//     this.form = this.fb.group({
//       productName: ['', Validators.required],
//       productCode: ['', Validators.required],
//       hsnCode: [''],
//       salePrice: [0, [Validators.required, Validators.min(0)]]
//     });

//     // read query params to decide mode
//     this.ar.queryParams.subscribe(params => {
//       const m = params['mode'];
//       const id = params['id'];
//       this.mode = m === 'edit' ? 'edit' : 'add';
//       if (id) {
//         this.editingId = id;
//         // TODO: load the product by id (call service) and patch the form
//         // For now keep form empty or prefill with example
//         // this.form.patchValue({ productName: 'Loaded name', productCode: 'xx', salePrice: 10 });
//       }
//       if (params['returnUrl']) {
//         this.returnUrl = params['returnUrl'];
//       }
//     });
//   }

//   save() {
//     if (this.form.invalid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     const payload = this.form.value;
//     if (this.mode === 'add') {
//       // TODO: call service to create
//       // navigate back to grid after creation
//       this.router.navigateByUrl(this.returnUrl);
//     } else {
//       // TODO: call service update with this.editingId
//       this.router.navigateByUrl(this.returnUrl);
//     }
//   }

//   back() {
//     // simply navigate back to grid (or to returnUrl)
//     this.router.navigateByUrl(this.returnUrl);
//   }
// }

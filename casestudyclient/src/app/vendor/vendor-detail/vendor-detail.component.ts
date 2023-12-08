import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vendor } from '@app/vendor/vendor';
import { ValidatePhone } from '@app/validators/phone.validator';
import { ValidateEmail } from '@app/validators/email.validator'; //../../
import { ValidatePostalcode } from '@app/validators/postalcode.validator'; //../../

import { DeleteDialogComponent } from '@app/delete-dialog/delete-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';


@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.component.html',
})

export class VendorDetailComponent implements OnInit {
  
  selectedProvince!: string;
  provinces = [
    {value: "AB", viewValue: "Alberta"},
    {value: "BC", viewValue: "British Columbia"},
    {value: "NS", viewValue: "Nova Scotia"},
    {value: "NB", viewValue: "New Brunswick"},
    {value: "MB", viewValue: "Manitoba"},
    {value: "PE", viewValue: "Prince Edward Island"},
    {value: "SK", viewValue: "Saskatchewan"},
    {value: "NL", viewValue: "Newfoundland and Labrador"},
    {value: "ON", viewValue: "Ontario"},
    {value: "QU", viewValue: "Quebec"},
  ];

  selectedType!: string;
  typeValues = [
    {value: "trusted", viewValue: "Trusted"},
    {value: "untrusted", viewValue: "Untrusted"},

  ];

  @Input() selectedVendor: Vendor = {
    id: 0,
    name: '',
    address1: '',
    city: '',
    province: '',
    postalcode: '',
    phone: '',
    type: '',
    email: '',
  };
  @Input() vendors: Vendor[] | null = null;
  @Output() cancelled = new EventEmitter();
  @Output() deleted = new EventEmitter();
  @Output() saved = new EventEmitter();
  vendorForm: FormGroup;
  name: FormControl;
  address1: FormControl;
  city: FormControl;
  province: FormControl;
  postalcode: FormControl;
  phone: FormControl;
  type: FormControl;
  email: FormControl;
  constructor(private builder: FormBuilder, private dialog: MatDialog) {
    this.name = new FormControl('');
    this.address1 = new FormControl('');
    this.city = new FormControl('');
    this.province = new FormControl('');
    this.postalcode = new FormControl('', Validators.compose([Validators.required, ValidatePostalcode]));
    this.phone = new FormControl('', Validators.compose([Validators.required, ValidatePhone]));
    this.type = new FormControl('');
    this.email = new FormControl('', Validators.compose([Validators.required, ValidateEmail]));
    this.vendorForm = new FormGroup({
      name: this.name,
      address1: this.address1,
      city: this.city,
      province: this.province,
      postalcode: this.postalcode,
      phone: this.phone,
      type: this.type,
      email: this.email,
    });
  } // constructor
  ngOnInit(): void {
    // patchValue doesn’t care if all values present
    this.vendorForm.patchValue({
      name: this.selectedVendor.name,
      address1: this.selectedVendor.address1,
      city: this.selectedVendor.city,
      province: this.selectedVendor.province,
      postalcode: this.selectedVendor.postalcode,
      phone: this.selectedVendor.phone,
      type: this.selectedVendor.type,
      email: this.selectedVendor.email,
    });
    this.selectedProvince = this.selectedVendor.province;
  } // ngOnInit
  updateSelectedVendor(): void {
    this.selectedVendor.name = this.vendorForm.value.name;
    this.selectedVendor.address1 = this.vendorForm.value.address1;
    this.selectedVendor.city = this.vendorForm.value.city;
    this.selectedVendor.province = this.vendorForm.value.province;
    this.selectedVendor.postalcode = this.vendorForm.value.postalcode;
    this.selectedVendor.phone = this.vendorForm.value.phone;
    this.selectedVendor.type = this.vendorForm.value.type;
    this.selectedVendor.email = this.vendorForm.value.email;

    this.saved.emit(this.selectedVendor);
  }
  openDeleteDialog(selectedVendor: Vendor): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
    title: `Delete Vendor ${this.selectedVendor.id}`,
    entityname: 'vendor'
    };
    dialogConfig.panelClass = 'customdialog';
    const dialogRef = this.dialog.open(DeleteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    if (result) {
    this.deleted.emit(this.selectedVendor);
    }
    });
    } // openDeleteDialog
} // VendorDetailComponent

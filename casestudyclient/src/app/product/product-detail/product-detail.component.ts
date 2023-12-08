import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { ValidateDecimal } from '@app/validators/decimal.validator'; //../../
import { ValidateInt } from '@app/validators/int.validator'; //../../

import { Product } from '@app/product/product';
import { Vendor } from '@app/vendor/vendor';

import { DeleteDialogComponent } from '@app/delete-dialog/delete-dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  // Observables
  products$?: Observable<Product[]>; // for product drop down
  // setter
  @Input() selectedProduct: Product = {
    id: '', // string;
    vendorid: 0, // number;
    name: '', // string;
    costprice: 0.0, // number;
    msrp: 0.0, // number;
    rop: 0, // number;
    eoq: 0, // number;
    qoh: 0, // number;
    qoo: 0, // number;
    qrcode: '', // string;
    qrcodetxt: '', // string;
  };
  @Input() vendors: Vendor[] | null = null;
  @Input() products: Product[] | null = null;
  @Output() cancelled = new EventEmitter();
  @Output() saved = new EventEmitter();
  @Output() deleted = new EventEmitter();
  productForm: FormGroup;
  id: FormControl;
  vendorid: FormControl;
  name: FormControl;
  costprice: FormControl;
  msrp: FormControl;
  rop: FormControl;
  eoq: FormControl;
  qoh: FormControl;
  qoo: FormControl;
  qrcode: FormControl;
  qrcodetxt: FormControl;
  constructor(private builder: FormBuilder, private dialog: MatDialog) {
    this.id = new FormControl('', Validators.compose([this.uniqueCodeValidator.bind(this), Validators.required]));
    this.vendorid = new FormControl(
      '',
      Validators.compose([Validators.required])
    );
    this.name = new FormControl('', Validators.compose([Validators.required]));
    this.costprice = new FormControl(
      '',
      Validators.compose([Validators.required, ValidateDecimal/*, this.validateProperCostPrice.bind(this)*/])
    );
    this.msrp = new FormControl('', Validators.compose([Validators.required, ValidateDecimal]));
    this.rop = new FormControl('', Validators.compose([Validators.required, ValidateInt]));
    this.eoq = new FormControl('', Validators.compose([Validators.required, ValidateInt]));
    this.qoh = new FormControl('', Validators.compose([Validators.required, ValidateInt]));
    this.qoo = new FormControl('', Validators.compose([Validators.required, ValidateInt]));
    this.qrcode = new FormControl(
      '',
      Validators.compose([Validators.required])
    );
    this.qrcodetxt = new FormControl(
      '',
      Validators.compose([Validators.required])
    );
    this.productForm = this.builder.group({
      id: this.id,
      vendorid: this.vendorid,
      name: this.name,
      costprice: this.costprice,
      msrp: this.msrp,
      rop: this.rop,
      eoq: this.eoq,
      qoh: this.qoh,
      qoo: this.qoo,
      // qrcode: this?.qrcode,
      qrcodetxt: this?.qrcodetxt,
    });
    // console.log(this.productForm);
  } // constructor
  ngOnInit(): void {
    // patchValue doesn't care if all values are present
    this.productForm.patchValue({
      id: this.selectedProduct.id,
      vendorid: this.selectedProduct.vendorid,
      name: this.selectedProduct.name,
      costprice: Number(this.selectedProduct.costprice).toFixed(2),
      msrp: Number(this.selectedProduct.msrp).toFixed(2),
      rop: this.selectedProduct.rop,
      eoq: this.selectedProduct.eoq,
      qoh: this.selectedProduct.qoh,
      qoo: this.selectedProduct.qoo,
      qrcode: this.selectedProduct.qrcode,
      qrcodetxt: this.selectedProduct.qrcodetxt,
    });
  } // ngOnInit
  // ngAfterViewInit(): void {
  //   // loading products later here because timing issue with cypress testing in OnInit
  //   (this.products$ = this.productService.get()),
  //     catchError((err) => (this.msg = err.message));
  // } // ngAfterInit
  updateSelectedProduct(): void {
    this.selectedProduct.id =  this.productForm.value.id;
    
    this.selectedProduct.vendorid = this.productForm.value.vendorid;
    this.selectedProduct.name = this.productForm.value.name;
    this.selectedProduct.costprice = this.productForm.value.costprice;
    this.selectedProduct.msrp = this.productForm.value.msrp;
    this.selectedProduct.rop = this.productForm.value.rop;
    this.selectedProduct.eoq = this.productForm.value.eoq;
    this.selectedProduct.qoh = this.productForm.value.qoh;
    this.selectedProduct.qoo = this.productForm.value.qoo;
    this.selectedProduct.qrcode = this.productForm.value.qrcode;
    this.selectedProduct.qrcodetxt = this.productForm.value.qrcodetxt;
    this.saved.emit(this.selectedProduct);
  } // updateSelectedProduct

  /**
   * uniqueCodeValidator - needed access to products property so not
   * with the rest of the validators
   */
  uniqueCodeValidator(control: AbstractControl): { idExists: boolean } | null {
    if (this.products !== undefined) {
      if (
        this.products?.find(
          (p) => p.id === control.value && !this.selectedProduct.id
        ) !== undefined
      ) {
        return { idExists: true };
      }
    }
    return null; // if we make it here there are no product codes
  } // uniqueCodeValidator

  /**
   * uniqueCodeValidator - needed access to products property so not
   * with the rest of the validators
   */
   validateProperCostPrice(control: AbstractControl): { isValid: boolean } | null {
    if (this.products !== undefined) {
        return { isValid: this.selectedProduct.msrp < this.selectedProduct.costprice };
    }
    return null; // if we make it here there are no product codes
  } // uniqueCodeValidator

  openDeleteDialog(selectedProduct: Product): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
    title: `Delete Product ${this.selectedProduct.id}`,
    entityname: 'product'
    };
    dialogConfig.panelClass = 'customdialog';
    const dialogRef = this.dialog.open(DeleteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
    if (result) {
    this.deleted.emit(this.selectedProduct);
    }
    });
    } // openDeleteDialog
} // ProductDetailComponent

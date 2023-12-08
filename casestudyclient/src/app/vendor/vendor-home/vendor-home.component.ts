import { Component, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Vendor } from '../vendor';
import { VendorService } from '../vendor.service';

@Component({
  templateUrl: 'vendor-home.component.html',
})
export class VendorHomeComponent implements OnInit {
  msg: string;
  vendors$?: Observable<Vendor[]>;
  vendor: Vendor;
  hideEditForm: boolean;
  todo: string;
  initialLoad: boolean;

  constructor(public vendorService: VendorService) {
    this.vendor = {
      id: 0,
      name: '',
      address1: '',
      city: '',
      phone: '',
      postalcode: '',
      province: '',
      type: '',
      email: '',
    };
    this.msg = '';
    this.hideEditForm = true;
    this.initialLoad = true;
    this.todo = '';
  } // constructor
  // ngOnInit(): void {
  //   this.msg = 'loading vendors from server...';
  //   (this.vendors$ = this.vendorService.get().pipe(
  //     tap(() => {
  //       if (this.initialLoad) {
  //         this.msg = 'vendors loaded!';
  //         this.initialLoad = false;
  //       }
  //     })
  //   )),
  //     catchError((err) => (this.msg = err.message));
  // } // ngOnInit
  ngOnInit(): void {
    (this.vendors$ = this.vendorService.get()),
      catchError((err) => (this.msg = err.message));
  } // ngOnInit

  select(vendor: Vendor): void {
    this.todo = 'update';
    this.vendor = vendor;
    this.msg = `${vendor.name} selected`;
    this.hideEditForm = !this.hideEditForm;
  } // select
  /**
   * cancelled - event handler for cancel button
   */
  cancel(msg?: string): void {
    msg ? (this.msg = 'Operation cancelled') : null;
    this.hideEditForm = !this.hideEditForm;
  } // cancel
  /**
   * update - send changed update to service
   */
  update(vendor: Vendor): void {
    this.vendorService.update(vendor).subscribe({
      // Create observer object
      next: (ven: Vendor) => (this.msg = `Vendor ${ven.id} updated!`),
      error: (err: Error) => (this.msg = `Update failed! - ${err.message}`),
      complete: () => (this.hideEditForm = !this.hideEditForm),
    });
  } // update

  /**
   * save - determine whether we're doing and add or an update
   */
  save(vendor: Vendor): void {
    vendor.id ? this.update(vendor) : this.add(vendor);
  } // save
  /**
   * add - send vendor to service, receive new vendor back
   */
  add(vendor: Vendor): void {
    vendor.id = 0;
    this.vendorService.add(vendor).subscribe({
      // Create observer object
      next: (vend: Vendor) => {
        this.msg = `Vendor ${vend.id} added!`;
      },
      error: (err: Error) => (this.msg = `Vendor not added! - ${err.message}`),
      complete: () => (this.hideEditForm = !this.hideEditForm),
    });
  } // add
  /**
   * delete - send vendor id to service for deletion
   */
  delete(vendor: Vendor): void {
    this.vendorService.delete(vendor.id).subscribe({
      // Create observer object
      next: (numOfVendorsDeleted: number) => {
        numOfVendorsDeleted === 1
          ? (this.msg = `Vendor ${vendor.name} deleted!`)
          : (this.msg = `Vendor not deleted`);
      },
      error: (err: Error) => (this.msg = `Delete failed! - ${err.message}`),
      complete: () => (this.hideEditForm = !this.hideEditForm),
    });
  } // delete
  /**
   * newVendor - create new vendor instance
   */
  newVendor(): void {
    this.vendor = {
      id: 0,
      name: '',
      address1: '',
      city: '',
      phone: '',
      postalcode: '',
      province: '',
      type: '',
      email: '',
    };
    this.hideEditForm = !this.hideEditForm;
  } // newEmployee
} // VendorHomeComponent

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Vendor } from '@app/vendor/vendor';
import { Product } from '@app/product/product';
import { PurchaseOrderLineitem } from '@app/report/po-lineitem';
import { PurchaseOrder } from '@app/report/purchaseorder';
import { VendorService } from '@app/vendor/vendor.service';
import { ProductService } from '@app/product/product.service';
import { PurchaseOrderService } from '@app/report/purchaseorder.service';
import { PDFURL } from '@app/constants';

@Component({
  templateUrl: 'viewer.component.html',
})
export class ViewerComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup; /** @todo Change to viewerform */
  vendorid: FormControl;
  reportid: FormControl;
  quantity: FormControl;
  // data
  formSubscription?: Subscription;
  products$?: Observable<Product[]>; // everybody's products
  vendors$?: Observable<Vendor[]>; // all vendors
  // vendorproducts$?: Observable<Product[]>; // all products for a particular vendor
  vendorproducts?: Product[]; // all products for a particular vendor
  pos$?: Observable<PurchaseOrder[]>;
  productQtys$?: Observable<string[]>; // all products values
  productQtys?: Array<string>; // Product's EOQ
  items: Array<PurchaseOrderLineitem> = []; // product items that will be in report
  selectedproducts: Product[]; // products that being displayed currently in app
  selectedQty: number; // the current selected product
  selectedProduct: Product; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
  poProducts?: Product[];
  selectedPO: PurchaseOrder; // the current selected PO
  poItems:Array<{name:string,qty:number,costprice:number}>;
  // misc
  pickedQty: boolean;
  pickedProduct: boolean;
  pickedVendor: boolean;
  generated: boolean;
  hasProducts: boolean;
  msg: string;
  subtotal: number;
  tax: number;
  total: number;
  reportno: number = 0;
  constructor(
    private builder: FormBuilder,
    private vendorService: VendorService,
    private productService: ProductService,
    private poService: PurchaseOrderService
  ) {
    this.pickedVendor = false;
    this.pickedProduct = false;
    this.pickedQty = false;
    this.generated = false;
    this.msg = '';
    this.vendorid = new FormControl('');
    this.reportid = new FormControl('');
    this.quantity = new FormControl('');
    this.generatorForm = this.builder.group({
      reportid: this.reportid,
      vendorid: this.vendorid,
      quantity: this.quantity,
    });
    this.selectedProduct = {
      id: '',
      vendorid: 0, // number;
      name: '', // string;
      costprice: 0.00, // number;
      msrp: 0.00, // number;
      rop: 0, // number;
      eoq: 0, // number;
      qoh: 0, // number;
      qoo: 0, // number;
      qrcode: '', // string;
      qrcodetxt: '', // string;
    };
    this.selectedVendor = {
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
    this.selectedPO = {
      id: 0,
      vendorid:0,
      amount: 0,
      items: [],
      podate:''
    };
    this.selectedQty = 0;
    this.items = new Array<PurchaseOrderLineitem>();
    this.productQtys = new Array<string>();
    this.selectedproducts = new Array<Product>();
    this.hasProducts = false;
    this.subtotal = 0.00;
    this.tax = 0.00;
    this.total = 0.00;
    this.poItems = [];
  } // constructor
  ngOnInit(): void {
    this.onPickVendor();
    this.onPickProduct();
    this.msg = 'loading vendors and products from server...';
    (this.vendors$ = this.vendorService.get()),
      catchError((err) => (this.msg = err.message));
    (this.products$ = this.productService.get()),
      catchError((err) => (this.msg = err.message));
    // (this.productQtys$ = this.productService.get()),
    // catchError((err) => (this.msg = err.message));
    this.msg = 'server data loaded';
  } // ngOnInit
  ngOnDestroy(): void {
    if (this.formSubscription !== undefined) {
      this.formSubscription.unsubscribe();
    }
  } // ngOnDestroy
  /**
   * onPickVendor - Another way to use Observables, subscribe to the select change event
   * then load specific vendor products for subsequent selection
   */
  onPickVendor(): void {
    this.formSubscription = this.generatorForm
      .get('vendorid')
      ?.valueChanges.subscribe((val) => {
        this.generatorForm.get('reportid')?.reset();
        this.generatorForm.get('quantity')?.reset();
        this.selectedProduct = {
          id: '',
          vendorid: 0, // number;
          name: '', // string;
          costprice: 0.00, // number;
          msrp: 0.00, // number;
          rop: 0, // number;
          eoq: 0, // number;
          qoh: 0, // number;
          qoo: 0, // number;
          qrcode: '', // string;
          qrcodetxt: '', // string;
        };
        this.selectedVendor = val;
        this.loadVendorProducts(this.selectedVendor.id);
        this.loadVendorPOs(this.selectedVendor.id);
        this.pickedProduct = false;
        this.pickedQty = false;
        this.hasProducts = false;
        this.msg = 'choose product for vendor';
        this.pickedVendor = true;
        this.generated = false;
        this.items = []; // array for the report
        this.selectedproducts = []; // array for the details in app html
      });
  } // onPickVendor
  /**
   * onPickProduct - subscribe to the select change event then
   * update array containing items.
   */
  onPickProduct(): void {
    const productSubscription = this.generatorForm
      .get('reportid')
      ?.valueChanges.subscribe((val) => {
        this.selectedPO = val;

        if (this.vendorproducts !== undefined) {
          /** @Crash_Warning '?' may cause crash */
          this.poProducts = this.vendorproducts?.filter((prod) =>
            this.selectedPO?.items.some((item) => item.productid === prod.id)
          );
          
          /** @Crash_Warning May crash if vendor has NO PRODUCTS */
          Object.values(this.selectedPO.items)?.forEach((v) => {
            const _name = this.vendorproducts?.filter((prod) =>v.productid===prod.id)[0].name ?? "";
            this.poItems?.push({name:_name,qty:v.qty, costprice:v.price});
          });
          this.reportno = val.id;
        }
        if (this.poItems?.length !== undefined && this.poItems.length > 0) {
          this.subtotal = 0.0;
          this.tax = 0.0;
          this.total = 0.0;
  
          this.poItems?.forEach((prod) => (this.subtotal += prod.costprice * prod.qty));

          this.tax = this.subtotal * 0.13;
          this.total = this.subtotal + this.tax;
          this.hasProducts = true;
        }
        

        this.pickedProduct= true;
        this.loadProductQty();
      });
    this.formSubscription?.add(productSubscription); // add it as a child, so all can be destroyed together
    

  } // onPickProduct
  
  /**
   * loadProductQty - filter for a particular vendor's products
   */
   loadProductQty(): void {
    
    
  } // loadVendorProducts
  loadVendorPOs(id: number): void {
    this.msg = 'loading POs...';
    this.pos$ = this.poService.getSome(id);
  }
  loadVendorProducts(id: number): void {
    // expenses aren't part of the page, so we don't use async pipe here
    this.msg = 'loading products...';
    this.productService
      .getSome(id)
      .subscribe((products) => (this.vendorproducts = products));
  }
  

  viewPdf(): void {
    window.open(`${PDFURL}${this.reportno}`, '');
  } // viewPdf
} // GeneratorComponent

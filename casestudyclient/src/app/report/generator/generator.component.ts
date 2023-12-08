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
  templateUrl: 'generator.component.html',
})
export class GeneratorComponent implements OnInit, OnDestroy {
  // form
  generatorForm: FormGroup;
  vendorid: FormControl;
  productid: FormControl;
  quantity: FormControl;
  // data
  formSubscription?: Subscription;
  products$?: Observable<Product[]>; // everybody's products
  vendors$?: Observable<Vendor[]>; // all vendors
  vendorproducts$?: Observable<Product[]>; // all products for a particular vendor
  productQtys$?: Observable<string[]>; // all products values
  productQtys?: Array<string>; // Product's EOQ
  items: Array<PurchaseOrderLineitem> = []; // product items that will be in report
  selectedproducts: Product[]; // products that being displayed currently in app
  selectedQty: number; // the current selected product
  selectedProduct: Product; // the current selected product
  selectedVendor: Vendor; // the current selected vendor
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
    this.productid = new FormControl('');
    this.quantity = new FormControl('');
    this.generatorForm = this.builder.group({
      productid: this.productid,
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
    this.selectedQty = 0;
    this.items = new Array<PurchaseOrderLineitem>();
    this.productQtys = new Array<string>();
    this.selectedproducts = new Array<Product>();
    this.hasProducts = false;
    this.subtotal = 0.00;
    this.tax = 0.00;
    this.total = 0.00;
  } // constructor
  ngOnInit(): void {
    this.onPickVendor();
    this.onPickProduct();
    this.onPickProductQty();
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
        this.generatorForm.get('productid')?.reset();
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
        this.loadVendorProducts();
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
      .get('productid')
      ?.valueChanges.subscribe((val) => {
        // this.generatorForm.get('quantity')?.reset();
        // this.generatorForm.get('quantity')?.setValue(-1);
        this.selectedProduct = val;
        const item: PurchaseOrderLineitem = {
          id: this.items.length,//this.items.findIndex((item) => item.productid === this.selectedProduct?.id),
          poid: this.reportno,
          productid: this.selectedProduct?.id,
          qty:0,
          price:this.selectedProduct?.costprice,
        };
        if (
          this.items.find((item) => item.productid === this.selectedProduct?.id)
        ) {
          // ignore entry
        } else {
          // add entry
          this.items.push(item);
          this.selectedproducts.push(this.selectedProduct);
        }
        if (this.items.length > 0) {
          this.hasProducts = true;
        }
        
        // this.subtotal = 0.0;
        // this.tax = 0.0;
        // this.total = 0.0;
        // this.selectedproducts.forEach((prod) => (this.subtotal += prod.costprice));
        // this.tax = this.subtotal * 0.13;
        // this.total = this.subtotal + this.tax;
        this.pickedProduct= true;
        this.loadProductQty();
      });
    this.formSubscription?.add(productSubscription); // add it as a child, so all can be destroyed together
    

  } // onPickProduct
  /**
   * onPickProductQty - subscribe to the select change event then
   * update array containing items.
   */
   onPickProductQty(): void {
    const qtySubscription = this.generatorForm
      .get('quantity')
      ?.valueChanges.subscribe((val) => {
        // console.log("Val > ",val);
        // console.log(this.items.find((item) => item.productid === this.selectedProduct?.id))
        this.selectedQty = val;

      
        if (
          this.items.find((item) => item.productid === this.selectedProduct?.id)
        ) {
          // ignore entry
        } else {
          // add entry
          const item: PurchaseOrderLineitem = {
            id: this.items.length,
            poid: this.reportno,
            productid: this.selectedProduct?.id,
            qty:0,
            price:this.selectedProduct?.costprice,
          };

          this.items.push(item);
          this.selectedproducts.push(this.selectedProduct);
        }

        if(this.selectedQty==0) {
          // console.log("remove item");
          // console.log("items before > ",this.items)
          this.items = this.items.filter(i => i.productid!== this.selectedProduct?.id);
          // console.log("items after > ",this.items)
        }
        else {
          this.items[this.items.findIndex((item) => item.productid === this.selectedProduct?.id)].qty = val === "EOQ" ? parseInt(`${this.selectedProduct.eoq}`) : parseInt(`${val}`);
          this.items[this.items.findIndex((item) => item.productid === this.selectedProduct?.id)].price =this.selectedProduct?.costprice;
        }

        this.pickedQty = this.items.length!==0 ? true : false;

        // console.log("tmpItem > ",tmpItem);

        
        this.subtotal = 0.0;
        this.tax = 0.0;
        this.total = 0.0;
        // this.selectedproducts.forEach((prod) => (this.subtotal += prod.costprice * this.items[this.items.findIndex((item) => item.productid === this.selectedProduct?.id)].quantity));
        this.items.forEach((prod) => (this.subtotal += prod.price * prod.qty));
        this.tax = this.subtotal * 0.13;
        this.total = this.subtotal + this.tax;
        

      });
    this.formSubscription?.add(qtySubscription); // add it as a child, so all can be destroyed together
  } // onPickProductQty
  /**
   * loadProductQty - filter for a particular vendor's products
   */
   loadProductQty(): void {
    // this.productQtys$ = this.products$?.pipe(
    //   map((products) =>
    //     // map each product in the array and check whether or not it belongs to selected vendor
    //     products.filter(
    //       (product) => product.vendorid === this.selectedVendor?.id
    //     ).forEach(p => p.qoh + p.qoo)
    //   )
    // );

    let qtyVal: number=0; let qtyVals: string[]=[];
    this.vendorproducts$?.forEach(v => {
        const res = v.find(prod => prod.id === this.items.find((item) => item.productid === this.selectedProduct?.id)?.productid);
        if(res) {
          qtyVal = (res.qoh + res.qoo);

          if(qtyVal!==0) { 
            qtyVals.push("EOQ"); 
            qtyVals.push("0"); 
            for (let i = 1; i <= qtyVal; i++) {
              qtyVals.push(`${i}`);
            }
          }
          else {qtyVals.push("Out of Stock");}

          this.productQtys$ = of(qtyVals);

          return res.qoh + res.qoo;
        } else {
          return 0;
        }
    });
    
    

    // this.productQtys$ = qtyVals;

    
    
  } // loadVendorProducts
  /**
   * loadVendorProducts - filter for a particular vendor's products
   */
  loadVendorProducts(): void {
    this.vendorproducts$ = this.products$?.pipe(
      map((products) =>
        // map each product in the array and check whether or not it belongs to selected vendor
        products.filter(
          (product) => product.vendorid === this.selectedVendor?.id
        )
      )
    );
  } // loadVendorProducts
  /**
   * createReport - create the client side report
   */
  createReport(): void {
    this.generated = false;
    const report: PurchaseOrder = {
      id: 0,
      items: this.items,
      vendorid: this.selectedProduct.vendorid,
      amount: this.total,
    };
    // console.log(report);
    this.poService.add(report).subscribe({
      // observer object
      next: (report: PurchaseOrder) => {
        // server should be returning report with new id
        report.id > 0
          ? (this.msg = `Purchase Order ${report.id} added!`)
          : (this.msg = 'Purchase Order not added! - server error');
        this.reportno = report.id;
      },
      error: (err: Error) => (this.msg = `Report not added! - ${err.message}`),
      complete: () => {
        this.hasProducts = false;
        this.pickedVendor = false;
        this.pickedQty = false;
        this.pickedProduct = false;
        this.generated = true;
      },
    });
  } // createReport

  viewPdf(): void {
    window.open(`${PDFURL}${this.reportno}`, '');
  } // viewPdf
} // GeneratorComponent

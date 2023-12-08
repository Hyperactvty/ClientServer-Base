import { PurchaseOrderLineitem } from './po-lineitem';
/**
* Report - interface for expense report
*/
export interface PurchaseOrder {
 id: number;
 vendorid: number;
 amount: number;
 items: PurchaseOrderLineitem[];
 podate?:string;
}
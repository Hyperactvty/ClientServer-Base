package com.info5059.casestudy.product;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

import javax.persistence.Basic;
import javax.persistence.Entity;
// import javax.persistence.GeneratedValue;
// import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;

@Entity
@Data
@RequiredArgsConstructor
public class Product {
  @Id
  // @GeneratedValue(strategy = GenerationType.IDENTITY)
  private String id; // Manditory Requirment
  private int vendorid;
  private String name;
  private BigDecimal costprice; // is what we purchase the good for, make sure it is lower than MSRP
  private BigDecimal msrp; // this is the selling price must be lower than cost price
  private int rop; // is the Reorder Point, when stock falls to this # we re-order the good
  private int eoq; /*
                    * is the Economic Order Quantity this is a value calculated by some bean
                    * counter who has figured out that it makes most economic sense to order this
                    * amount. This value will be smaller for say a fridge than it would for a good
                    * like a
                    * thumb tack
                    */
  private int qoh; // Quantity on Hand, what we have in inventory
  private int qoo; // Quantity on Order. what we have ordered but not received
  @Basic(optional=true)
  @Lob
  private byte[] qrcode; // For Case 2
  @Basic(optional=true)
  private String qrcodetxt; // For Case 2
}
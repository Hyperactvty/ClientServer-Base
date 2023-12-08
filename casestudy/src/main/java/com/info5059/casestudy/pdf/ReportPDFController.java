package com.info5059.casestudy.pdf;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.info5059.casestudy.product.ProductRepository;
import com.info5059.casestudy.purchase.PurchaseOrderPDFGenerator;
import com.info5059.casestudy.purchase.PurchaseOrderRepository;
import com.info5059.casestudy.vendor.VendorRepository;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

// @CrossOrigin
@RestController
public class ReportPDFController {
  @Autowired
  private VendorRepository vendorRepository;
  @Autowired
  private ProductRepository productRepository;
  @Autowired
  private PurchaseOrderRepository poRepository;
 

  @RequestMapping(value = "/PurchaseOrderPDF", method = RequestMethod.GET, produces = MediaType.APPLICATION_PDF_VALUE)
  public ResponseEntity<InputStreamResource> streamPDF(HttpServletRequest request) throws IOException {
    String repid = request.getParameter("repid");
    // get formatted pdf as a stream
    ByteArrayInputStream bis = PurchaseOrderPDFGenerator.generatePurchaseOrder(repid,
    poRepository,
      vendorRepository,
      productRepository);
    HttpHeaders headers = new HttpHeaders();
    headers.add("Content-Disposition", "inline; filename=report.pdf");
    // dump stream to browser
    return ResponseEntity
        .ok()
        .headers(headers)
        .contentType(MediaType.APPLICATION_PDF)
        .body(new InputStreamResource(bis));
  }
}
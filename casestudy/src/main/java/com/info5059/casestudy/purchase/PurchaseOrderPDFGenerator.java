package com.info5059.casestudy.purchase;

import com.info5059.casestudy.vendor.Vendor;
import com.info5059.casestudy.vendor.VendorRepository;
import com.info5059.casestudy.purchase.PurchaseOrder;
import com.info5059.casestudy.product.Product;
import com.info5059.casestudy.product.ProductRepository;
import com.info5059.casestudy.product.QRCodeGenerator;
import com.info5059.casestudy.purchase.PurchaseOrderRepository;
import com.info5059.casestudy.pdf.Generator;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.web.servlet.view.document.AbstractPdfView;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.net.URL;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * PurchaseOrderPDFGenerator - a class for creating dynamic purchase po output
 * in
 * PDF format using the iText 7 library
 *
 * @author Evan
 */
public abstract class PurchaseOrderPDFGenerator extends AbstractPdfView {
  public static ByteArrayInputStream generatePurchaseOrder(String repid,
      PurchaseOrderRepository poRepository,
      VendorRepository vendorRepository,
      ProductRepository productRepository)
      throws IOException {
    URL imageUrl = Generator.class.getResource("/static/images/logo.png");
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    try {
      PdfWriter writer = new PdfWriter(baos);
      // Initialize PDF document to be written to a stream not a file
      PdfDocument pdf = new PdfDocument(writer);
      // Document is the main object
      Document document = new Document(pdf);
      PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
      // add the image to the document
      PageSize pg = PageSize.A4;
      Image img = new Image(ImageDataFactory.create(imageUrl)).scaleAbsolute(250/2, 155/2)
          .setFixedPosition(pg.getWidth() / 2 - 125/2, 750);
      document.add(img);
      Vendor ven = new Vendor();
      PurchaseOrder po = new PurchaseOrder();

      // PurchaseOrder poDate;
      // now let's add a big heading
      document.add(new Paragraph("\n\n"));
      Locale locale = new Locale("en", "US");
      NumberFormat formatter = NumberFormat.getCurrencyInstance(locale);

      document.add(new Paragraph("\n"));
      // System.out.print("ID: ");
      // System.out.println(repid);
      
      Optional<PurchaseOrder> optPurchaseOrder = poRepository.findById(Long.parseLong(repid));
      // Optional<PurchaseOrder> optPurchaseOrder = poRepository.findById(repid);
      if (optPurchaseOrder.isPresent()) {
        /*PurchaseOrder */po = optPurchaseOrder.get();

        document.add(new Paragraph("PurchaseOrder# " + repid).setFont(font).setFontSize(18).setBold()
            .setMarginTop(-10)
            .setWidth(pg.getWidth())
            .setTextAlignment(TextAlignment.CENTER)
            );
        document.add(new Paragraph("\n\n"));

        Optional<Vendor> optVendor = vendorRepository.findById(po.getVendorid());
        if (optVendor.isPresent()) {
          // dump out vendor details
          /*Vendor */ven = optVendor.get();
          Table table_Vendor = new Table(2);
          table_Vendor.setWidth(new UnitValue(UnitValue.PERCENT, 25));
          // table_Vendor.setStrokeColor(ColorConstants.WHITE);
          // table_Vendor.setBorder(Border.NO_BORDER);

          // Unfortunately we must format each cell individually :(
          // table headings
          Cell cell = new Cell().add(new Paragraph("Vendor:")
              .setFont(font)
              .setFontSize(12)
              .setTextAlignment(TextAlignment.RIGHT).setBold()).setBorder(Border.NO_BORDER);
          table_Vendor.addCell(cell);

          String[] displayInfoStrings = new String[] {ven.getName(), ven.getAddress1(), ven.getCity(), ven.getProvince(), ven.getEmail()};
          for (String _v : displayInfoStrings) {
            cell = new Cell(/*1,_v!=ven.getName() ? 3: 1*/).add(new Paragraph(_v)
              .setFont(font)
              .setFontSize(12)
              .setTextAlignment(TextAlignment.LEFT).setBold()
              .setBackgroundColor(ColorConstants.LIGHT_GRAY)).setBorder(Border.NO_BORDER);
            table_Vendor.addCell(cell);
            table_Vendor.addCell(new Cell().setBorder(Border.NO_BORDER));
          }

          document.add(table_Vendor);
        }

        document.add(new Paragraph("\n\n"));
        // Image qrcode = addSummaryQRCode(ven, po);

        // dump out product titles
        BigDecimal subtot = new BigDecimal(0.0);
        BigDecimal tax = new BigDecimal(0.0);
        BigDecimal tot = new BigDecimal(0.0);
        Table table_Product = new Table(5);
        table_Product.setWidth(new UnitValue(UnitValue.PERCENT, 100));
        // Unfortunately we must format each cell individually :(
        // table headings
        Cell cell = new Cell().add(new Paragraph("Product Code")
            .setFont(font)
            .setFontSize(12)
            .setBold())
            .setTextAlignment(TextAlignment.CENTER);
        table_Product.addCell(cell);
        cell = new Cell().add(new Paragraph("Description")
            .setFont(font)
            .setFontSize(12)
            .setBold())
            .setTextAlignment(TextAlignment.CENTER);
        table_Product.addCell(cell);
        cell = new Cell().add(new Paragraph("Qty Sold")
            .setFont(font)
            .setFontSize(12)
            .setBold())
            .setTextAlignment(TextAlignment.CENTER);
        table_Product.addCell(cell);
        cell = new Cell().add(new Paragraph("Price")
            .setFont(font)
            .setFontSize(12)
            .setBold())
            .setTextAlignment(TextAlignment.CENTER);
        table_Product.addCell(cell);
        cell = new Cell().add(new Paragraph("Ext. Price")
            .setFont(font)
            .setFontSize(12)
            .setBold())
            .setTextAlignment(TextAlignment.CENTER);
        table_Product.addCell(cell);
        
        // dump out the line items
        for (PurchaseOrderLineitem line : po.getItems()) {
          // System.out.println("Found?");
          // System.out.println(line);
          // System.out.println(productRepository.findById(line.getProductid()));
          Optional<Product> optx = productRepository.findById(line.getProductid());
          if (optx.isPresent()) {
            Product prod = optx.get();

            cell = new Cell().add(new Paragraph(String.valueOf(line.getProductid()))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER));
            table_Product.addCell(cell);
            cell = new Cell().add(new Paragraph(String.valueOf(prod.getName()))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER));
            table_Product.addCell(cell);
            cell = new Cell().add(new Paragraph(String.valueOf(line.getQty()))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT));
            table_Product.addCell(cell);
            // System.out.println(NumberFormat.getCurrencyInstance().format(line.getPrice()));

            cell = new Cell().add(new Paragraph(NumberFormat.getCurrencyInstance().format(line.getPrice()).toString().replace('¤', '$'))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT));
            table_Product.addCell(cell);
            // System.out.println(NumberFormat.getCurrencyInstance().format(line.getPrice().multiply(BigDecimal.valueOf(line.getQty()))));

            cell = new Cell().add(new Paragraph(NumberFormat.getCurrencyInstance().format(line.getPrice().multiply(BigDecimal.valueOf(line.getQty()))).toString().replace('¤', '$'))
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT));
            table_Product.addCell(cell);
            subtot = subtot.add(line.getPrice().multiply(BigDecimal.valueOf(line.getQty())), new MathContext(8, RoundingMode.UP));            
          }
          tax = subtot.multiply(BigDecimal.valueOf(0.13));
          tot = subtot.add(tax);

        }

        Map<String,BigDecimal> totalsMap=new HashMap<String,BigDecimal>();  
        totalsMap.put("Sub Total:",subtot);
        totalsMap.put("Tax:",tax);
        totalsMap.put("Total:",tot);

        // System.out.println("Sub Total?"+subtot);
        // System.out.println("Tax?"+tax);
        // System.out.println("Total? "+tot);
        
        // po total
        for(Map.Entry m:totalsMap.entrySet()){  
          cell = new Cell(1, 4).add(new Paragraph((String) m.getKey())
              .setFont(font)
              .setFontSize(12)
              .setBold()
              .setTextAlignment(TextAlignment.RIGHT)).setBorder(Border.NO_BORDER);
          table_Product.addCell(cell);
          cell = new Cell().add(new Paragraph(formatter.format(m.getValue()))
              .setFont(font)
              .setFontSize(12)
              .setBold()
              .setTextAlignment(TextAlignment.RIGHT)
              .setBackgroundColor((String) m.getKey()=="Total:" ? ColorConstants.YELLOW: null));
          table_Product.addCell(cell);
         } 
        
        
        // cell = new Cell(1, 3).add(new Paragraph("Sub Total:")
        //     .setFont(font)
        //     .setFontSize(12)
        //     .setBold()
        //     .setTextAlignment(TextAlignment.RIGHT)).setBorder(Border.NO_BORDER);
        // table_Product.addCell(cell);
        // cell = new Cell().add(new Paragraph(formatter.format(tot))
        //     .setFont(font)
        //     .setFontSize(12)
        //     .setBold()
        //     .setTextAlignment(TextAlignment.RIGHT)
        //     .setBackgroundColor(ColorConstants.YELLOW));
        // table_Product.addCell(cell);

        document.add(table_Product);
        document.add(new Paragraph("\n\n"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd h:mm a");
        // document.add(new Paragraph(dateFormatter.format(LocalDateTime.now()))
        document.add(new Paragraph(dateFormatter.format(po.getPodate()))
            .setTextAlignment(TextAlignment.CENTER));
      }
      // document.add(new Paragraph("\n\n"));
      // DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd h:mm a");
      // // document.add(new Paragraph(dateFormatter.format(LocalDateTime.now()))
      // document.add(new Paragraph(dateFormatter.format(po.getPodate()))
      //     .setTextAlignment(TextAlignment.CENTER));

      Image qrcode = addSummaryQRCode(ven, po);
      // qrcode = new Image(ImageDataFactory.create(qrcodebin)).scaleAbsolute(100, 100).setFixedPosition(460,60);
      document.add(qrcode);

      document.close();
    } catch (Exception ex) {
      Logger.getLogger(Generator.class.getName()).log(Level.SEVERE, null, ex);
    }
    // finally send stream back to the controller
    return new ByteArrayInputStream(baos.toByteArray());
  }

  private static Image addSummaryQRCode(Vendor ven, PurchaseOrder po) {
    DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd h:mm a");
    
    byte[] qrcodebin = QRCodeGenerator.generateQRCode("Summary for Purchase Order:" + po.getId() + "\nDate:"
      + dateFormatter.format(po.getPodate()) + "\nVendor:"
      + ven.getName()
      + "\nTotal:" + NumberFormat.getCurrencyInstance(new Locale("en", "US")).format(po.getAmount()));

    return new Image(ImageDataFactory.create(qrcodebin)).scaleAbsolute(100, 100).setFixedPosition(460,60);//QRCodeGenerator.generateQRCode(qrcodebin);
  }
}

package com.info5059.casestudy.product;

import com.google.zxing.*;
import com.google.zxing.client.j2se.*;
import com.google.zxing.common.BitMatrix;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import java.io.ByteArrayOutputStream;

@Component
public class QRCodeGenerator {
  /** @note Changed from non-static to static for the QR code generator for lab 18 */
  public static byte[] generateQRCode(String text) {
    byte[] qrcode = null;
    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      BitMatrix matrix = new MultiFormatWriter().encode(text, BarcodeFormat.QR_CODE, 200, 200);
      MatrixToImageWriter.writeToStream(matrix, MediaType.IMAGE_PNG.getSubtype(), baos, new MatrixToImageConfig());
      qrcode = baos.toByteArray();
    } catch (Exception ex) {
      System.out.println("QRcode failed " + ex.getMessage());
    }
    return qrcode;
  }
}

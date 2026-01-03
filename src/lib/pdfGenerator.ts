import jsPDF from "jspdf";

export interface PDFOptions {
  documentType: "Letter of Recommendation" | "Letter of Termination";
  bodyText: string;
  signatoryName: string;
  signatoryTitle: string;
}

export async function generatePDF(options: PDFOptions): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Add header image
  try {
    // Try to load the header image from /public/header.png or /public/header.jpg
    let imageResponse = await fetch("/header.png");
    let imageType = "PNG";
    
    if (!imageResponse.ok) {
      // Try JPG if PNG not found
      imageResponse = await fetch("/header.jpg");
      imageType = "JPEG";
    }
    
    if (imageResponse.ok) {
      const imageBlob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      // Get image dimensions to maintain aspect ratio
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Calculate dimensions to fit header area while maintaining aspect ratio
      const maxHeaderHeight = 40; // Maximum header height in mm
      const maxHeaderWidth = contentWidth; // Maximum header width
      
      let headerWidth = img.width;
      let headerHeight = img.height;
      
      // Scale to fit within max dimensions while maintaining aspect ratio
      const widthRatio = maxHeaderWidth / headerWidth;
      const heightRatio = maxHeaderHeight / headerHeight;
      const scale = Math.min(widthRatio, heightRatio);
      
      headerWidth = headerWidth * scale;
      headerHeight = headerHeight * scale;
      
      // Center the image
      const imageX = margin + (contentWidth - headerWidth) / 2;
      
      doc.addImage(imageUrl, imageType, imageX, margin, headerWidth, headerHeight);
      URL.revokeObjectURL(imageUrl);
    } else {
      // Fallback: create a placeholder rectangle if image not found
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, margin, contentWidth, 30, "F");
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Header Image (add header.png to public folder)", margin + contentWidth / 2, margin + 15, {
        align: "center",
      });
    }
  } catch (error) {
    console.error("Error loading header image:", error);
    // Fallback placeholder
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, margin, contentWidth, 30, "F");
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Header Image (add header.png to public folder)", margin + contentWidth / 2, margin + 15, {
      align: "center",
    });
  }

  // Add document type title
  let yPosition = margin + 40;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text(options.documentType, margin + contentWidth / 2, yPosition, {
    align: "center",
  });

  // Add body text
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  const bodyLines = doc.splitTextToSize(options.bodyText, contentWidth);
  
  // Calculate where body text ends
  let currentY = yPosition;
  for (let i = 0; i < bodyLines.length; i++) {
    if (currentY > pageHeight - margin - 60) {
      // Add new page if needed
      doc.addPage();
      currentY = margin + 20;
    }
    doc.text(bodyLines[i], margin, currentY);
    currentY += 6; // Line height
  }

  // Add spacing before signature area
  const signatureAreaStart = Math.max(currentY + 20, pageHeight - margin - 50);
  
  // Add signature line (dotted line for DocuSign)
  const signatureY = signatureAreaStart;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  // Draw signature line (80mm wide)
  const signatureLineWidth = 80;
  const signatureLineX = margin;
  for (let i = 0; i < signatureLineWidth; i += 2) {
    doc.line(signatureLineX + i, signatureY, signatureLineX + i + 1, signatureY);
  }

  // Add signatory information below signature line
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text(options.signatoryName, margin, signatureY + 8);
  doc.text(options.signatoryTitle, margin, signatureY + 15);

  // Generate PDF blob
  const pdfBlob = doc.output("blob");
  return pdfBlob;
}


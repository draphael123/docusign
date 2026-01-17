import jsPDF from "jspdf";

// PDF Generator - No footer version
export interface PDFOptions {
  documentType: string;
  bodyText: string;
  signatoryName: string;
  signatoryTitle: string;
  signatoryCompany?: string;
  signatoryPhone?: string;
  signatoryEmail?: string;
  recipientName?: string;
  recipientTitle?: string;
  recipientAddress?: string;
  subject?: string;
  fontSize?: number;
  lineSpacing?: number;
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
      
      // Calculate dimensions to fill entire page width while maintaining aspect ratio
      const fullPageWidth = pageWidth; // Full page width (no margins)
      
      let headerWidth = img.width;
      let headerHeight = img.height;
      
      // Scale to fill entire page width while maintaining aspect ratio
      const scale = fullPageWidth / headerWidth;
      
      headerWidth = headerWidth * scale;
      headerHeight = headerHeight * scale;
      
      // Position at top-left corner (no margin)
      const imageX = 0;
      const imageY = 0;
      
      // Add full template image
      doc.addImage(imageUrl, imageType, imageX, imageY, headerWidth, headerHeight);
      
      // Cover the footer area with white rectangle to hide footer text
      // Footer is in bottom ~15% of the template image
      const footerCoverY = pageHeight - 35; // Start covering 35mm from bottom
      doc.setFillColor(249, 249, 249); // Match template background color
      doc.rect(0, footerCoverY, pageWidth, 35, "F"); // Fill rectangle to cover footer
      
      URL.revokeObjectURL(imageUrl);
    } else {
      // Fallback: create a placeholder rectangle if image not found (full page width)
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Header Image (add header.png to public folder)", pageWidth / 2, 20, {
        align: "center",
      });
    }
  } catch (error) {
    console.error("Error loading header image:", error);
    // Fallback placeholder (full page width)
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, pageWidth, 40, "F");
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Header Image (add header.png to public folder)", pageWidth / 2, 20, {
      align: "center",
    });
  }

  // Calculate starting position after header
  const headerHeight = 40; // Approximate header height
  let yPosition = headerHeight + margin + 10;

  // Add recipient information (if provided)
  if (options.recipientName || options.recipientAddress) {
    yPosition += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    if (options.recipientName) {
      const recipientLine = options.recipientTitle
        ? `${options.recipientName}, ${options.recipientTitle}`
        : options.recipientName;
      doc.text(recipientLine, margin, yPosition);
      yPosition += 6;
    }
    
    if (options.recipientAddress) {
      const addressLines = options.recipientAddress.split("\n");
      for (const line of addressLines) {
        if (line.trim()) {
          doc.text(line.trim(), margin, yPosition);
          yPosition += 6;
        }
      }
    }
    yPosition += 5;
  }

  // Add subject (if provided)
  if (options.subject) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Subject: ${options.subject}`, margin, yPosition);
    yPosition += 8;
  }

  // Add document type title
  yPosition += 5;
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(options.documentType, margin + contentWidth / 2, yPosition, {
    align: "center",
  });

  // Add body text
  yPosition += 15;
  const fontSize = options.fontSize || 11;
  const lineSpacing = options.lineSpacing || 1.5;
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  const bodyLines = doc.splitTextToSize(options.bodyText, contentWidth);
  
  // Calculate where body text ends
  let currentY = yPosition;
  const lineHeight = fontSize * lineSpacing * 0.35; // Convert to mm
  for (let i = 0; i < bodyLines.length; i++) {
    if (currentY > pageHeight - margin - 60) {
      // Add new page if needed
      doc.addPage();
      currentY = margin + 20;
    }
    doc.text(bodyLines[i], margin, currentY);
    currentY += lineHeight;
  }

  // Add spacing before signature area (no signature line, just "Sincerely,")
  const spacingBeforeSignature = 20;
  let currentSignatoryY = currentY + spacingBeforeSignature;
  
  // Calculate total height needed for signatory info (including "Sincerely,")
  let signatoryInfoHeight = 8; // "Sincerely," with spacing
  signatoryInfoHeight += 6; // Name
  signatoryInfoHeight += 6; // Title
  if (options.signatoryCompany) signatoryInfoHeight += 6;
  if (options.signatoryPhone) signatoryInfoHeight += 5;
  if (options.signatoryEmail) signatoryInfoHeight += 5;
  
  // Ensure we have enough space - check if signatory info will fit
  const bottomMargin = 20; // Standard bottom margin
  if (currentSignatoryY + signatoryInfoHeight > pageHeight - bottomMargin) {
    // If doesn't fit, add new page
    doc.addPage();
    currentSignatoryY = margin + 20; // Start near top of new page
  }
  
  // Add "Sincerely," greeting below signature line
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Sincerely,", margin, currentSignatoryY);
  currentSignatoryY += 8; // Space after "Sincerely,"
  
  // Add signatory information
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(options.signatoryName, margin, currentSignatoryY);
  currentSignatoryY += 6;
  
  doc.text(options.signatoryTitle, margin, currentSignatoryY);
  currentSignatoryY += 6;
  
  if (options.signatoryCompany) {
    doc.text(options.signatoryCompany, margin, currentSignatoryY);
    currentSignatoryY += 6;
  }
  
  if (options.signatoryPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(options.signatoryPhone, margin, currentSignatoryY);
    currentSignatoryY += 5;
    doc.setTextColor(0, 0, 0);
  }
  
  if (options.signatoryEmail) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(options.signatoryEmail, margin, currentSignatoryY);
    doc.setTextColor(0, 0, 0);
  }

  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1; // jsPDF uses 1-based indexing
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Draw horizontal line above footer
    const footerLineY = pageHeight - 30;
    doc.setDrawColor(0, 51, 102); // Dark blue color
    doc.setLineWidth(0.5);
    doc.line(margin, footerLineY, pageWidth - margin, footerLineY);
    
    // Footer content positioning
    const footerStartY = pageHeight - 22;
    const footerWidth = pageWidth - 2 * margin;
    const columnWidth = footerWidth / 3;
    const column1X = margin;
    const column2X = margin + columnWidth;
    const column3X = margin + (columnWidth * 2);
    
    doc.setTextColor(0, 0, 0);
    
    // Column 1: Call
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Call", column1X, footerStartY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("(213) 237-1454", column1X, footerStartY + 5);
    
    // Column 2: Message
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Message", column2X, footerStartY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("support@fountain.net", column2X, footerStartY + 5);
    
    // Column 3: Office Address
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Office Address", column3X, footerStartY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("2064 Park St, Jacksonville", column3X, footerStartY + 5);
    doc.text("FL 32204", column3X, footerStartY + 9);
  }

  // Return to last page
  doc.setPage(totalPages);

  // Generate PDF blob
  const pdfBlob = doc.output("blob");
  return pdfBlob;
}


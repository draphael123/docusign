import jsPDF from "jspdf";

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
  footerPhone?: string;
  footerEmail?: string;
  footerAddress?: string;
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
      
      doc.addImage(imageUrl, imageType, imageX, imageY, headerWidth, headerHeight);
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

  // Add spacing before signature area
  // Ensure we have enough space at the bottom for signature + signatory info + padding
  const spacingBeforeSignature = 20;
  let signatureY = currentY + spacingBeforeSignature;
  
  // Calculate required footer height more accurately
  // Signature line (1mm) + spacing (8mm) + "Sincerely," (5mm) + spacing (8mm) + name (5mm) + spacing (6mm) + title (5mm) + spacing (6mm) + company (5mm) + phone (5mm) + email (5mm) + bottom margin (25mm) = 84mm
  let calculatedFooterHeight = 1 + 8 + 5 + 8 + 6 + 6 + 5; // Base: signature line + spacing + "Sincerely," + spacing + name + spacing + title
  if (options.signatoryCompany) calculatedFooterHeight += 6; // Company
  if (options.signatoryPhone) calculatedFooterHeight += 5; // Phone
  if (options.signatoryEmail) calculatedFooterHeight += 5; // Email
  calculatedFooterHeight += 25; // Bottom margin
  
  const requiredFooterHeight = Math.max(calculatedFooterHeight, 70); // Minimum 70mm
  const bottomMargin = margin + 10; // Extra padding for safety
  
  if (signatureY + requiredFooterHeight > pageHeight - bottomMargin) {
    // Add new page if signature area won't fit
    doc.addPage();
    signatureY = pageHeight - bottomMargin - requiredFooterHeight;
  } else {
    // Ensure minimum spacing from bottom
    const maxSignatureY = pageHeight - bottomMargin - requiredFooterHeight;
    if (signatureY > maxSignatureY) {
      signatureY = maxSignatureY;
    }
  }
  
  // Add signature line (dotted line for DocuSign)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  
  // Draw signature line (80mm wide)
  const signatureLineWidth = 80;
  const signatureLineX = margin;
  for (let i = 0; i < signatureLineWidth; i += 2) {
    doc.line(signatureLineX + i, signatureY, signatureLineX + i + 1, signatureY);
  }

  // Add "Sincerely," and signatory information below signature line
  // Calculate positions ensuring they fit on the page
  let currentSignatoryY = signatureY + 8;
  
  // Calculate total height needed for signatory info (including "Sincerely,")
  let signatoryInfoHeight = 8; // "Sincerely," with spacing
  signatoryInfoHeight += 6; // Name
  signatoryInfoHeight += 6; // Title
  if (options.signatoryCompany) signatoryInfoHeight += 6;
  if (options.signatoryPhone) signatoryInfoHeight += 5;
  if (options.signatoryEmail) signatoryInfoHeight += 5;
  
  // Double-check that everything fits with extra safety margin
  const safetyMargin = 10; // Extra margin to ensure nothing gets cut off
  const totalFooterHeight = requiredFooterHeight + signatoryInfoHeight;
  
  // Ensure we have enough space - check if footer will fit
  const totalNeededHeight = signatoryInfoHeight + safetyMargin + 5; // Extra 5mm buffer
  if (currentSignatoryY + totalNeededHeight > pageHeight - bottomMargin) {
    // If still doesn't fit, add new page
    doc.addPage();
    // Calculate new signature position with proper spacing
    const newSignatureY = pageHeight - bottomMargin - totalNeededHeight - 5; // Extra 5mm above footer
    // Redraw signature line
    for (let i = 0; i < signatureLineWidth; i += 2) {
      doc.line(signatureLineX + i, newSignatureY, signatureLineX + i + 1, newSignatureY);
    }
    currentSignatoryY = newSignatureY + 8;
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

  // Add footer contact information at the bottom of each page
  const footerPhone = options.footerPhone || "(213) 237-1454";
  const footerEmail = options.footerEmail || "support@fountain.net";
  const footerAddress = options.footerAddress || "2064 Park St, Jacksonville FL 32204";

  // Function to add footer to current page
  const addFooterToPage = () => {
    // Add footer contact information without labels - just the info
    const footerY = pageHeight - 15; // Position footer 15mm from bottom
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    // Calculate positions for three columns
    const footerStartX = margin;
    const footerWidth = pageWidth - 2 * margin;
    const columnWidth = footerWidth / 3;
    const column1X = footerStartX;
    const column2X = footerStartX + columnWidth;
    const column3X = footerStartX + (columnWidth * 2);

    // Column 1: Phone number (no label)
    doc.text(footerPhone, column1X, footerY);

    // Column 2: Email (no label)
    doc.text(footerEmail, column2X, footerY);

    // Column 3: Address (no label)
    const addressLines = footerAddress.split(", ");
    let addressY = footerY;
    for (const line of addressLines) {
      if (line.trim()) {
        doc.text(line.trim(), column3X, addressY);
        addressY += 4;
      }
    }
  };

  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1; // jsPDF uses 1-based indexing
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooterToPage();
  }

  // Return to the last page
  doc.setPage(totalPages);

  // Generate PDF blob
  const pdfBlob = doc.output("blob");
  return pdfBlob;
}


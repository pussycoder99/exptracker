
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Expense, GeolocationData } from '@/lib/types';

// Helper to download the PDF
export function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// PDF Generation function for black and white printing
export async function generateExpenseReportPDF(
  expenses: Expense[],
  geolocation: GeolocationData | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10; // Slightly reduced font size for more content fit with margins
  const lineSpacing = 15;
  const sectionSpacing = 20;

  // Margins (1 inch = 72 points)
  const marginTop = 72;
  const marginBottom = 72;
  const marginLeft = 72;
  const marginRight = 72; // Not directly used for x-positioning as text flows from left, but good for context

  const contentWidth = width - marginLeft - marginRight;
  const contentHeight = height - marginTop - marginBottom;

  // Colors for black and white printing
  const pageBackgroundColor = rgb(1, 1, 1); // White
  const textColor = rgb(0, 0, 0); // Black
  const accentColor = rgb(0, 0, 0); // Black for titles and lines

  // Apply page background color
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: pageBackgroundColor,
  });
  
  let yPosition = height - marginTop;

  // Title
  page.drawText('SNBD HOST Expense Report', {
    x: marginLeft,
    y: yPosition,
    font,
    size: 20, // Adjusted title size
    color: accentColor,
  });
  yPosition -= (20 + sectionSpacing / 2); // Adjusted spacing

  // Generation Date/Time
  page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
    x: marginLeft,
    y: yPosition,
    font,
    size: fontSize - 2, // Smaller font for meta info
    color: textColor,
  });
  yPosition -= (fontSize - 2 + 5);

  // Geolocation
  if (geolocation) {
    page.drawText(
      `Location: Lat ${geolocation.latitude.toFixed(4)}, Lon ${geolocation.longitude.toFixed(4)}`,
      {
        x: marginLeft,
        y: yPosition,
        font,
        size: fontSize - 2,
        color: textColor,
      }
    );
    yPosition -= (fontSize - 2 + 5);
  }
  yPosition -= sectionSpacing; // Extra space before expenses

  const checkAndAddNewPage = () => {
    if (yPosition < marginBottom + 50) { // Check if space is low, +50 for some buffer
        const newPage = pdfDoc.addPage();
        newPage.drawRectangle({ x:0, y:0, width: newPage.getSize().width, height: newPage.getSize().height, color: pageBackgroundColor });
        page = newPage; 
        yPosition = newPage.getSize().height - marginTop;
        return true; // Indicates a new page was added
    }
    return false;
  };

  // Expenses
  for (const expense of expenses) {
    checkAndAddNewPage();

    page.drawText(`Expense For: ${expense.expenseFor}`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    if (expense.employeeName) {
      checkAndAddNewPage();
      page.drawText(`Employee Name: ${expense.employeeName}`, { x: marginLeft + 10, y: yPosition, font, size: fontSize, color: textColor });
      yPosition -= lineSpacing;
    }
    if (expense.domainPanelName) {
      checkAndAddNewPage();
      page.drawText(`Domain Panel: ${expense.domainPanelName}`, { x: marginLeft + 10, y: yPosition, font, size: fontSize, color: textColor });
      yPosition -= lineSpacing;
    }
    checkAndAddNewPage();
    page.drawText(`Amount: ${expense.amount.toFixed(2)} ${expense.currency}`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    checkAndAddNewPage();
    page.drawText(`Date: ${new Date(expense.date).toLocaleDateString()}`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    checkAndAddNewPage();
    page.drawText(`Paid By: ${expense.paidBy}`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    checkAndAddNewPage();
    page.drawText(`Approved By: ${expense.approvedBy}`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    
    // Multi-line text handling for details
    const detailsLines = splitTextToFitWidth(expense.otherExpenseDetails, contentWidth - 20, font, fontSize); // -20 for indent
    checkAndAddNewPage();
    page.drawText(`Details:`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    for (const line of detailsLines) {
      if (checkAndAddNewPage()) { // If new page added, re-evaluate drawing position
         // Draw 'Details:' again if it was the last thing on previous page.
      }
      page.drawText(line, { x: marginLeft + 10, y: yPosition, font, size: fontSize, color: textColor });
      yPosition -= lineSpacing;
    }

    const enDescLines = splitTextToFitWidth(expense.descriptionEnglish, contentWidth -20, font, fontSize);
    checkAndAddNewPage();
    page.drawText(`Desc (EN):`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    for (const line of enDescLines) {
       if (checkAndAddNewPage()) {
           // Draw 'Desc (EN):' again
       }
      page.drawText(line, { x: marginLeft + 10, y: yPosition, font, size: fontSize, color: textColor });
      yPosition -= lineSpacing;
    }
    
    // Bangla text will require a proper Bangla font embedded. Placeholder:
    const bnDescLines = splitTextToFitWidth(expense.descriptionBangla, contentWidth -20, font, fontSize);
    checkAndAddNewPage();
    page.drawText(`Desc (BN):`, { x: marginLeft, y: yPosition, font, size: fontSize, color: textColor });
    yPosition -= lineSpacing;
    for (const line of bnDescLines) {
       if (checkAndAddNewPage()) {
          // Draw 'Desc (BN):' again
       }
      page.drawText(line, { x: marginLeft + 10, y: yPosition, font, size: fontSize, color: textColor });
      yPosition -= lineSpacing;
    }
    yPosition -= sectionSpacing / 2; // Extra space between expenses
  }
  
  // Pre-signed area
  // Ensure there's enough space for the signature block, or move to a new page
  const signatureBlockHeight = 50; // Approximate height needed for signature block
  if (yPosition < marginBottom + signatureBlockHeight) {
    const newPage = pdfDoc.addPage();
    newPage.drawRectangle({ x:0, y:0, width: newPage.getSize().width, height: newPage.getSize().height, color: pageBackgroundColor });
    page = newPage;
    yPosition = newPage.getSize().height - marginTop; // Place at top of new page
  }
  
  // Position signature block relative to bottom margin
  let signatureYPosition = marginBottom + 30; // 30 points above bottom margin for the line

  page.drawText('Authorized by SNBD HOST', {
    x: marginLeft,
    y: signatureYPosition + lineSpacing, // Text above the line
    font,
    size: fontSize, // Use consistent font size
    color: accentColor,
  });
  
  page.drawLine({
    start: { x: marginLeft, y: signatureYPosition },
    end: { x: marginLeft + 200, y: signatureYPosition }, // Line length 200 points
    thickness: 1,
    color: accentColor,
  });

  return pdfDoc.save();
}

// Helper function to split text to fit a given width
function splitTextToFitWidth(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    return lines.length > 0 ? lines : [' ']; // Return at least a space if text is empty, to avoid errors if loop expects content
}

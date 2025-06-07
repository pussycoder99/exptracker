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

// Basic PDF Generation function (placeholder for full styling and Bangla support)
export async function generateExpenseReportPDF(
  expenses: Expense[],
  geolocation: GeolocationData | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage(); // Changed const to let
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const redColor = rgb(255/255, 60/255, 60/255); // #FF3C3C
  const blackColor = rgb(18/255, 18/255, 18/255); // #121212 (using a slightly lighter black for text on white)
  const whiteColor = rgb(1,1,1);


  // Theme colors
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: blackColor, // Background
  });
  
  let yPosition = height - 50;

  // Title
  page.drawText('SNBD HOST Expense Report', {
    x: 50,
    y: yPosition,
    font,
    size: 24,
    color: redColor,
  });
  yPosition -= 30;

  // Generation Date/Time
  page.drawText(`Generated on: ${new Date().toLocaleString()}`, {
    x: 50,
    y: yPosition,
    font,
    size: fontSize,
    color: whiteColor,
  });
  yPosition -= 20;

  // Geolocation
  if (geolocation) {
    page.drawText(
      `Location: Lat ${geolocation.latitude.toFixed(4)}, Lon ${geolocation.longitude.toFixed(4)}`,
      {
        x: 50,
        y: yPosition,
        font,
        size: fontSize,
        color: whiteColor,
      }
    );
    yPosition -= 20;
  }
  yPosition -= 10; // Extra space

  // Expenses
  for (const expense of expenses) {
    if (yPosition < 100) { // Add new page if space is low
        const newPage = pdfDoc.addPage();
        newPage.drawRectangle({ x:0, y:0, width: newPage.getSize().width, height: newPage.getSize().height, color: blackColor });
        page = newPage; 
        yPosition = newPage.getSize().height - 50;
    }

    page.drawText(`Expense For: ${expense.expenseFor}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    if (expense.employeeName) {
      page.drawText(`Employee Name: ${expense.employeeName}`, { x: 60, y: yPosition, font, size: fontSize, color: whiteColor });
      yPosition -= 15;
    }
    if (expense.domainPanelName) {
      page.drawText(`Domain Panel: ${expense.domainPanelName}`, { x: 60, y: yPosition, font, size: fontSize, color: whiteColor });
      yPosition -= 15;
    }
    page.drawText(`Amount: ${expense.amount} ${expense.currency}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    page.drawText(`Date: ${new Date(expense.date).toLocaleDateString()}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    page.drawText(`Paid By: ${expense.paidBy}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    page.drawText(`Approved By: ${expense.approvedBy}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    page.drawText(`Details: ${expense.otherExpenseDetails}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    page.drawText(`Desc (EN): ${expense.descriptionEnglish}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 15;
    // Bangla text will require a proper Bangla font embedded. Placeholder:
    page.drawText(`Desc (BN): ${expense.descriptionBangla}`, { x: 50, y: yPosition, font, size: fontSize, color: whiteColor });
    yPosition -= 25; // Extra space between expenses
  }
  
  // Pre-signed area
  yPosition = Math.min(yPosition, 80); // Ensure it's near bottom if many expenses
  page.drawText('Authorized by SNBD HOST', {
    x: 50,
    y: yPosition,
    font,
    size: fontSize + 2,
    color: redColor,
  });
  yPosition -= 20;
  page.drawLine({
    start: { x: 50, y: yPosition },
    end: { x: 250, y: yPosition },
    thickness: 1,
    color: redColor,
  });

  return pdfDoc.save();
}

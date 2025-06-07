# **App Name**: SNBD Expense Tracker

## Core Features:

- Dynamic Field Display: Dynamically reveal input fields ('Employee Name' or 'Domain Panel Name') based on the selection made in the 'Expense For' dropdown.
- Expense Entry Form: A user interface enabling users to enter expense information, including the reason for expense, amount, currency, description, date, and approver.
- Add Expense: Clickable button to add the expense data to a display on the current page, after validating the required fields.
- Generate PDF: Clickable button to generate a PDF of all entered data, the current date and time, geolocation if available, and a pre-signed authorization area. Supports Bangla text rendering.
- Expense List: Presents all expenses in a concise listing, with controls for filtering, sorting and editing.
- Tax Optimization Assistant: Uses an LLM tool that examines the expenses and recommends the ideal Bangla translations to optimize the financial compliance based on expense location.

## Style Guidelines:

- Background color: Dark gray (#121212) for a professional, modern feel.
- Primary color: Vivid red (#FF3C3C), evoking the SNBD HOST theme; chosen for its vibrancy and distinctiveness, it stands out effectively against the dark background.
- Accent color: Slightly desaturated, cooler red (#F02020). This accent complements the primary red by providing visual contrast, enhancing UI elements without overpowering the overall theme.
- Font: 'Inter' (sans-serif) for a clean, modern, readable interface.
- Simple, line-based icons in red to maintain consistency with the color scheme.
- Utilize Bootstrap 5 or Tailwind CSS grid system for a responsive, structured layout.
- Subtle transitions and hover effects on buttons and interactive elements using Bootstrap or Tailwind utilities.
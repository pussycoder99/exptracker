# Firebase Studio - SNBD Expense Tracker

This is a Next.js application for tracking expenses, built with Firebase Studio.

## Getting Started

1.  **Clone the repository (if applicable) or start with your Firebase Studio project.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Firebase project configuration. You can find these details in your Firebase project settings (Project settings > General > Your apps > Firebase SDK snippet > Config).

    ```env
    # Firebase Project Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional

    # Genkit (if using AI features) - Your Google API Key for Gemini
    GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
    ```
    **Important:** If you deploy this application, ensure these environment variables are set in your hosting environment (e.g., Firebase App Hosting or Netlify environment settings).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the app on `http://localhost:9002`.

5.  **For Genkit AI features (Tax Optimization):**
    If you're using the Genkit-powered Tax Optimization Assistant, you'll also need to run the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```

## Core Features

-   **Dynamic Field Display**: Dynamically reveals input fields based on 'Expense For' selection.
-   **Expense Entry Form**: UI for entering expense details.
-   **Add Expense**: Adds expense data to a list on the current page.
-   **Save Expenses**: Saves all locally added expenses to Firebase Firestore.
-   **Generate PDF**: Creates a PDF of all entered expenses, current date/time, geolocation, and a pre-signed area.
-   **Expense List**: Displays all expenses with options for tax optimization.
-   **Tax Optimization Assistant**: Uses Genkit (LLM) to suggest Bangla translations for financial compliance.
-   **Firebase Integration**: Expenses are saved to Firestore.
-   **Admin Dashboard**:
    -   Located at `/admin`.
    -   Protected by a simple client-side password.
    -   Displays all expenses fetched from Firestore.
    -   Search functionality for expenses.
    -   Option to download a PDF report of displayed expenses.
    -   Summary cards for total expenses by currency.
    -   Bar chart for expenses by category.

## Tech Stack

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI Components
-   Genkit (for AI features)
-   Firebase (Firestore for database)
-   `pdf-lib` (for PDF generation)
-   `react-hook-form` & `zod` (for form handling and validation)
-   `recharts` (for charts in admin dashboard)

## To Do / Future Enhancements

-   Implement robust user authentication (e.g., Firebase Authentication) for the admin panel.
-   Add filtering, sorting, and editing capabilities to the expense list from the dashboard.
-   Enhance PDF generation with Bangla font support.
-   Add more robust error handling and user feedback.
-   Add pagination to the admin expense list.

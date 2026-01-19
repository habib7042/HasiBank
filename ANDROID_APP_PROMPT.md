# AI Prompt: Build Hashi Bank Android App

**Goal:** Create a fully functional Android application for "Hashi Bank" that integrates with an existing Next.js backend API. The app should allow users to view their savings, make deposits/withdrawals, and track transaction history.

**Context:**
The backend is already running and exposes several REST API endpoints. The Android app needs to consume these APIs. The app should use a modern mobile framework (e.g., React Native, Flutter, or Native Android with Kotlin).

**Authentication:**
- The app must have a Login Screen.
- Authentication is PIN-based.
- **Endpoint:** `POST /api/auth/verify-pin`
  - **Body:** `{ "pin": "1234" }`
  - **Response:** `{ "success": true, "message": "..." }` or `{ "error": "Invalid PIN" }`

**Core Features & UI Structure:**

1.  **Dashboard (Home Tab):**
    - Display the "Total Bank Balance".
    - **Endpoint:** `GET /api/totals`
      - **Response:** `{ "userTotals": [...], "bankTotal": 1000.00 }`
    - Display a list of User Accounts with their individual totals and transaction counts (from the `userTotals` array).

2.  **Transaction History (History Tab):**
    - Display a list of recent transactions (deposits and withdrawals).
    - **Endpoint:** `GET /api/deposits`
      - **Response:** `{ "deposits": [{ "id": "...", "amount": 500, "userName": "Habib", "month": "January", "year": "2024", ... }, ...] }`
    - *Note:* Withdrawals appear as negative amounts in this list.

3.  **Actions (Action Tab):**
    - Provide a form to switch between "Deposit" and "Withdrawal".
    - **Dropdown:** Select User (fetch from `GET /api/users`).
    - **Input:** Amount.
    - **Dropdown:** Month.
    - **Input:** Year.
    - **Input:** Confirmation PIN (must verify against `/api/auth/verify-pin` before submitting).
    - **Checkbox:** "Are you sure?".
    - **Submit Button:**
      - For Deposits: Call `POST /api/deposits`
        - **Body:** `{ "userName": "...", "amount": "500", "month": "...", "year": "..." }`
      - For Withdrawals: Call `POST /api/withdrawals`
        - **Body:** `{ "userName": "...", "amount": "500", "month": "...", "year": "..." }`

4.  **System/Settings (Settings Tab):**
    - Show API Health Status.
      - **Endpoint:** `GET /api/health`
    - Show Debug Info / Database Status.
      - **Endpoint:** `GET /api/debug`
    - Button to "Initialize Database" (useful for first run).
      - **Endpoint:** `POST /api/init`
    - Logout button (clears local session state).

**Design Guidelines:**
- **Theme:** Dark/Light mode support or a "Glossy" design style (Blues, Cyans, White/Glassmorphism).
- **Navigation:** Bottom Navigation Bar for switching tabs.
- **Feedback:** Use Toasts or Snackbars for success/error messages.

**Technical Requirements:**
- Handle network errors gracefully.
- Show loading states while fetching data.
- Ensure type safety for API responses.

---

*Use this prompt to generate the codebase for the Android application.*

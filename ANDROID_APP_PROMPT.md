# Prompt to Create HASHI BANK Android App (React Native/Expo)

Use this prompt with an AI agent (like Replit AI) to generate a full-featured Android application for HASHI BANK.

---

**Prompt:**

Create a comprehensive **React Native (Expo)** Android application for **HASHI BANK**, a personal savings and community app. The app should connect to my existing Next.js backend API and replicate the following features, UI, and logic exactly.

### **1. Tech Stack & Style**
*   **Framework**: React Native with Expo (TypeScript).
*   **Styling**: NativeWind (Tailwind CSS for React Native) or styled-components.
*   **Theme**: "Love Theme" 💖. Use a color palette of Pink (`#ec4899`, `#db2777`) and Rose (`#fce7f3`).
*   **Background**: Implement a persistent animated background with floating hearts (similar to CSS keyframes).
*   **Icons**: Use `lucide-react-native` for consistency (Heart, BookHeart, LayoutDashboard, etc.).

### **2. Core Features & Navigation**
*   **Dashboard (Home Screen)**:
    *   Instead of a tab bar, create a **Grid Layout** dashboard (like a phone home screen) with beautiful, gradient-colored icons for: "Overview", "Deposit", "Withdraw", "KothaBank", "Memories", "Code".
    *   Clicking an icon navigates to that screen with a slide animation.
    *   Include a "Back to Home" button in the header of every sub-screen.
*   **Authentication**:
    *   **PIN Entry**: Custom numeric keypad (0-9, DEL). Input field is read-only to prevent keyboard popup.
    *   **Auto-Verify**: When the 4th digit is entered, automatically trigger the API call to `/api/auth/verify-pin`. Show "Verifying..." or "Success" visual status.
    *   **Session**: Persist login using `AsyncStorage`. Auto-logout after 5 minutes of inactivity (touch/scroll).

### **3. Modules & Logic**

#### **A. Banking (Overview, Deposit, Withdraw)**
*   **API**:
    *   Fetch totals: `GET /api/totals`
    *   Fetch transactions: `GET /api/deposits`
    *   Add Deposit: `POST /api/deposits`
    *   Add Withdrawal: `POST /api/withdrawals`
*   **UI**:
    *   Display "Total Savings" and "Active Members" cards with glassmorphism effect.
    *   Deposit/Withdraw forms should include User dropdown (fetch from `/api/users`), Amount, Month/Year selection, and a PIN confirmation keypad.

#### **B. KothaBank (Community Notebook)**
*   **Security**: Protect this screen with a **PIN Gate** (require PIN re-entry if session expired, or just use the main auth).
*   **API**:
    *   Fetch Feed: `GET /api/notes` (includes user, reactions, comments).
    *   Post Note: `POST /api/notes` (fields: content, userName, emoji).
    *   React: `POST /api/notes/[id]/react` (fields: userName, type: like/love/haha/sad).
    *   Comment: `POST /api/notes/[id]/comments` (fields: content, userName).
*   **Features**:
    *   **Feed**: List of cards. Each card shows the user avatar, message, reaction buttons, and comments.
    *   **Floating Emojis**: When a user reacts, animate multiple emoji icons floating up from the button (like Telegram).
    *   **Identity**: Allow selecting "Posting/Reacting as [User]" via a dropdown or modal.

#### **C. Memories (Gallery)**
*   **Security**: Protect with **PIN Gate**.
*   **API**:
    *   Fetch: `GET /api/memories`
    *   Upload: `POST /api/memories` (fields: description, date, userName, images[]).
*   **Features**:
    *   **Grid View**: Display memories as a grid of cards.
    *   **Detail View**: Tapping a memory opens a full-screen view with an image carousel (if multiple photos), zoom capability, and a comment section.
    *   **Upload**: Allow picking images from the phone gallery. **Compress images** to <600KB before uploading (using base64). Show a progress bar.

#### **D. Code (Authenticator)**
*   **Security**: Protect with **PIN Gate**.
*   **API**: `GET /api/totp`, `POST /api/totp`.
*   **Features**:
    *   **TOTP Generation**: Use `otpauth` library to generate 6-digit codes locally from the fetched secrets.
    *   **Countdown**: Show a circular progress ring for the 30s timer.
    *   **Scanner**: Implement a QR Code scanner (using `expo-camera` or similar) to add new secrets via `otpauth://` QR codes.
    *   **Copy**: Tap to copy code to clipboard.

### **4. Configuration**
*   Create a `config.ts` file to store the `API_BASE_URL` (e.g., `https://your-nextjs-app.vercel.app`).
*   Ensure all API requests send `Content-Type: application/json`.

---

**Generate the full project structure, `package.json` dependencies, and key component code now.**

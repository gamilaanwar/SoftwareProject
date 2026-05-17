# 4.4 Setup & Installation Guide

This guide provides a comprehensive, step-by-step walkthrough for setting up the **CampusCare Facility Management System** on your local machine.

---

## 1. Prerequisites

Ensure you have the following installed before proceeding:

*   **Node.js**: Version `18.x` or higher (Long Term Support - LTS recommended).
*   **npm**: Version `9.x` or higher (comes bundled with Node.js).
*   **Git**: Required for repository cloning and version control.
*   **PostgreSQL**: Either a local installation or a cloud-hosted instance (e.g., [Supabase](https://supabase.com/)).
*   **Expo Go App**: Install on your iOS or Android device for mobile testing.
*   **Optional**: [Android Studio](https://developer.android.com/studio) (for Android Emulator) or [Xcode](https://developer.apple.com/xcode/) (for iOS Simulator, macOS only).

---

## 2. Database Configuration

The application uses PostgreSQL with UUID support.

1.  **Initialize Database**:
    *   Create a new database named `campuscare`.
    *   Execute the SQL commands found in `backend/migrations/001_init.sql`.

2.  **Schema Patch**:
    *   The backend logic includes a `location_notes` field which is not present in the initial migration. Run the following command in your SQL editor:
        ```sql
        ALTER TABLE public.locations ADD COLUMN location_notes TEXT;
        ```

3.  **Supabase Tip**: If using Supabase, you can copy the contents of `001_init.sql` directly into the "SQL Editor" tab and run it.

---

## 3. Backend Installation & Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```
    *Note: If you encounter errors related to `bcrypt` on Windows, ensure you have the [C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) installed.*

3.  **Environment Variables**:
    Create a `.env` file in the `backend/` root:
    ```env
    PORT=5001
    DATABASE_URL=your_postgresql_connection_string
    JWT_SECRET=your_super_secret_random_string
    JWT_EXPIRES_IN=7d
    NODE_ENV=development
    ```
    *Replace `your_postgresql_connection_string` with your actual DB URI (e.g., `postgresql://postgres:password@localhost:5432/campuscare`).*

4.  **Start the server**:
    ```bash
    npm run dev
    ```
    *The API will be accessible at `http://localhost:5001`.*

---

## 4. Mobile App (Frontend) Installation & Setup

1.  **Navigate to the mobile app directory**:
    ```bash
    cd campusCare-mobile/campuscare-app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Networking Note**:
    The mobile app automatically detects your computer's IP address to connect to the backend during development. Ensure your mobile device and development machine are on the **same Wi-Fi network**.

4.  **Launch Expo**:
    ```bash
    npx expo start
    ```

---

## 5. Running the Application

After running the Expo start command:

*   **Physical Device**: Open the **Expo Go** app and scan the QR code displayed in your terminal.
*   **Android Emulator**: Press `a` in the terminal (requires Android Studio).
*   **iOS Simulator**: Press `i` in the terminal (requires macOS and Xcode).
*   **Web**: Press `w` to view in the browser (limited hardware support).

---

## 6. Third-Party Services & Storage

*   **Database**: PostgreSQL (Relational data).
*   **Image Storage**: Handled locally by `multer`. Images uploaded by users are stored in `backend/uploads/`.
*   **Auth**: JSON Web Tokens (JWT) for secure session management.

---

## 7. Troubleshooting

*   **Backend Connection**: If the app fails to fetch data, verify the backend is running and check your firewall settings for port `5001`.
*   **Database Connection**: Ensure the `DATABASE_URL` in `.env` matches your credentials and that the DB server is active.
*   **Missing Uploads Folder**: Ensure the `backend/uploads` directory exists. If not, create it manually.

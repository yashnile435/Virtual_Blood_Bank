# Virtual Blood Bank - User Panel Upgrade

## 🆕 New Features
- **User Panel UI**: A complete dashboard for Donors.
- **Registration**: Donors can now sign up and log in.
- **Profile Management**: Update personal details and toggle availability.
- **Blood Requests**: View and create blood requests.

## 🧹 Data Cleanup
- The database has been truncated. Old dummy data is gone.
- **Admin**: You must initialize the admin user again.
  - Go to Login page -> Click "Initialize Admin User".
  - Credentials: `admin` / `admin123`.

## 🚀 How to Run

1.  **Backend**: Restart your Spring Boot Application.
2.  **Frontend**:
    ```bash
    cd blood-bank-ui
    npm install
    npm run dev
    ```
3.  **Access**:
    - **Admin Dashboard**: Login as `admin`.
    - **User Panel**: Register a new account or login as a donor.

## 🎨 Design
- Validated with **Tailwind CSS**.
- Theme: Primary Red (`#dc2626`), Clean White, Soft Gray.

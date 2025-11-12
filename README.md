# Bharat Wedding Management

A lightweight, browser-based wedding management system for planning events, managing team assignments, guest lists, and estimating budgets. Built with plain HTML, CSS and JavaScript with data stored in the browser's Local Storage.

## 🚀 How to Run This Project

### **⭐ START HERE: Open `login.html` as your entry point**

#### Option A - Direct File Opening (No Server Required)
1. Navigate to the project folder: `Bharat-wedding-managment`
2. **Double-click `login.html`** to open it in your default browser
3. That's it! The app will load and you can login or register

#### Option B - Using VS Code Live Server (Recommended for Development)
1. Install the "Live Server" extension in VS Code
2. Open the project folder in VS Code
3. Right-click on `login.html` → Select **"Open with Live Server"**
4. The app will open in your browser with hot-reload support

#### Demo Credentials (Pre-loaded Users)
```
User Account:
- Email: user1@example.com
- Password: user123
- Wallet: ₹5,000

Member Account:
- Email: member1@example.com
- Password: member123

Admin Account:
- Email: admin@example.com
- Password: admin123
- Wallet: ₹100,000
```

## 📋 Features

### Core Functionality
- ✅ User/Admin/Member authentication system
- ✅ **Structured Wedding Booking** (Haldi, Mehendi, Sangeet, Wedding, Reception)
- ✅ **Meal Selection System** (Vegetarian, Non-Vegetarian, Vegan × Basic, Premium tiers)
- ✅ **Destination Selection** (6 pre-configured venues with base costs)
- ✅ **Auto Budget Calculation** (Venue + Catering per event)
- ✅ Budget calculator for event planning
- ✅ Team management and event assignments
- ✅ Admin panel for managing operations
- ✅ Member dashboard with assigned work tracking
- ✅ Wallet system for users and admins
- ✅ **Payment transactions system** with booking payment flow

### 🎯 User Booking Flow (NEW!)
1. **User enters event details**: Bride/Groom name, mobile
2. **Per-event configuration**:
   - Select event type from dropdown (Haldi, Mehendi, etc.)
   - **Select destination from 6 pre-configured venues** ✨
   - Choose date
   - Enter **number of guests**
   - **Select meal type** (Veg/Non-Veg/Vegan) ✨
   - **Select meal tier** (Basic/Premium) with descriptions ✨
3. **Real-time budget calculation** displays:
   - Venue cost (fixed per venue)
   - Catering cost (guests × meal cost per person)
   - Per-event total
   - **Booking total budget** (auto-calculated) ✨
4. **User can add multiple events** → each calculates independently
5. **After booking confirmation**, user sees:
   - Booking summary with all event details
   - Total estimated budget
   - **"Pay to Admin" button** to initiate payment
6. **Payment modal** (no browser confirm!):
   - Shows wallet balance
   - Checks if balance sufficient
   - If insufficient: offers to add funds (link to payments.html)
   - On success: marks booking as PAID, records transaction
7. **Booking appears in "My Bookings"** with payment status

### Security & Access Control
- ✅ All pages require login (automatic redirect to login.html)
- ✅ Role-based access (User / Member / Admin)
- ✅ Logout button on every page
- ✅ Users can only see/pay for their own bookings
- ✅ Admin can view all bookings and revenue
- ✅ Session stored in browser Local Storage

## 🗂️ Project Structure

```
Bharat-wedding-managment/
├── login.html                 ⭐ START HERE - Main entry point
├── index.html                 - Home page (after login)
├── booking.html               - Create/manage bookings with meal & venue selection
├── user-dashboard.html        - 🆕 User bookings, payment history, wallet
├── budget.html                - Budget calculator
├── admin.html                 - Admin panel with booking overview & revenue stats
├── member-dashboard.html      - Member work & wallet view
├── payments.html              - User wallet & payment to admin
├── admin-payments.html        - Admin wallet & payment to members
│
├── user-login.html            - User login form
├── user-register.html         - User registration
├── admin-login.html           - Admin login form
├── admin-register.html        - Admin registration
│
├── js/
│   ├── db.js                  - Local Storage data layer (+ meal, destination, payment APIs)
│   └── auth.js                - Authentication helper
├── main.js                    - Booking form logic (structured meals, destinations, budget calc)
├── admin.js                   - Admin panel logic
│
├── style.css                  - Main stylesheet
├── TEST-GUIDE.md              - 🆕 Comprehensive test scenarios
├── README.md                  - This file
└── wedding.db                 - Legacy database (not used)
```

## 🔐 Login Flow

1. **Open `login.html`** as the first page
2. **Choose your role:**
   - 👤 User Login / Register
   - 👨‍💼 Admin Login / Register
   - 💼 Member (login via Admin)
3. **Enter demo credentials** (or register a new account)
4. **Dashboard loads automatically:**
   - Users → `index.html`
   - Members → `member-dashboard.html`
   - Admins → `admin.html`
5. **Logout button** available on every page (red button in top-right)

## 📌 Key Pages

| Page | Purpose | Who Can Access |
|------|---------|-----------------|
| `login.html` | Entry point & auth | Everyone (public) |
| `index.html` | User home | Logged-in users |
| `booking.html` | Create/manage bookings with venue & meal selection ✨ | Users |
| `user-dashboard.html` | View bookings, payment history, wallet ✨ | Users |
| `admin.html` | Booking overview, revenue stats, team management ✨ | Admins |
| `budget.html` | Budget calculator (legacy) | Users |
| `member-dashboard.html` | View assigned work & wallet | Members |
| `payments.html` | Manage wallet & add funds | Users |
| `admin-payments.html` | Admin wallet & pay members | Admins |

## 💰 Wallet & Payment System

### User Booking & Payment Flow (NEW!)
1. User creates booking:
   - Select event type, destination (venue), date
   - Enter guest count
   - Select meal type (Veg/Non-Veg/Vegan) and tier (Basic/Premium)
   - **Budget auto-calculates**: Venue cost + (Guests × Meal cost/person)
2. User sees booking confirmation with total budget
3. **User clicks "Pay to Admin"**:
   - Payment modal checks wallet balance
   - If insufficient: prompts to add funds
   - On success: amount transferred to admin, booking marked PAID
4. Payment history visible in **User Dashboard**

### User Wallet Management
1. Users can add funds to wallet via `payments.html`
2. Users can pay admin for bookings (from booking page or user dashboard)
3. All payments tracked in transaction history

### Admin Operations
1. Admin receives payments from users
2. Admin can view all bookings and revenue (stats on admin.html)
3. Admin can pay members from wallet (admin-payments.html)
4. Members receive payments in their wallet

All transactions are logged and visible in transaction history.

## 🎯 Common Tasks

### Register & Login
1. Open `login.html`
2. Select role and click "Register" or "Login"
3. Fill in details and submit
4. Redirected to role-based dashboard

### Book a Wedding Event (Step-by-step)
1. Login as a User
2. Go to **"Book Event"** → `booking.html`
3. Fill booking header (Bride, Groom, Mobile)
4. **For each event:**
   - Select function type (Haldi, Mehendi, Wedding, etc.)
   - **Select destination from venue dropdown** ✨
   - Pick event date
   - **Enter expected guest count** ✨
   - **Select meal type** (Veg 🌱 / Non-Veg 🍗 / Vegan 🥬) ✨
   - **Select meal tier** (Basic/Premium with descriptions) ✨
   - **Watch budget update in real-time** ✨
5. Click "+ Add Another Event" if needed
6. Click "Create Booking"
7. **See confirmation with total budget and "Pay to Admin" button** ✨
8. (Optional) Click "Pay Now" to pay for booking immediately
9. View booking status in **"My Bookings"** section

### Make Payment for Booking
1. After booking created, click **"Pay ₹X to Admin"** button
2. Payment modal appears:
   - Shows your wallet balance
   - If insufficient: click "Add Funds" to go to payments.html
   - If sufficient: click "Pay Now" to transfer
3. On success: see confirmation modal, booking marked PAID ✓
4. Can view transaction in **User Dashboard → Payment History**

### Check Your Dashboard
1. Login as User
2. Go to **"My Dashboard"** → `user-dashboard.html`
3. See stats: Total bookings, wallet balance, amount paid
4. **My Bookings Tab**: View all your bookings with payment status
5. **Payment History Tab**: View all transactions (payments, top-ups)

### View Revenue as Admin
1. Login as Admin
2. Go to **Admin Panel** → `admin.html`
3. See stats: Total bookings, revenue received, paid bookings, pending amount
4. View all bookings with payment status (green = paid, orange = pending)
5. Full event details with meal selections visible

### Manage as Admin
1. Login with admin account
2. Go to Admin Panel (`admin.html`)
3. **Revenue Dashboard**: View total revenue, payment status
4. **All Bookings**: Filter, search, view details
5. **Add team members** and assign events
6. Manage member approvals (member requests salary, admin approves)

### Logout
- Click the red **"Logout"** button on any page
- You'll be redirected to `login.html`
- Session will be cleared

## 🔄 Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser Local Storage (no backend)
- **No dependencies** - pure vanilla implementation
- **No build step** - open and run directly

## 📝 Notes

- All data is stored in browser Local Storage (clears when browser cache is cleared)
- Passwords are base64-encoded for demo purposes (⚠️ NOT secure - for demo only)
- Works offline once cached
- Responsive design for desktop and mobile devices
- Demo credentials are pre-loaded on first visit

## 🐛 Troubleshooting

### "Automatic redirect to login"
- This is expected behavior. Only authenticated users can access features.
- Clear browser cache if stuck in redirect loop: Press F12 → Application → Local Storage → Clear All

### "Page not loading"
- Make sure you're opening `login.html` first
- Use Live Server in VS Code for better compatibility
- Check browser console (F12) for errors

### "Lost my session"
- Sessions are stored in browser Local Storage
- Clearing browser cache/cookies will log you out
- Simply login again with your credentials

## 📞 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Clear Local Storage and refresh
3. Try opening in a different browser
4. Ensure you're opening `login.html` first
- `all-bookings.html` — A page to view and filter all bookings.
- `budget.html` — Budget calculator UI and saved budget plans.
- `admin.html` — Admin panel for managing team members and assigning events to team members.
- `member-dashboard.html` — Member dashboard showing wallet balance and assigned events.
- `payments.html` — User wallet and payment to admin.
- `admin-payments.html` — Admin wallet and payment to members.
- `user-register.html`, `user-login.html` — User registration and login.
- `admin-register.html`, `admin-login.html` — Admin registration and login.
- `admin.js`, `main.js` — Application JavaScript handling UI logic (booking flow, budget calculations, dashboard, admin features).
- `js/db.js` — Database helper and data initialization routines (wrapper around `localStorage`). This file contains functions used across pages to read/write bookings, team members, assignments and budget plans.
- `js/auth.js` — UI helper for showing current login status in the header.
- `style.css` — Main stylesheet used by all pages.

**Note:** `css/style.css` is a duplicate of root `style.css` and can be safely deleted. The app uses only the root-level `style.css`.

## Data model (high level)

- Bookings: id, bride, groom, mobile, events[], bookingDate. Each event has functionType, destination, date.
- Team members: id, name, role/status.
- Assignments: id, bookingId, eventName, member (or memberId), date.
- Budget plans: id, eventType, venueName, venueCost, foodCostPerGuest, expectedGuests, decorationCost, additionalServices, miscCost, totalCost, createdAt.

## Using the app

- Booking: Go to `booking.html`, fill bride/groom/contact details, add one or more events (type, destination, date) and submit. Bookings are saved to Local Storage and appear in previous bookings and the dashboard.
- Budget: Use `budget.html` to enter costs and expected guests. Click "Calculate" and optionally save the plan.
- Admin: Use `admin.html` to add team members (bulk via textarea) and assign events from existing bookings to team members. You can also view/delete bookings and manage assignments.
- Authentication & payments:
	- Register a user via `user-register.html` and login via `user-login.html`. After login, go to `payments.html` to add funds to your wallet or pay the admin. Payments are simulated and stored locally.
	- Admins can register via `admin-register.html` (or use the seeded admin admin@example.com / admin123), login at `admin-login.html`, then manage payroll using `admin-payments.html` to pay team members from the admin wallet.

## Developer notes

- Sample data: Some files will initialize sample data automatically (check `js/db.js` / `main.js`). To reset the app data, open the console or use the Reset Database button on `index.html` when running locally (file protocol) or run `localStorage.clear()` in the browser console.
- Search for `DB.` and `localStorage` in the JS files to locate persistence logic and helper functions.
- The code is intentionally simple and written in vanilla JS for clarity and learning. If you plan to extend it, consider adding validation, a proper build pipeline, and migrating storage to a backend service.

Security note: This project stores passwords in Local Storage (base64 encoded) for demo purposes only. Do NOT use this approach in production. For any real app, use a proper backend with hashed passwords and secure authentication.

## Suggestions / next steps

- Add automated unit tests for utility functions and DB helpers.
- Improve input validation (mobile numbers, required fields, date ranges).
- Add user authentication for the admin panel and role-based access control.
- Replace Local Storage with a lightweight backend (Express + SQLite) for multi-user usage.

## License

No license specified. Add a LICENSE file if you want to open-source this repository under a specific license.

---

If you'd like, I can also:

- Add an expanded CONTRIBUTING.md and ISSUE_TEMPLATE.md.
- Create small unit tests for the DB helper and utility functions.
- Implement a tiny Node.js Express backend to persist data server-side.


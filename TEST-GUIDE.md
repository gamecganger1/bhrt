# 🎉 Updated Booking & Payment System - Test Guide

## ✨ New Features

### 1. **Structured Meal Selection**
- Users select meal TYPE: Vegetarian 🌱, Non-Vegetarian 🍗, or Vegan 🥬
- Users select meal TIER: Basic (₹300-550/guest) or Premium (₹600-750/guest)
- Detailed descriptions shown for each meal tier
- Real-time budget updates as selections change

### 2. **Destination Selection**
- Dropdown list with 6 pre-configured venues:
  - Green Valley Resort (Agra) - ₹50,000
  - Royal Palace Hotel (Delhi) - ₹75,000
  - Taj Convention Center (Agra) - ₹60,000
  - Marriott Grand (Mumbai) - ₹80,000
  - Lake View Banquet (Udaipur) - ₹45,000
  - Palace of Dreams (Jaipur) - ₹70,000

### 3. **Auto Budget Calculation**
- Per-Event Budget = Venue Base Cost + (Guests × Meal Cost Per Person)
- Total Booking Budget = Sum of all event budgets
- Displays in real-time as user fills form
- Shows breakdown: Venue Cost + Catering Cost = Event Total

### 4. **Payment Flow**
1. User creates booking with all details
2. Confirmation shows total budget on same page
3. User clicks "Pay ₹X to Admin" button
4. Payment modal appears with balance check
5. If insufficient funds: offer to add funds (link to payments.html)
6. On success: 
   - Booking marked as PAID ✓
   - Amount transferred to admin wallet
   - Transaction recorded
   - Success modal with confirmation

### 5. **User Dashboard** (New page: user-dashboard.html)
- **Stats**: Total Bookings, Wallet Balance, Amount Paid
- **My Bookings Tab**:
  - Shows all user bookings (paid/pending status)
  - Per-event breakdown with meal details
  - Pay button for unpaid bookings
- **Payment History Tab**:
  - All transactions (outgoing payments, incoming funds, wallet topups)
  - Date, type, amount displayed
  - Color-coded by transaction type

### 6. **Admin Dashboard Enhancement**
- **Stats**: Total Bookings, Total Revenue (from paid), Paid Bookings, Pending Amount
- **All Bookings View**:
  - Color-coded (green for paid, orange for pending)
  - Full event details with meal types
  - Delete capability
- Existing sections: Team Management, Event Assignments, Member Approvals

---

## 🧪 Test Steps (Recommended Order)

### Step 1: Setup & Login
1. Open the app (bookmark or use local server)
2. You'll be redirected to login.html
3. Login as user:
   - Email: `user1@example.com`
   - Password: `user123`
4. Confirm you're redirected to home page with dynamic header

### Step 2: Create a Booking
1. Navigate to "Book Event" (booking.html)
2. Fill form:
   - Bride: "Priya"
   - Groom: "Rajesh"
   - Mobile: "9876543210"
3. For Event 1:
   - Function Type: "Wedding"
   - Destination: Select "Royal Palace Hotel (Delhi)" from dropdown
   - Date: Pick any future date
   - Number of Guests: "100"
   - Meal Type: "Vegetarian 🌱"
   - Meal Tier: Select "Premium Meal" (check the description shown)
4. Click "Create Booking"
5. **Verify**:
   - ✓ Budget calculation: Venue (₹75,000) + Catering (100 × ₹600) = ₹135,000
   - ✓ Confirmation shows on same page
   - ✓ A "Pay ₹135,000 to Admin" button appears

### Step 3: Make Payment (Success Path)
1. Seed user has ₹5,000 in wallet (from DB.js seed data)
2. Click "Pay ₹135,000 to Admin" button
3. **Verify** modal shows:
   - Booking details
   - Your wallet balance: ₹5,000
   - Message: ⚠️ Insufficient balance
4. Click "Add Funds" button
5. You're redirected to payments.html
6. Add ₹150,000 to wallet (any amount > ₹135,000)
7. Return to booking.html or go to "My Dashboard"
8. Find the unpaid booking in "My Bookings" section
9. Click "Pay Now" button again
10. Modal should now show:
    - ✓ Sufficient balance (₹150,000 + ₹5,000)
    - ✓ "Pay Now" button enabled (green)
11. Click "Pay Now"
12. **Verify** success modal:
    - ✅ "Payment Successful!" title
    - Transaction details shown
    - Close button to dismiss
13. Booking should now show as "✓ PAID" in list

### Step 4: Check User Dashboard
1. Navigate to "My Dashboard" (user-dashboard.html)
2. Check stats:
   - Total Bookings: 1
   - Wallet Balance: ₹15,000 (₹5,000 + ₹150,000 - ₹135,000 paid)
   - Amount Paid: ₹135,000
3. **My Bookings Tab**:
   - Show the booking with "✓ PAID" badge
   - Event details: Wedding, Royal Palace Hotel, 100 guests, Vegetarian Premium
   - Per-event budget and total shown
4. **Payment History Tab**:
   - Show 3 transactions:
     1. Wallet top-up: +₹150,000 (orange)
     2. Payment to admin: -₹135,000 (red/pink)
   - Sorted by date (newest first)

### Step 5: Check Admin Dashboard
1. Logout and login as admin:
   - Email: `admin@example.com`
   - Password: `admin123`
2. Navigate to "Admin Panel" (admin.html)
3. **Verify** admin stats:
   - Total Bookings: ≥ 1 (depends on existing data)
   - Total Revenue: ₹135,000+ (from paid bookings)
   - Paid Bookings: ≥ 1
   - Pending Amount: ₹0 (if all paid)
4. **All Bookings** section:
   - Show the booking created above
   - Green background + "✓ PAID" label
   - Full event breakdown displayed
   - Delete button accessible

### Step 6: Create Multi-Event Booking (Optional)
1. Login back as user
2. Go to "Book Event"
3. Fill main form with different names
4. For Event 1: Function "Mehendi", destination, guests, meals (e.g., Non-Veg, Basic)
5. Click "+ Add Another Event"
6. For Event 2: Function "Wedding", different destination, guests, meals (e.g., Vegan, Premium)
7. **Verify**:
   - Two event sections appear
   - Each has independent budget display
   - Total booking budget updates in real-time as you change values
   - Example calculation:
     - Event 1: ₹50,000 (venue) + 50 × ₹400 (non-veg basic) = ₹70,000
     - Event 2: ₹75,000 (venue) + 100 × ₹550 (vegan premium) = ₹130,000
     - Total: ₹200,000

---

## 📊 Expected Data After Testing

### Database (localStorage):
- **users**: user1, admin with updated wallets
- **bookings**: New booking with full event details, meal selections, budget
- **transactions**: Payment records (topup + payment to admin)

### UI States:
- User Dashboard: Shows accurate stats and transaction history
- Admin Dashboard: Shows all bookings with color coding and revenue stats
- Previous Bookings: Updated payment status

---

## 🔍 Files Modified/Created

| File | Change |
|------|--------|
| `js/db.js` | Added MEAL_TYPES, MEAL_TIERS, DESTINATIONS constants |
| `booking.html` | Complete redesign with dropdowns & budget display |
| `main.js` | New booking flow with real-time calculation & payment modal |
| `user-dashboard.html` | NEW: User stats, bookings, payment history |
| `admin.html` | Added stats cards & booking overview |

---

## ✅ Checklist

- [ ] Meal dropdown shows veg/non-veg/vegan options
- [ ] Meal tier descriptions display correctly
- [ ] Budget updates in real-time as selections change
- [ ] Destination dropdown shows venue list with costs
- [ ] Booking confirmation shows correct total
- [ ] Payment modal appears with balance check
- [ ] Insufficient balance prompts to add funds
- [ ] Payment succeeds with sufficient funds
- [ ] Booking marked PAID after successful payment
- [ ] User Dashboard shows correct stats
- [ ] Payment history shows transactions
- [ ] Admin Dashboard shows revenue stats
- [ ] Admin can see all bookings with payment status
- [ ] Multi-event bookings calculate correctly

---

## 🐛 Troubleshooting

**Issue**: Meal tier radio buttons not showing
- **Fix**: Ensure meal-type dropdown change event triggers `updateMealOptions()`

**Issue**: Budget not updating on input change
- **Fix**: Check that all inputs have `onchange="recalculateBudget()"` handler

**Issue**: Payment button disabled after balance insufficient
- **Fix**: Refresh page after adding funds; payment should retry

**Issue**: User Dashboard shows no bookings
- **Fix**: Ensure booking was created by current logged-in user (check createdBy field)

---

## 💡 Notes

- All budgets are in INR (₹)
- Venue costs are base costs (no additional charges in current version)
- Meal costs include only catering (no decoration/photography/DJ added)
- Payments transfer full booking amount to first admin user
- All data persists in localStorage (clears on browser cache clear)

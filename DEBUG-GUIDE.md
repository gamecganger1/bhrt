# 🔧 QUICK TROUBLESHOOTING GUIDE

## Step 1: Start the Local Server
The server is already running on **http://localhost:8000**

## Step 2: Login First
1. Open http://localhost:8000/login.html
2. Click "User" role
3. Enter credentials:
   - Email: `user1@example.com`
   - Password: `user123`
4. Click "Login"

## Step 3: Test Booking Page
1. Go to http://localhost:8000/booking.html
2. **IMPORTANT**: Open DevTools Console (Press **F12** or right-click → Inspect → Console tab)
3. In the console, you should see logs starting with `[initBooking]`
4. **Copy all console logs and paste them here**

## Step 4: Test "Add Another Event" Button
1. In booking.html, fill in:
   - Bride Name: Test
   - Groom Name: User
   - Mobile: 9999999999
2. Click "+ Add Another Event" button
3. **Check if a new event block appears**
4. **If it doesn't, copy the console error and share it**

## Step 5: Test Budget Page
1. Go to http://localhost:8000/budget.html
2. Open DevTools Console (F12)
3. Check if the destination dropdown shows options
4. **Share any console errors**

## What to Report:
- ✅ Screenshot of the console logs
- ✅ Whether "Add Another Event" button creates new blocks
- ✅ Whether budget page selects show options
- ✅ Any red error messages in the console

---

## If You Want Automated Testing:
1. Go to http://localhost:8000/TEST-BOOKING.html
2. Click the "Check Setup" button
3. Share the output

---

This will help me identify exactly where the issue is!

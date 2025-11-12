// Unified database helper for all pages
const DB = {
    // MEAL OPTIONS: type (veg/non-veg/vegan) x tier (basic/premium)
    MEAL_TYPES: {
        veg: { name: 'Vegetarian', icon: '🌱' },
        nonveg: { name: 'Non-Vegetarian', icon: '🍗' },
        vegan: { name: 'Vegan', icon: '🥬' }
    },
    MEAL_TIERS: {
        basic: {
            name: 'Basic Meal',
            description: 'Rice, Dal, Roti, Sabzi, Pickle, Curd',
            costPerPerson: { veg: 300, nonveg: 400, vegan: 280 }
        },
        premium: {
            name: 'Premium Meal',
            description: 'Paneer Butter Masala/Butter Chicken, Biryani, Naan, Multiple Curries, Salad, Dessert, Curd',
            costPerPerson: { veg: 600, nonveg: 750, vegan: 550 }
        }
    },
    // Sub-categories of meal courses for planner UI
    MEAL_SUBTYPES: [
        { id: 'starters', name: 'Starters / Appetizers' },
        { id: 'main', name: 'Main Course' },
        { id: 'dessert', name: 'Dessert' },
        { id: 'sweets', name: 'Traditional Sweets' },
        { id: 'beverages', name: 'Beverages' }
    ],
    // DESTINATIONS: venue name with base cost
    DESTINATIONS: [
        { id: 1, name: 'Green Valley Resort', baseCost: 50000, city: 'Agra' },
        { id: 2, name: 'Royal Palace Hotel', baseCost: 75000, city: 'Delhi' },
        { id: 3, name: 'Taj Convention Center', baseCost: 60000, city: 'Agra' },
        { id: 4, name: 'Marriott Grand', baseCost: 80000, city: 'Mumbai' },
        { id: 5, name: 'Lake View Banquet', baseCost: 45000, city: 'Udaipur' },
        { id: 6, name: 'Palace of Dreams', baseCost: 70000, city: 'Jaipur' }
        ,
        // Additional common venues
        { id: 7, name: 'Shimla Hills Resort', baseCost: 42000, city: 'Shimla' },
        { id: 8, name: 'Manali Meadows', baseCost: 46000, city: 'Manali' },
        { id: 9, name: 'Dharamshala Retreat', baseCost: 38000, city: 'Dharamshala' },
        { id: 10, name: 'Udaipur Palace Grounds', baseCost: 65000, city: 'Udaipur' },
        { id: 11, name: 'Jaipur Royal Lawn', baseCost: 52000, city: 'Jaipur' },
        { id: 12, name: 'Goa Beachside Venue', baseCost: 90000, city: 'Goa' },
        { id: 13, name: 'Kerala Backwaters Resort', baseCost: 75000, city: 'Kerala' },
        { id: 14, name: 'Rishikesh Riverside', baseCost: 32000, city: 'Rishikesh' },
        { id: 15, name: 'Agra Heritage Lawn', baseCost: 48000, city: 'Agra' },
        { id: 16, name: 'Nainital Lakeview', baseCost: 41000, city: 'Nainital' },
        { id: 17, name: 'Mussoorie Garden Estate', baseCost: 39000, city: 'Mussoorie' }
    ],
    
    // Core storage operations
    getItem: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    setItem: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        // Mirror team storage keys for compatibility (other scripts may use 'teamMembers')
        if (key === 'team' || key === 'teamMembers') {
            try {
                localStorage.setItem('team', JSON.stringify(value));
                localStorage.setItem('teamMembers', JSON.stringify(value));
            } catch (e) {
                console.error('Failed to mirror team keys', e);
            }
        }
        // Dispatch a custom event for real-time updates
        window.dispatchEvent(new CustomEvent('db-update', {
            detail: { key, value }
        }));
    },
    // Data-specific operations
    getAllBookings: function() {
        return this.getItem('bookings') || [];
    },
    getAllGuests: function() {
        return this.getItem('guests') || [];
    },
    getAllTeamMembers: function() {
        // Support both 'team' and legacy 'teamMembers' keys
        return this.getItem('team') || this.getItem('teamMembers') || [];
    },
    getAllAssignments: function() {
        return this.getItem('assignments') || [];
    },
    // Enhanced operations
    addBooking: function(booking) {
        const bookings = this.getAllBookings();
        bookings.push({
            ...booking,
            id: Date.now(),
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        this.setItem('bookings', bookings);
        return bookings[bookings.length - 1];
    },
    updateBooking: function(bookingId, updates) {
        const bookings = this.getAllBookings();
        const index = bookings.findIndex(b => String(b.id) === String(bookingId));
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updates };
            this.setItem('bookings', bookings);
            return bookings[index];
        }
        return null;
    },
    deleteBooking: function(bookingId) {
        const bookings = this.getAllBookings();
        const updated = bookings.filter(b => String(b.id) !== String(bookingId));
        this.setItem('bookings', updated);
        
        // Clean up related assignments
        const assignments = this.getAllAssignments();
        const remainingAssignments = assignments.filter(a => 
            String(a.bookingId) !== String(bookingId)
        );
        this.setItem('assignments', remainingAssignments);
        return true;
    },
    addTeamMember: function(member) {
        const members = this.getAllTeamMembers();
        if (members.some(m => m.name === member.name)) {
            return null; // Member already exists
        }
        members.push({
            ...member,
            id: Date.now(),
            status: 'active',
            joinedAt: new Date().toISOString()
        });
        this.setItem('team', members);
        return members[members.length - 1];
    },
    assignEvent: function(bookingId, eventType, teamMemberId) {
        const assignments = this.getAllAssignments();
        const booking = this.getAllBookings().find(b => String(b.id) === String(bookingId));
        const member = this.getAllTeamMembers().find(m => String(m.id) === String(teamMemberId));
        
        if (!booking || !member) return null;
        
        const event = booking.events.find(e => e.functionType === eventType);
        if (!event) return null;
        
        const assignment = {
            id: Date.now(),
            bookingId,
            eventType,
            teamMemberId,
            bookingName: `${booking.bride} & ${booking.groom}`,
            memberName: member.name,
            date: event.date,
            createdAt: new Date().toISOString()
        };
        
        assignments.push(assignment);
        this.setItem('assignments', assignments);
        return assignment;
    },
    removeAssignment: function(assignmentId) {
        const assignments = this.getAllAssignments();
        const updated = assignments.filter(a => String(a.id) !== String(assignmentId));
        this.setItem('assignments', updated);
        return true;
    }
    ,
    // ---------- AUTH & WALLET ----------
    getAllUsers: function() {
        return this.getItem('users') || [];
    },
    saveUsers: function(users) {
        this.setItem('users', users);
    },
    registerUser: function({ name, email, password, role = 'user' }) {
        const users = this.getAllUsers();
        if (users.some(u => u.email === email)) return { error: 'Email already in use' };
        const newUser = { id: Date.now(), name, email, password: btoa(password), role, wallet: 0 };
        // If member registers include approval workflow fields
        if (role === 'member') {
            newUser.approved = false; // requires admin approval
            newUser.requestedSalary = arguments[0].requestedSalary || 0;
            newUser.denied = false;
            newUser.salary = null; // salary will be set when admin approves
        }
        users.push(newUser);
        this.setItem('users', users);
        return { user: newUser };
    },
    loginUser: function({ email, password }) {
        const users = this.getAllUsers();
        const encoded = btoa(password);
        const user = users.find(u => u.email === email && u.password === encoded);
        if (!user) return { error: 'Invalid credentials' };
        // Save session
        localStorage.setItem('currentUser', JSON.stringify({ id: user.id, email: user.email, role: user.role }));
        return { user };
    },
    logout: function() {
        localStorage.removeItem('currentUser');
    },
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    },
    // -------- Member approval workflow --------
    getPendingMembers: function() {
        return this.getAllUsers().filter(u => u.role === 'member' && !u.approved && !u.denied);
    },
    approveMember: function(memberId, acceptedSalary) {
        const users = this.getAllUsers();
        const u = users.find(x => String(x.id) === String(memberId));
        if (!u) return { error: 'Member not found' };
        u.approved = true;
        u.denied = false;
        u.salary = Number(acceptedSalary) || Number(u.requestedSalary) || 0;
        this.setItem('users', users);
        return { ok: true, user: u };
    },
    denyMember: function(memberId) {
        const users = this.getAllUsers();
        const u = users.find(x => String(x.id) === String(memberId));
        if (!u) return { error: 'Member not found' };
        u.denied = true;
        u.approved = false;
        this.setItem('users', users);
        return { ok: true };
    },
    // Wallet operations (simulate)
    addFundsToUser: function(userId, amount, note = 'deposit') {
        const users = this.getAllUsers();
        const u = users.find(x => String(x.id) === String(userId));
        if (!u) return { error: 'User not found' };
        u.wallet = (u.wallet || 0) + Number(amount);
        this.setItem('users', users);
        // record transaction
        const tx = this.getItem('transactions') || [];
        // Represent top-ups as incoming transactions: from system -> user
        tx.push({ id: Date.now(), type: 'deposit', from: 'system', to: u.id, amount: Number(amount), note, date: new Date().toISOString() });
        this.setItem('transactions', tx);
        return { ok: true, user: u };
    },
    userPayAdmin: function(userId, amount) {
        amount = Number(amount);
        const users = this.getAllUsers();
        const payer = users.find(u => String(u.id) === String(userId));
        const admin = users.find(u => u.role === 'admin');
        if (!payer || !admin) return { error: 'Payer or admin not found' };
        if ((payer.wallet || 0) < amount) return { error: 'Insufficient balance' };
        payer.wallet -= amount;
        admin.wallet = (admin.wallet || 0) + amount;
        this.setItem('users', users);
        const tx = this.getItem('transactions') || [];
        tx.push({ id: Date.now(), type: 'user->admin', from: payer.id, to: admin.id, amount, date: new Date().toISOString() });
        this.setItem('transactions', tx);
        return { ok: true };
    },
    adminPayMember: function(adminId, memberId, amount) {
        amount = Number(amount);
        const users = this.getAllUsers();
        const admin = users.find(u => String(u.id) === String(adminId) && u.role === 'admin');
        const member = users.find(u => String(u.id) === String(memberId));
        if (!admin || !member) return { error: 'Admin or member not found' };
        if ((admin.wallet || 0) < amount) return { error: 'Admin has insufficient balance' };
        admin.wallet -= amount;
        member.wallet = (member.wallet || 0) + amount;
        this.setItem('users', users);
        const tx = this.getItem('transactions') || [];
        tx.push({ id: Date.now(), type: 'admin->member', from: admin.id, to: member.id, amount, date: new Date().toISOString() });
        this.setItem('transactions', tx);
        return { ok: true };
    },
    getTransactions: function() {
        return this.getItem('transactions') || [];
    }
};

// Seed sample users/transactions if missing (non-destructive)
if (!DB.getAllUsers().length) {
    DB.setItem('users', [
        { id: 1, name: 'Admin', email: 'admin@example.com', password: btoa('admin123'), role: 'admin', wallet: 100000 },
        { id: 2, name: 'Member One', email: 'member1@example.com', password: btoa('member123'), role: 'member', wallet: 0, approved: true, salary: 20000 },
        { id: 3, name: 'User One', email: 'user1@example.com', password: btoa('user123'), role: 'user', wallet: 5000 }
    ]);
}


// Event names enumeration
const EventTypes = {
    HALDI: 'Haldi',
    MEHENDI: 'Mehendi',
    SANGEET: 'Sangeet',
    WEDDING: 'Wedding',
    RECEPTION: 'Reception'
};

// Utility functions
const Utils = {
    formatDate: function(isoString) {
        return new Date(isoString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    formatTime: function(isoString) {
        return new Date(isoString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    validateMobile: function(mobile) {
        return /^[6-9]\d{9}$/.test(mobile);
    },
    validateEmail: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// Export for use in other files
window.DB = DB;
window.EventTypes = EventTypes;
window.Utils = Utils;
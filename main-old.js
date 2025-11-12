// ---------- DATABASE FUNCTIONS ----------
const DB = {
  init: function() {
    // Initialize database with sample data if it's empty
    if (!localStorage.getItem('dbInitialized')) {
      console.log('Initializing database...');
      
      // Sample team members
      const teamMembers = [
        { id: 1, name: "Rahul Singh", role: "Event Manager" },
        { id: 2, name: "Priya Patel", role: "Decorator" },
        { id: 3, name: "Amit Kumar", role: "Catering Manager" }
      ];
      
      // Sample bookings
      const bookings = [
        {
          id: Date.now(),
          bride: "Anjali Sharma",
          groom: "Rohit Verma",
          mobile: "9876543210",
          events: [
            {
              functionType: "Mehendi",
              destination: "Green Valley Resort",
              date: "2025-12-15"
            },
            {
              functionType: "Wedding",
              destination: "Royal Palace Hotel",
              date: "2025-12-17"
            }
          ],
          bookingDate: new Date().toISOString()
        }
      ];
      
      // Sample budget plans
      const budgetPlans = [
        {
          id: Date.now(),
          eventType: "wedding",
          venueName: "Royal Palace Hotel",
          venueCost: 150000,
          foodCostPerGuest: 1200,
          expectedGuests: 250,
          decorationCost: 75000,
          decorationType: "premium",
          additionalServices: [
            { name: "photography", cost: 25000 },
            { name: "dj", cost: 15000 }
          ],
          miscCost: 30000,
          miscDetails: "Transportation and accommodation",
          totalCost: 570000,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Sample assignments
      const assignments = [
        {
          id: Date.now(),
          eventType: "Mehendi",
          memberName: "Priya Patel",
          bookingId: bookings[0].id,
          createdAt: new Date().toISOString()
        }
      ];
      
      // Initialize all data stores
      this.setItem('teamMembers', teamMembers);
      this.setItem('bookings', bookings);
      this.setItem('budgetPlans', budgetPlans);
      this.setItem('assignments', assignments);
      
      // Mark database as initialized
      localStorage.setItem('dbInitialized', 'true');
      console.log('Database initialized successfully!');
    }
  },
  
  clearDatabase: function() {
    localStorage.clear();
    console.log('Database cleared successfully!');
    this.init(); // Reinitialize with sample data
  },
  
  getItem: function(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  setItem: function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch storage event for cross-page updates
    window.dispatchEvent(new Event('storage'));
  },
  
  getAllBookings: function() {
    return this.getItem('bookings') || [];
  },
  
  getAllTeamMembers: function() {
    return this.getItem('teamMembers') || [];
  },
  
  getAllAssignments: function() {
    return this.getItem('assignments') || [];
  }
};

// ---------- BOOKING ----------
const form = document.getElementById("bookForm");
if (form) {
  const eventContainer = document.getElementById("eventContainer");
  const addMoreEventsBtn = document.getElementById("addMoreEvents");
  const bookingsList = document.getElementById("bookingsList");

  // Function to add new event entry
  function addEventEntry(isFirst = false) {
    const eventCount = document.querySelectorAll('.event-entry').length + 1;
    const eventDiv = document.createElement('div');
    eventDiv.className = 'event-entry';
    eventDiv.innerHTML = `
      <h3>Event ${eventCount}</h3>
      ${!isFirst ? '<button class="remove-event" onclick="this.parentElement.remove()">×</button>' : ''}
      <label>Function Type:</label>
      <select class="function-type" required>
        <option value="">Select Function</option>
        <option value="Haldi">Haldi</option>
        <option value="Mehendi">Mehendi</option>
        <option value="Sangeet">Sangeet</option>
        <option value="Wedding">Wedding</option>
        <option value="Reception">Reception</option>
      </select>

      <label>Destination:</label>
      <input type="text" class="destination" required>

      <label>Date:</label>
      <input type="date" class="event-date" required>
      
      <label>Expected Guests:</label>
      <input type="number" class="expected-guests" min="1" placeholder="Number of guests" required>

      <label>Food Options (select all that apply):</label>
      <div class="checkbox-group event-food-options">
        <label><input type="checkbox" class="food-opt" data-cost="400"> Vegetarian (₹400/guest)</label>
        <label><input type="checkbox" class="food-opt" data-cost="550"> Non-Veg (₹550/guest)</label>
        <label><input type="checkbox" class="food-opt" data-cost="120"> Drinks (₹120/guest)</label>
        <label><input type="checkbox" class="food-opt" data-cost="150"> Desserts (₹150/guest)</label>
      </div>
    `;
    eventContainer.appendChild(eventDiv);
  }

  // Add more events button click handler
  addMoreEventsBtn.addEventListener('click', () => addEventEntry());

  // Load previous bookings
  function loadPreviousBookings() {
    const current = JSON.parse(localStorage.getItem('currentUser')) || null;
    let bookings = DB.getAllBookings();
    // If a non-admin user is logged in, show only their bookings
    if (current && current.role !== 'admin') {
      bookings = bookings.filter(b => String(b.createdBy) === String(current.id));
    }
    if (!current) {
      bookingsList.innerHTML = '<p>Please <a href="user-login.html">login</a> to see your bookings.</p>';
      return;
    }
    bookingsList.innerHTML = bookings.map(booking => `
      <div class="booking-card">
        <button class="delete-booking" onclick="deleteBooking('${booking.id}')">Delete</button>
        <h4>${booking.bride} & ${booking.groom}</h4>
        <p>📱 Contact: ${booking.mobile}</p>
        ${booking.events.map(event => `
          <div>
            <p>🎉 ${event.functionType} ${event.expectedGuests ? `— ${event.expectedGuests} guests` : ''}</p>
            <p>📍 ${event.destination}</p>
            <p>📅 ${event.date}</p>
            ${event.eventBudget ? `<p>Estimated Budget: ₹${Number(event.eventBudget).toLocaleString()}</p>` : ''}
          </div>
        `).join('')}
        ${booking.totalBudget ? `<div style="margin-top:8px;font-weight:600">Total Estimated Budget: ₹${Number(booking.totalBudget).toLocaleString()}</div>` : ''}
        ${booking.paid ? `<div style="color:green;margin-top:6px;font-weight:700">PAID ✓</div>` : (current && current.role === 'user' && String(booking.createdBy) === String(current.id) && booking.totalBudget ? `<button onclick="payBooking('${booking.id}')">Pay ₹${Number(booking.totalBudget).toLocaleString()}</button>` : '')}
      </div>
    `).join('');
  }

  // Form submit handler
  form.addEventListener("submit", e => {
    e.preventDefault();
    // Require user to be logged in before booking
    const current = JSON.parse(localStorage.getItem('currentUser')) || null;
    if (!current) {
      alert('You must be logged in to create a booking. Please login or register.');
      window.location.href = 'login.html';
      return;
    }
    const bride = document.getElementById("bride").value;
    const groom = document.getElementById("groom").value;
    const mobile = document.getElementById("mobile").value;

    // Collect all events
    const events = Array.from(document.querySelectorAll('.event-entry')).map(entry => ({
      functionType: entry.querySelector('.function-type').value,
      destination: entry.querySelector('.destination').value,
      date: entry.querySelector('.event-date').value
    }));

    // Compute per-event budgets automatically based on expected guests and selected food items
    let totalBookingBudget = 0;
    const enrichedEvents = events.map((event, idx) => {
      const entry = document.querySelectorAll('.event-entry')[idx];
      const expectedGuests = Number(entry.querySelector('.expected-guests').value) || 0;
      const foodCheckboxes = Array.from(entry.querySelectorAll('.food-opt'));
      const selectedFoods = foodCheckboxes.filter(cb => cb.checked).map(cb => ({ name: cb.parentElement.textContent.trim(), costPerGuest: Number(cb.dataset.cost) }));
      const perGuestCost = selectedFoods.reduce((s, f) => s + f.costPerGuest, 0);
      const eventBudget = perGuestCost * expectedGuests;
      totalBookingBudget += eventBudget;
      return Object.assign({}, event, { expectedGuests, selectedFoods, eventBudget });
    });

    const booking = { 
      id: Date.now(),
      bride, 
      groom, 
      mobile,
      events: enrichedEvents,
      totalBudget: totalBookingBudget,
      paid: false,
      paymentInfo: null,
      createdBy: current.id || null,
      bookingDate: new Date().toISOString()
    };

    // Save to localStorage
    const bookings = DB.getAllBookings();
    bookings.push(booking);
    DB.setItem('bookings', bookings);

    // Show success (no payment required yet) and display computed budget + Pay button
    document.getElementById("bookingResult").innerHTML = `
      <p>✅ Booking confirmed for <b>${bride}</b> & <b>${groom}</b><br>
      ${enrichedEvents.map(event => 
        `🎉 ${event.functionType} on ${event.date} at ${event.destination} — Estimated Budget: ₹${event.eventBudget.toLocaleString()} (${event.expectedGuests} guests)`
      ).join('<br>')}<br>
      <strong>Total Estimated Budget: ₹${totalBookingBudget.toLocaleString()}</strong>
      </p>
      ${totalBookingBudget > 0 ? `<button id="pay-now-${booking.id}" onclick="payBooking('${booking.id}')">Pay ₹${totalBookingBudget.toLocaleString()} to Admin</button>` : ''}
    `;
    
    form.reset();
    eventContainer.innerHTML = '';
    addEventEntry(true); // Add back the first event entry
    loadPreviousBookings();

    // No payment step required; remain on page with confirmation
  });

  // Initialize first event entry and load previous bookings
  addEventEntry(true);
  loadPreviousBookings();
}

// ---------- GUEST LIST ----------
if (document.getElementById("guestList")) {
  const guestList = document.getElementById("guestList");
  const guestName = document.getElementById("guestName");

  // Load existing guests
  const loadGuests = () => {
    const guests = DB.getAllGuests();
    guestList.innerHTML = '';
    guests.forEach(guest => {
      const li = document.createElement("li");
      li.textContent = guest.name;
      li.dataset.id = guest.id;
      li.onclick = () => deleteGuest(guest.id);
      guestList.appendChild(li);
    });
  };

  // Delete guest
  const deleteGuest = (id) => {
    const guests = DB.getAllGuests();
    const updatedGuests = guests.filter(guest => guest.id !== id);
    DB.setItem('guests', updatedGuests);
    loadGuests();
  };

  // Add new guest
  document.getElementById("addGuest").onclick = () => {
    if (guestName.value.trim()) {
      const guests = DB.getAllGuests();
      const newGuest = {
        id: Date.now(),
        name: guestName.value.trim()
      };
      guests.push(newGuest);
      DB.setItem('guests', guests);
      
      const li = document.createElement("li");
      li.textContent = newGuest.name;
      li.dataset.id = newGuest.id;
      li.onclick = () => deleteGuest(newGuest.id);
      guestList.appendChild(li);
      guestName.value = "";
    }
  };

  // Load guests when page loads
  loadGuests();
}

// Delete booking function
function deleteBooking(bookingId) {
  // Permission check: only admin or the user who created the booking can delete
  const cur = JSON.parse(localStorage.getItem('currentUser')) || null;
  if (!cur) {
    alert('You must be logged in to delete a booking');
    return;
  }
  const bookings = DB.getAllBookings();
  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) return alert('Booking not found');
  if (cur.role !== 'admin' && String(booking.createdBy) !== String(cur.id)) {
    return alert('You do not have permission to delete this booking');
  }
  if (!confirm('Are you sure you want to delete this booking?')) return;

  const updated = bookings.filter(b => String(b.id) !== String(bookingId));
  DB.setItem('bookings', updated);

  // Also clean up any assignments for this booking
  const assignments = DB.getAllAssignments();
  const remainingAssignments = assignments.filter(a => String(a.bookingId) !== String(bookingId));
  DB.setItem('assignments', remainingAssignments);

  loadPreviousBookings();
}

// Pay for a booking (user -> admin)
function payBooking(bookingId) {
  const cur = DB.getCurrentUser() || JSON.parse(localStorage.getItem('currentUser')) || null;
  if (!cur) return alert('You must be logged in to make a payment');
  if (cur.role !== 'user') return alert('Only users can pay for bookings');

  const bookings = DB.getAllBookings();
  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) return alert('Booking not found');
  if (booking.paid) return alert('This booking is already paid');
  const amount = Number(booking.totalBudget) || 0;
  if (amount <= 0) return alert('Nothing to pay for this booking');

  if (!confirm(`Pay ₹${amount.toLocaleString()} to the admin for this booking?`)) return;

  const res = DB.userPayAdmin(cur.id, amount);
  if (res && res.error) {
    if (res.error.toLowerCase().includes('insufficient')) {
      if (confirm('Insufficient balance. Would you like to add funds to your wallet now?')) {
        window.location.href = 'payments.html';
      }
      return;
    }
    return alert('Payment failed: ' + res.error);
  }

  // mark booking as paid
  booking.paid = true;
  booking.paymentInfo = { amount, date: new Date().toISOString() };
  DB.setItem('bookings', bookings);
  Utils.showToast('Payment successful', 'success');
  // update UI
  loadPreviousBookings();
  const payBtn = document.getElementById('pay-now-' + booking.id);
  if (payBtn) payBtn.disabled = true;
}


// ---------- BUDGET CALCULATOR ----------
if (document.getElementById("calcBudget")) {
  document.getElementById("calcBudget").onclick = () => {
    const venue = +document.getElementById("venue").value;
    const foodCost = +document.getElementById("foodCost").value;
    const decor = +document.getElementById("decor").value;
    const guests = +document.getElementById("guestCount").value;
    const total = venue + decor + (foodCost * guests);
    document.getElementById("totalBudget").textContent = `Estimated Total Budget: ₹${total}`;
  };
}

// ---------- ADMIN TEAM ----------
if (document.getElementById("addMember")) {
  const teamList = document.getElementById("teamList");
  const memberName = document.getElementById("memberName");
  const assignSelect = document.getElementById("assignMember");
  const assignedEvents = document.getElementById("assignedEvents");

  // Load existing team members
  const loadTeamMembers = () => {
    const members = DB.getAllTeamMembers();
    teamList.innerHTML = '';
    assignSelect.innerHTML = '<option value="">Select Member</option>';
    
    members.forEach(member => {
      const li = document.createElement("li");
      li.textContent = member.name + " (Team Member)";
      teamList.appendChild(li);

      const opt = document.createElement("option");
      opt.value = member.name;
      opt.textContent = member.name;
      assignSelect.appendChild(opt);
    });
  };

  // Load existing assignments
  const loadAssignments = () => {
    const assignments = DB.getAllAssignments();
    assignedEvents.innerHTML = '';
    
    assignments.forEach(assignment => {
      const div = document.createElement("div");
      div.innerHTML = `🎯 Event <b>${assignment.event}</b> assigned to <b>${assignment.member}</b>`;
      assignedEvents.appendChild(div);
    });
  };

  // Add new team member
  document.getElementById("addMember").onclick = () => {
    if (memberName.value.trim()) {
      const members = DB.getAllTeamMembers();
      const newMember = {
        id: Date.now(),
        name: memberName.value.trim()
      };
      members.push(newMember);
      DB.setItem('teamMembers', members);
      
      const li = document.createElement("li");
      li.textContent = newMember.name + " (Team Member)";
      teamList.appendChild(li);

      const opt = document.createElement("option");
      opt.value = newMember.name;
      opt.textContent = newMember.name;
      assignSelect.appendChild(opt);
      memberName.value = "";
    }
  };

  // Assign event to team member
  document.getElementById("assignEvent").onclick = () => {
    const event = document.getElementById("eventName").value;
    const member = assignSelect.value;
    if (event && member) {
      const assignments = DB.getAllAssignments();
      const newAssignment = {
        id: Date.now(),
        event,
        member
      };
      assignments.push(newAssignment);
      DB.setItem('assignments', assignments);
      
      const div = document.createElement("div");
      div.innerHTML = `🎯 Event <b>${event}</b> assigned to <b>${member}</b>`;
      assignedEvents.appendChild(div);
      document.getElementById("eventName").value = "";
    }
  };

  // Load data when page loads
  loadTeamMembers();
  loadAssignments();
}
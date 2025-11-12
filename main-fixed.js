// ========== BOOKING PAGE LOGIC ==========
// Simple, direct implementation - no async issues

function addEventToBooking() {
  console.log('addEventToBooking called');
  const eventContainer = document.getElementById("eventContainer");
  if (!eventContainer) {
    alert('Event container not found');
    return;
  }

  const entryIndex = eventContainer.querySelectorAll('.event-entry').length;
  
  // Build HTML with proper structure
  const eventHTML = `
    <div class="event-entry" style="border: 2px solid #ffb347; padding: 20px; margin: 15px 0; border-radius: 8px; position: relative; background: #fff5e6;">
      <h3>Event ${entryIndex + 1}</h3>
      ${entryIndex > 0 ? '<button type="button" class="remove-event" style="position: absolute; top: 10px; right: 10px; background: #ff4081; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>' : ''}
      
      <label><strong>Function Type:</strong></label>
      <select class="function-type" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" required>
        <option value="">Select Function</option>
        <option value="Haldi">Haldi</option>
        <option value="Mehendi">Mehendi</option>
        <option value="Sangeet">Sangeet</option>
        <option value="Wedding">Wedding</option>
        <option value="Reception">Reception</option>
      </select>

      <label style="display: block; margin-top: 15px;"><strong>Select Destination (Venue):</strong></label>
      <select class="destination-select" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" required>
        <option value="">Choose Venue...</option>
      </select>

      <label style="display: block; margin-top: 15px;"><strong>Date:</strong></label>
      <input type="date" class="event-date" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" required>

      <label style="display: block; margin-top: 15px;"><strong>Number of Guests:</strong></label>
      <input type="number" class="num-guests" min="1" placeholder="Expected number of guests" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" required>

      <label style="display: block; margin-top: 15px;"><strong>Meal Type:</strong></label>
      <select class="meal-type" style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;" required>
        <option value="">Select Meal Type</option>
        <option value="veg">Vegetarian 🌱</option>
        <option value="nonveg">Non-Vegetarian 🍗</option>
        <option value="vegan">Vegan 🥬</option>
      </select>

      <label style="display: block; margin-top: 15px;"><strong>Meal Tier:</strong></label>
      <div class="meal-tier-options" style="margin: 10px 0;"></div>

      <div class="event-budget-display" style="margin-top: 15px;"></div>
    </div>
  `;

  // Create and append the entry
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = eventHTML;
  const entry = tempDiv.firstChild;
  eventContainer.appendChild(entry);

  // NOW populate destinations after appending
  const destSelect = entry.querySelector('.destination-select');
  if (window.DB && DB.DESTINATIONS && DB.DESTINATIONS.length > 0) {
    DB.DESTINATIONS.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.name} (${d.city}) - Base: ₹${d.baseCost.toLocaleString()}`;
      destSelect.appendChild(opt);
    });
  }

  // Attach event listeners
  const removeBtn = entry.querySelector('.remove-event');
  if (removeBtn) {
    removeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      entry.remove();
      recalculateBudget();
    });
  }

  const mealTypeSelect = entry.querySelector('.meal-type');
  mealTypeSelect.addEventListener('change', function() {
    updateMealTiers(entry);
    recalculateBudget();
  });

  // Listen to all inputs for recalc
  const selects = entry.querySelectorAll('select, input');
  selects.forEach(sel => {
    sel.addEventListener('change', recalculateBudget);
    sel.addEventListener('input', recalculateBudget);
  });

  // Trigger initial meal tier update if meal type is selected
  if (mealTypeSelect.value) {
    updateMealTiers(entry);
  }

  recalculateBudget();
}

function updateMealTiers(entry) {
  const mealType = entry.querySelector('.meal-type').value;
  const tierContainer = entry.querySelector('.meal-tier-options');

  if (!mealType) {
    tierContainer.innerHTML = '';
    return;
  }

  if (!window.DB || !DB.MEAL_TIERS) {
    tierContainer.innerHTML = '<p style="color: #999;">Meal tiers not available</p>';
    return;
  }

  tierContainer.innerHTML = '';
  Object.keys(DB.MEAL_TIERS).forEach(tierKey => {
    const tier = DB.MEAL_TIERS[tierKey];
    const cost = tier.costPerPerson[mealType] || 0;
    const radioId = 'tier-' + Math.random().toString(36).slice(2, 9);

    const tierDiv = document.createElement('div');
    tierDiv.style.cssText = 'border: 1px solid #ddd; padding: 12px; margin: 10px 0; border-radius: 5px; background: #f9f9f9;';
    tierDiv.innerHTML = `
      <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0;">
        <input type="radio" name="meal-tier-${Math.random().toString(36).slice(2,7)}" value="${tierKey}" class="meal-tier" data-cost="${cost}" id="${radioId}">
        <div>
          <strong>${tier.name}</strong>
          <div style="color: #666; font-size: 0.9em; margin: 5px 0;">${tier.description}</div>
          <div style="color: #d32f2f; font-weight: bold;">₹${cost} per guest</div>
        </div>
      </label>
    `;
    tierContainer.appendChild(tierDiv);
  });

  // Attach listeners to radios
  tierContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', recalculateBudget);
  });
}

function recalculateBudget() {
  console.log('recalculateBudget called');
  const entries = document.querySelectorAll('.event-entry');
  let totalBudget = 0;

  entries.forEach((entry, idx) => {
    const numGuests = Number(entry.querySelector('.num-guests').value) || 0;
    const destinationId = entry.querySelector('.destination-select').value;
    const mealTierRadio = entry.querySelector('.meal-tier:checked');
    const mealCostPerGuest = mealTierRadio ? Number(mealTierRadio.dataset.cost) : 0;

    let venueCost = 0;
    if (window.DB && DB.DESTINATIONS) {
      const dest = DB.DESTINATIONS.find(d => String(d.id) === String(destinationId));
      venueCost = dest ? dest.baseCost : 0;
    }

    const cateringCost = numGuests * mealCostPerGuest;
    const eventBudget = venueCost + cateringCost;
    totalBudget += eventBudget;

    // Update event budget display
    const budgetDisplay = entry.querySelector('.event-budget-display');
    budgetDisplay.innerHTML = `
      <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; margin: 6px 0;">
          <span>Venue Cost:</span>
          <span>₹${venueCost.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 6px 0;">
          <span>Catering (${numGuests} guests × ₹${mealCostPerGuest}):</span>
          <span>₹${cateringCost.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 6px 0; font-size: 1.2em; font-weight: bold; color: #1b5e20; margin-top: 10px; padding-top: 10px; border-top: 2px solid #4caf50;">
          <span>Event Total:</span>
          <span>₹${eventBudget.toLocaleString()}</span>
        </div>
      </div>
    `;
  });

  // Update total
  const bookingResultDiv = document.getElementById("bookingResult");
  if (bookingResultDiv && totalBudget > 0) {
    const existingTotal = bookingResultDiv.querySelector('.total-booking-budget');
    if (existingTotal) {
      existingTotal.innerHTML = `
        <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 4px;">
          <strong style="font-size: 1.3em; color: #e65100;">Total Booking Budget: ₹${totalBudget.toLocaleString()}</strong>
        </div>
      `;
    }
  }
}

function loadPreviousBookings() {
  const current = JSON.parse(localStorage.getItem('currentUser')) || null;
  let bookings = DB.getAllBookings();
  
  if (current && current.role !== 'admin') {
    bookings = bookings.filter(b => String(b.createdBy) === String(current.id));
  }

  const bookingsList = document.getElementById('bookingsList');
  if (!bookingsList) return;

  if (!current) {
    bookingsList.innerHTML = '<p>Login to see your bookings.</p>';
    return;
  }

  if (bookings.length === 0) {
    bookingsList.innerHTML = '<p>No bookings yet.</p>';
    return;
  }

  bookingsList.innerHTML = bookings.map(booking => `
    <div style="background: #fff3e0; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #ffb347;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h4>${booking.bride} & ${booking.groom}</h4>
          <p>📱 ${booking.mobile}</p>
          ${booking.events.map((event, idx) => `
            <div style="margin-top: 8px; padding: 8px; background: white; border-radius: 4px;">
              <p><strong>Event ${idx + 1}:</strong> ${event.functionType}</p>
              <p>📍 ${event.destination}</p>
              <p>📅 ${new Date(event.date).toLocaleDateString()}</p>
              <p>👥 ${event.numGuests} guests | ${event.mealType} | ${event.mealTier}</p>
              <p style="color: #d32f2f; font-weight: bold;">Event Budget: ₹${event.eventBudget.toLocaleString()}</p>
            </div>
          `).join('')}
          <div style="margin-top: 12px; padding: 10px; background: #fff3e0; border-radius: 4px;">
            <strong style="color: #e65100;">Total Booking Budget: ₹${booking.totalBudget.toLocaleString()}</strong>
          </div>
          ${booking.paid ? `<div style="color: white; background: #4caf50; padding: 5px 10px; border-radius: 3px; font-weight: bold; margin-top: 10px; display: inline-block;">✓ PAID</div>` : `<div style="color: white; background: #ff9800; padding: 5px 10px; border-radius: 3px; font-weight: bold; margin-top: 10px; display: inline-block;">⏳ PENDING</div>`}
        </div>
        <div style="text-align: right;">
          <button onclick="deleteBooking('${booking.id}')" style="background: #f44336; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
          ${!booking.paid && booking.totalBudget > 0 ? `<button onclick="payBooking('${booking.id}')" style="background: #4caf50; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">Pay Now</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

function initializeBookingPage() {
  const form = document.getElementById('bookForm');
  if (!form) {
    console.error('bookForm not found');
    return;
  }

  const addBtn = document.getElementById('addMoreEvents');
  if (addBtn) {
    addBtn.onclick = function(e) {
      e.preventDefault();
      addEventToBooking();
    };
  }

  // Add first event
  addEventToBooking();
  loadPreviousBookings();

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const current = JSON.parse(localStorage.getItem('currentUser')) || null;
    if (!current) {
      alert('You must be logged in to create a booking.');
      window.location.href = 'login.html';
      return;
    }

    const bride = document.getElementById('bride').value;
    const groom = document.getElementById('groom').value;
    const mobile = document.getElementById('mobile').value;

    const entries = document.querySelectorAll('.event-entry');
    let totalBudget = 0;

    const events = Array.from(entries).map(entry => {
      const functionType = entry.querySelector('.function-type').value;
      const destinationId = entry.querySelector('.destination-select').value;
      const destination = DB.DESTINATIONS.find(d => String(d.id) === String(destinationId));
      const destinationName = destination ? destination.name : '';
      const eventDate = entry.querySelector('.event-date').value;
      const numGuests = Number(entry.querySelector('.num-guests').value) || 0;
      const mealType = entry.querySelector('.meal-type').value;
      const mealTierRadio = entry.querySelector('.meal-tier:checked');
      const mealTier = mealTierRadio ? mealTierRadio.value : '';
      const mealCostPerGuest = mealTierRadio ? Number(mealTierRadio.dataset.cost) : 0;

      const venueCost = destination ? destination.baseCost : 0;
      const cateringCost = numGuests * mealCostPerGuest;
      const eventBudget = venueCost + cateringCost;
      totalBudget += eventBudget;

      return {
        functionType,
        destination: destinationName,
        date: eventDate,
        numGuests,
        mealType,
        mealTier,
        mealCostPerGuest,
        venueCost,
        cateringCost,
        eventBudget
      };
    });

    const booking = {
      id: Date.now(),
      bride,
      groom,
      mobile,
      events,
      totalBudget,
      paid: false,
      paymentInfo: null,
      createdBy: current.id,
      createdAt: new Date().toISOString()
    };

    const bookings = DB.getAllBookings();
    bookings.push(booking);
    DB.setItem('bookings', bookings);

    // Show confirmation
    const bookingResultDiv = document.getElementById('bookingResult');
    bookingResultDiv.innerHTML = `
      <div style="background: #e8f5e9; border: 2px solid #4caf50; padding: 15px; border-radius: 8px;">
        <h3 style="color: #2e7d32;">✅ Booking Created Successfully</h3>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
        <p><strong>For:</strong> ${bride} & ${groom}</p>
        <div class="total-booking-budget">
          <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; border-radius: 4px;">
            <strong style="font-size: 1.3em; color: #e65100;">Total Booking Budget: ₹${totalBudget.toLocaleString()}</strong>
          </div>
        </div>
        ${totalBudget > 0 ? `<button onclick="payBooking('${booking.id}')" style="background: #4caf50; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; width: 100%;">Pay ₹${totalBudget.toLocaleString()} to Admin</button>` : ''}
      </div>
    `;

    form.reset();
    const eventContainer = document.getElementById('eventContainer');
    eventContainer.innerHTML = '';
    addEventToBooking();
    loadPreviousBookings();
  });

  // Expose to window for other pages
  window.addEventToBooking = addEventToBooking;
  window.recalculateBudget = recalculateBudget;
  window.loadPreviousBookings = loadPreviousBookings;
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBookingPage);
} else {
  initializeBookingPage();
}

// ========== PAYMENT LOGIC ==========
function payBooking(bookingId) {
  const cur = DB.getCurrentUser() || JSON.parse(localStorage.getItem('currentUser')) || null;
  if (!cur) return alert('You must be logged in to pay.');
  if (cur.role !== 'user') return alert('Only users can pay for bookings.');

  const bookings = DB.getAllBookings();
  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) return alert('Booking not found.');
  if (booking.paid) return alert('This booking is already paid.');

  const amount = Number(booking.totalBudget) || 0;
  if (amount <= 0) return alert('Nothing to pay.');

  showPaymentModal(booking, cur);
}

function showPaymentModal(booking, user) {
  const modal = document.createElement('div');
  modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;`;
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
      <h3>Confirm Payment</h3>
      <div style="background: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <p><strong>Booking:</strong> ${booking.bride} & ${booking.groom}</p>
        <p><strong>Amount:</strong> ₹${booking.totalBudget.toLocaleString()}</p>
        <p><strong>Your Wallet Balance:</strong> ₹${(user.wallet || 0).toLocaleString()}</p>
        ${(user.wallet || 0) < booking.totalBudget ? `<p style="color: red; font-weight: bold;">⚠️ Insufficient balance!</p>` : `<p style="color: green;">✓ Sufficient balance</p>`}
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="flex: 1; padding: 10px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer; border-radius: 4px;">Cancel</button>
        ${(user.wallet || 0) >= booking.totalBudget ? `<button onclick="confirmPayment('${booking.id}'); this.parentElement.parentElement.parentElement.remove();" style="flex: 1; padding: 10px; background: #4caf50; color: white; border: none; cursor: pointer; border-radius: 4px; font-weight: bold;">Pay Now</button>` : `<button onclick="window.location.href='payments.html';" style="flex: 1; padding: 10px; background: #ff9800; color: white; border: none; cursor: pointer; border-radius: 4px; font-weight: bold;">Add Funds</button>`}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmPayment(bookingId) {
  const cur = DB.getCurrentUser() || JSON.parse(localStorage.getItem('currentUser')) || null;
  if (!cur) return alert('User not found.');

  const bookings = DB.getAllBookings();
  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) return alert('Booking not found.');

  const amount = Number(booking.totalBudget) || 0;
  const res = DB.userPayAdmin(cur.id, amount);

  if (res && res.error) {
    alert('Payment failed: ' + res.error);
    if (res.error.toLowerCase().includes('insufficient')) {
      window.location.href = 'payments.html';
    }
    return;
  }

  booking.paid = true;
  booking.paymentInfo = { amount, date: new Date().toISOString() };
  DB.setItem('bookings', bookings);

  showSuccessModal(booking, amount);

  const loadFn = window.loadPreviousBookings;
  if (loadFn) loadFn();
}

function showSuccessModal(booking, amount) {
  const modal = document.createElement('div');
  modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001;`;
  modal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); text-align: center;">
      <div style="font-size: 3em; margin-bottom: 15px;">✅</div>
      <h3 style="color: #2e7d32; margin: 0 0 15px 0;">Payment Successful!</h3>
      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>${booking.bride} & ${booking.groom}</strong></p>
        <p>Amount: ₹${amount.toLocaleString()}</p>
      </div>
      <p style="color: #666; font-size: 0.9em;">Transaction has been recorded and payment transferred to admin wallet.</p>
      <button onclick="this.parentElement.parentElement.remove();" style="padding: 10px 20px; background: #4caf50; color: white; border: none; cursor: pointer; border-radius: 4px; font-weight: bold;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function deleteBooking(bookingId) {
  const cur = JSON.parse(localStorage.getItem('currentUser')) || null;
  if (!cur) return alert('You must be logged in.');

  const bookings = DB.getAllBookings();
  const booking = bookings.find(b => String(b.id) === String(bookingId));
  if (!booking) return alert('Booking not found.');
  if (cur.role !== 'admin' && String(booking.createdBy) !== String(cur.id)) {
    return alert('You do not have permission to delete this booking.');
  }

  if (!confirm('Delete this booking?')) return;

  const updated = bookings.filter(b => String(b.id) !== String(bookingId));
  DB.setItem('bookings', updated);

  const loadFn = window.loadPreviousBookings;
  if (loadFn) loadFn();
}

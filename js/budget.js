// Budget planner logic moved out of HTML for reliability
(function(){
  if (!window.DB) {
    console.warn('DB not loaded yet – ensure js/db.js is included before js/budget.js');
  }

  function initBudget() {
    console.log('[initBudget] Starting budget initialization...');
    const budgetForm = document.getElementById('budgetForm');
    console.log('[initBudget] budgetForm:', budgetForm);
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log('[initBudget] checkboxes found:', checkboxes.length);
    let savedBudgets = JSON.parse(localStorage.getItem('budgetPlans')) || [];

    // Fallback data in case DB is not available or missing entries
    const FALLBACK_DESTINATIONS = [
      { id: 'v1', name: 'Shimla Resort', baseCost: 45000, city: 'Shimla' },
      { id: 'v2', name: 'Manali Meadows', baseCost: 50000, city: 'Manali' },
      { id: 'v3', name: 'Udaipur Lakeview', baseCost: 60000, city: 'Udaipur' }
    ];
    const FALLBACK_MEAL_TYPES = { veg: { name: 'Vegetarian' }, nonveg: { name: 'Non-Vegetarian' }, vegan: { name: 'Vegan' } };
    const FALLBACK_MEAL_TIERS = {
      basic: { name: 'Basic', description: 'Simple buffet', costPerPerson: { veg: 300, nonveg: 400, vegan: 280 } },
      premium: { name: 'Premium', description: 'Full course', costPerPerson: { veg: 600, nonveg: 750, vegan: 550 } }
    };
    const FALLBACK_MEAL_SUBTYPES = [ { id: 'starters', name: 'Starters' }, { id: 'main', name: 'Main Course' }, { id: 'dessert', name: 'Dessert' } ];

    // Populate destinations and meal types from DB
    const destinationSelect = document.getElementById('destinationSelect');
    const budgetMealType = document.getElementById('budgetMealType');
    const budgetMealTiers = document.getElementById('budgetMealTiers');
    const subMealSelect = document.getElementById('subMealSelect');
    
    console.log('[initBudget] destinationSelect:', destinationSelect);
    console.log('[initBudget] budgetMealType:', budgetMealType);
    console.log('[initBudget] budgetMealTiers:', budgetMealTiers);
    console.log('[initBudget] subMealSelect:', subMealSelect);

    function populateDestinations() {
      console.log('[populateDestinations] Called...');
      destinationSelect.innerHTML = '<option value="">Select a venue...</option>';
      const source = (window.DB && Array.isArray(DB.DESTINATIONS) && DB.DESTINATIONS.length) ? DB.DESTINATIONS : FALLBACK_DESTINATIONS;
      console.log('[populateDestinations] Using source with', source.length, 'destinations');
      destinationSelect.disabled = false;
      source.forEach(dest => {
        const opt = document.createElement('option');
        opt.value = dest.id;
        opt.textContent = `${dest.name} (${dest.city || ''}) - Base: ₹${(dest.baseCost || 0).toLocaleString()}`;
        destinationSelect.appendChild(opt);
      });
      console.log('[populateDestinations] ✓ Complete, options count:', destinationSelect.options.length);
    }

    function populateMealTypes() {
      budgetMealType.innerHTML = '<option value="">Select meal type</option>';
      const mealTypesSource = (window.DB && DB.MEAL_TYPES) ? DB.MEAL_TYPES : FALLBACK_MEAL_TYPES;
      Object.keys(mealTypesSource).forEach(mealType => {
        const opt = document.createElement('option');
        opt.value = mealType;
        opt.textContent = mealTypesSource[mealType].name || (mealType.charAt(0).toUpperCase() + mealType.slice(1));
        budgetMealType.appendChild(opt);
      });
      // Populate sub-meal select
      const subSource = (window.DB && Array.isArray(DB.MEAL_SUBTYPES) && DB.MEAL_SUBTYPES.length) ? DB.MEAL_SUBTYPES : FALLBACK_MEAL_SUBTYPES;
      if (subMealSelect) {
        subMealSelect.innerHTML = '<option value="">Select sub-meal (optional)</option>';
        subSource.forEach(s => {
          const o = document.createElement('option');
          o.value = s.id || s.name;
          o.textContent = s.name || s;
          subMealSelect.appendChild(o);
        });
      }
    }

    function renderMealTiers(selectedMealType) {
      budgetMealTiers.innerHTML = '';
      const tiersSource = (window.DB && DB.MEAL_TIERS) ? DB.MEAL_TIERS : FALLBACK_MEAL_TIERS;
      if (!selectedMealType || !tiersSource) return;
      Object.keys(tiersSource).forEach(tierName => {
        const tier = tiersSource[tierName];
        const costPerGuest = (tier.costPerPerson && tier.costPerPerson[selectedMealType]) ? tier.costPerPerson[selectedMealType] : 0;
        const id = `budget-tier-${tierName}-${Math.random().toString(36).slice(2,6)}`;
        const label = document.createElement('label');
        label.className = 'meal-tier-section';
        label.innerHTML = `<input type="radio" name="budgetMealTier" id="${id}" value="${tierName}"> <strong>${tier.name || tierName}</strong>
          <div class="meal-details">${tier.description || ''}</div>
          <div class="meal-price">₹${costPerGuest} per guest</div>`;
        budgetMealTiers.appendChild(label);
      });
      // attach change listeners so selecting a tier recalculates
      const radios = budgetMealTiers.querySelectorAll('input[name="budgetMealTier"]');
      radios.forEach(r => r.addEventListener('change', calculateBudget));
    }

    function calculateBudget() {
      const destId = document.getElementById('destinationSelect').value;
      const destSource = (window.DB && Array.isArray(DB.DESTINATIONS) && DB.DESTINATIONS.length) ? DB.DESTINATIONS : FALLBACK_DESTINATIONS;
      const selectedDest = (destSource || []).find(d => String(d.id) === String(destId)) || null;
      const venueCost = selectedDest ? Number(selectedDest.baseCost || 0) : 0;

      const selectedMealType = document.getElementById('budgetMealType').value;
      const selectedTierRadio = document.querySelector('input[name="budgetMealTier"]:checked');
      const selectedTier = selectedTierRadio ? selectedTierRadio.value : null;
      const expectedGuests = Number(document.getElementById('expectedGuests').value) || 0;
      const decorationCost = Number(document.getElementById('decorationCost').value) || 0;
      const miscCost = Number(document.getElementById('miscCost').value) || 0;

      let additionalServicesCost = 0;
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          additionalServicesCost += Number(checkbox.dataset.cost);
        }
      });

      let mealCostPerGuest = 0;
      const tiersSource = (window.DB && DB.MEAL_TIERS) ? DB.MEAL_TIERS : FALLBACK_MEAL_TIERS;
      if (selectedMealType && selectedTier && tiersSource[selectedTier]) {
        mealCostPerGuest = Number(tiersSource[selectedTier].costPerPerson[selectedMealType] || 0);
      }
      const cateringCost = mealCostPerGuest * expectedGuests;
      const totalCost = venueCost + cateringCost + decorationCost + additionalServicesCost + miscCost;

      // Update summary
      document.getElementById('summaryVenue').textContent = `₹${venueCost.toLocaleString()}`;
      document.getElementById('summaryCatering').textContent = `₹${cateringCost.toLocaleString()}`;
      document.getElementById('summaryDecoration').textContent = `₹${decorationCost.toLocaleString()}`;
      document.getElementById('summaryServices').textContent = `₹${additionalServicesCost.toLocaleString()}`;
      document.getElementById('summaryMisc').textContent = `₹${miscCost.toLocaleString()}`;
      document.getElementById('summaryTotal').textContent = `₹${totalCost.toLocaleString()}`;

      document.getElementById('saveBudgetSection').style.display = 'block';
      return totalCost;
    }

    function saveBudgetPlan() {
      const destId = document.getElementById('destinationSelect').value;
      const destSource = (window.DB && Array.isArray(DB.DESTINATIONS) && DB.DESTINATIONS.length) ? DB.DESTINATIONS : FALLBACK_DESTINATIONS;
      const selectedDest = (destSource || []).find(d => String(d.id) === String(destId)) || null;
      const selectedMealType = document.getElementById('budgetMealType').value;
      const selectedTierRadio = document.querySelector('input[name="budgetMealTier"]:checked');
      const selectedTier = selectedTierRadio ? selectedTierRadio.value : null;

      let mealCostPerGuest = 0;
      const tiersSource = (window.DB && DB.MEAL_TIERS) ? DB.MEAL_TIERS : FALLBACK_MEAL_TIERS;
      if (selectedMealType && selectedTier && tiersSource[selectedTier]) {
        mealCostPerGuest = Number(tiersSource[selectedTier].costPerPerson[selectedMealType] || 0);
      }

      const budgetPlan = {
        id: Date.now(),
        eventType: document.getElementById('eventType').value,
        venueId: destId,
        venueName: selectedDest ? selectedDest.name : '',
        venueCost: selectedDest ? Number(selectedDest.baseCost) : 0,
        mealType: selectedMealType,
        mealTier: selectedTier,
        mealCostPerGuest: mealCostPerGuest,
        expectedGuests: Number(document.getElementById('expectedGuests').value),
        decorationCost: Number(document.getElementById('decorationCost').value),
        decorationType: document.getElementById('decorationType').value,
        additionalServices: Array.from(checkboxes)
          .filter(cb => cb.checked)
          .map(cb => ({ name: cb.id, cost: Number(cb.dataset.cost) })),
        miscCost: Number(document.getElementById('miscCost').value),
        miscDetails: document.getElementById('miscDetails').value,
        totalCost: calculateBudget(),
        createdAt: new Date().toISOString()
      };

      savedBudgets.push(budgetPlan);
      localStorage.setItem('budgetPlans', JSON.stringify(savedBudgets));
      displaySavedBudgets();
    }

    // Auto fill decoration cost based on decoration type
    const decorationTypeSelect = document.getElementById('decorationType');
    const decorationCostInput = document.getElementById('decorationCost');
    const decCostMap = { basic: 10000, premium: 30000, luxury: 60000 };
    function updateDecorationCost() {
      const t = decorationTypeSelect.value;
      if (t && decCostMap[t]) {
        decorationCostInput.value = decCostMap[t];
        decorationCostInput.readOnly = true;
      } else {
        decorationCostInput.readOnly = false;
      }
    }
    if (decorationTypeSelect) decorationTypeSelect.addEventListener('change', updateDecorationCost);
    // initialize decoration cost on load
    updateDecorationCost();

    function displaySavedBudgets() {
      const savedBudgetsDiv = document.getElementById('savedBudgets');
      savedBudgetsDiv.innerHTML = savedBudgets.length === 0 ? 
        '<p>No saved budget plans yet</p>' : 
        savedBudgets.map(budget => `
          <div class="budget-plan-card">
            <div class="budget-plan-header">
              <h3>${budget.eventType ? (budget.eventType.charAt(0).toUpperCase() + budget.eventType.slice(1)) : 'Plan'}</h3>
              <span class="budget-date">${new Date(budget.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="budget-plan-details">
              <p><strong>Venue:</strong> ${budget.venueName}</p>
              <p><strong>Guests:</strong> ${budget.expectedGuests}</p>
              <p><strong>Decoration:</strong> ${budget.decorationType}</p>
              <p><strong>Total Budget:</strong> ₹${budget.totalCost.toLocaleString()}</p>
            </div>
            <button onclick="deleteBudgetPlan(${budget.id})" class="delete-btn">Delete</button>
          </div>
        `).join('');
    }

    function deleteBudgetPlan(id) {
      if (confirm('Are you sure you want to delete this budget plan?')) {
        savedBudgets = savedBudgets.filter(budget => budget.id !== id);
        localStorage.setItem('budgetPlans', JSON.stringify(savedBudgets));
        displaySavedBudgets();
      }
    }

    budgetForm && budgetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateBudget();
    });
    const saveBtn = document.getElementById('saveBudget');
    saveBtn && saveBtn.addEventListener('click', saveBudgetPlan);

    // Initialize
    console.log('[initBudget] Calling populateDestinations...');
    populateDestinations();
    console.log('[initBudget] Calling populateMealTypes...');
    populateMealTypes();
    console.log('[initBudget] Calling displaySavedBudgets...');
    displaySavedBudgets();
    console.log('[initBudget] ✓ All populate functions called');

    // Update meal tiers when meal type changes
    budgetMealType && budgetMealType.addEventListener('change', function(){
      renderMealTiers(this.value);
    });

    // Recalculate when destination, guests, decoration or additional services change
    if (destinationSelect) destinationSelect.addEventListener('change', calculateBudget);
    const expectedGuestsEl = document.getElementById('expectedGuests');
    if (expectedGuestsEl) expectedGuestsEl.addEventListener('input', calculateBudget);
    if (decorationTypeSelect) decorationTypeSelect.addEventListener('change', function(){ updateDecorationCost(); calculateBudget(); });
    checkboxes.forEach(cb => cb.addEventListener('change', calculateBudget));

    // Make deleteBudgetPlan global
    window.deleteBudgetPlan = deleteBudgetPlan;

    // Provide pageLogout
    window.pageLogout = function() {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
      }
    };
  }

  // Initialize now if DOM already ready, otherwise wait for DOMContentLoaded
  function startInitBudget() {
    // Small timeout to ensure all elements are rendered
    setTimeout(() => {
      initBudget();
    }, 50);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitBudget);
  } else {
    startInitBudget();
  }

})();

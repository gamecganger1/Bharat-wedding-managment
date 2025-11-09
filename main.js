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
    `;
    eventContainer.appendChild(eventDiv);
  }

  // Add more events button click handler
  addMoreEventsBtn.addEventListener('click', () => addEventEntry());

  // Load previous bookings
  function loadPreviousBookings() {
    const bookings = DB.getAllBookings();
    bookingsList.innerHTML = bookings.map(booking => `
      <div class="booking-card">
        <button class="delete-booking" onclick="deleteBooking('${booking.id}')">Delete</button>
        <h4>${booking.bride} & ${booking.groom}</h4>
        <p>📱 Contact: ${booking.mobile}</p>
        ${booking.events.map(event => `
          <div>
            <p>🎉 ${event.functionType}</p>
            <p>📍 ${event.destination}</p>
            <p>📅 ${event.date}</p>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  // Form submit handler
  form.addEventListener("submit", e => {
    e.preventDefault();
    const bride = document.getElementById("bride").value;
    const groom = document.getElementById("groom").value;
    const mobile = document.getElementById("mobile").value;

    // Collect all events
    const events = Array.from(document.querySelectorAll('.event-entry')).map(entry => ({
      functionType: entry.querySelector('.function-type').value,
      destination: entry.querySelector('.destination').value,
      date: entry.querySelector('.event-date').value
    }));

    const booking = { 
      id: Date.now(),
      bride, 
      groom, 
      mobile,
      events,
      bookingDate: new Date().toISOString()
    };

    // Save to localStorage
    const bookings = DB.getAllBookings();
    bookings.push(booking);
    DB.setItem('bookings', bookings);

    // Show success message
    document.getElementById("bookingResult").innerHTML = `
      <p>Booking confirmed for <b>${bride}</b> & <b>${groom}</b><br>
      ${events.map(event => 
        `🎉 ${event.functionType} on ${event.date} at ${event.destination}`
      ).join('<br>')}<br>
      Handled by event team soon!</p>
    `;
    
    form.reset();
    eventContainer.innerHTML = '';
    addEventEntry(true); // Add back the first event entry
    loadPreviousBookings();
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
  if (!confirm('Are you sure you want to delete this booking?')) return;
  
  const bookings = DB.getAllBookings();
  const updated = bookings.filter(b => String(b.id) !== String(bookingId));
  DB.setItem('bookings', updated);
  
  // Also clean up any assignments for this booking
  const assignments = DB.getAllAssignments();
  const remainingAssignments = assignments.filter(a => String(a.bookingId) !== String(bookingId));
  DB.setItem('assignments', remainingAssignments);
  
  loadPreviousBookings();
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
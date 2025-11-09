// Database Helper
const DB = {
    getItem: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    setItem: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    getAllTeamMembers: function() {
        return this.getItem('teamMembers') || [];
    },
    getAllBookings: function() {
        return this.getItem('bookings') || [];
    },
    getAllAssignments: function() {
        return this.getItem('assignments') || [];
    }
};

// Team Management
function removeTeamMember(memberId) {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    const members = DB.getAllTeamMembers();
    const assignments = DB.getAllAssignments();
    
    // Check if member has any active assignments
    const memberName = members.find(m => m.id === memberId)?.name;
    const activeAssignments = assignments.filter(a => a.member === memberName);
    
    if (activeAssignments.length > 0) {
        if (!confirm(`This team member has ${activeAssignments.length} active assignment(s). Removing them will also remove their assignments. Continue?`)) {
            return;
        }
        // Remove related assignments
        const remainingAssignments = assignments.filter(a => a.member !== memberName);
        DB.setItem('assignments', remainingAssignments);
    }
    
    // Remove the team member
    const updatedMembers = members.filter(m => m.id !== memberId);
    DB.setItem('teamMembers', updatedMembers);
    
    loadTeamMembers();
    loadBookingsAndEvents(); // Refresh assignments display
}

function loadTeamMembers() {
    const teamList = document.getElementById('teamList');
    const assignSelect = document.getElementById('assignMember');
    const members = DB.getAllTeamMembers();
    
    // Update team list display
    if (teamList) {
        teamList.innerHTML = members.map(member => `
            <div class="team-member">
                <span>👤 ${member.name}</span>
                <button class="remove-member" onclick="removeTeamMember(${member.id})">
                    Remove
                </button>
            </div>
        `).join('');
    }
    
    // Update assignment dropdown
    if (assignSelect) {
        assignSelect.innerHTML = '<option value="">Select Team Member</option>' +
            members.map(member => `
                <option value="${member.name}">${member.name}</option>
            `).join('');
    }
}

// Add team members function
function addTeamMembers() {
    const textarea = document.getElementById('bulkTeamMembers');
    const names = textarea.value.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    if (names.length > 0) {
        const existingMembers = DB.getAllTeamMembers();
        const newMembers = names.map(name => ({
            id: Date.now() + Math.random(),
            name: name
        }));
        
        DB.setItem('teamMembers', [...existingMembers, ...newMembers]);
        textarea.value = '';
        loadTeamMembers();
        alert(`Successfully added ${names.length} team member(s)!`);
    } else {
        alert('Please enter at least one team member name');
    }
}

// Load bookings and update dropdowns
function loadBookingsAndEvents() {
    const bookings = DB.getAllBookings();
    const assignments = DB.getAllAssignments();
    const bookingSelect = document.getElementById('bookingSelect');
    const pendingBookings = document.getElementById('pendingBookings');
    const assignedEvents = document.getElementById('assignedEvents');
    
    // Update booking select
    if (bookingSelect) {
        bookingSelect.innerHTML = '<option value="">Select a Booking</option>' +
            bookings.map(booking => `
                <option value="${booking.id}">${booking.bride} & ${booking.groom} Wedding</option>
            `).join('');
    }
    
    // Show pending bookings
    if (pendingBookings) {
        pendingBookings.innerHTML = bookings.map(booking => `
            <div class="pending-booking">
                <button class="delete-booking" onclick="deleteBooking('${booking.id}')">Delete</button>
                <h3>${booking.bride} & ${booking.groom}</h3>
                <p>📱 ${booking.mobile}</p>
                ${booking.events.map(event => `
                    <div class="event-card">
                        <p>🎉 ${event.functionType} - 📅 ${event.date}</p>
                        <p>📍 ${event.destination}</p>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
    
    // Show assignments
    if (assignedEvents) {
        assignedEvents.innerHTML = assignments.map(assignment => `
            <div>
                <p>🎯 <b>${assignment.eventName}</b> from <b>${assignment.bookingName}</b></p>
                <p>👤 Assigned to: <b>${assignment.member}</b></p>
                <p>📅 Date: ${assignment.date}</p>
            </div>
        `).join('');
    }
}

// Initialize the admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadTeamMembers();
    loadBookingsAndEvents();
    
    // Set up event listeners
    const addBulkMembersBtn = document.getElementById('addBulkMembers');
    if (addBulkMembersBtn) {
        addBulkMembersBtn.onclick = addTeamMembers;
    }
    
    const bookingSelect = document.getElementById('bookingSelect');
    if (bookingSelect) {
        bookingSelect.onchange = function() {
            const eventSelect = document.getElementById('eventSelect');
            const bookingId = this.value;
            
            eventSelect.innerHTML = '<option value="">Select an Event</option>';
            if (bookingId) {
                const booking = DB.getAllBookings().find(b => b.id == bookingId);
                if (booking) {
                    booking.events.forEach((event, index) => {
                        eventSelect.innerHTML += `
                            <option value="${index}">
                                ${event.functionType} on ${event.date}
                            </option>
                        `;
                    });
                }
            }
        };
    }
    
    const assignEventBtn = document.getElementById('assignEvent');
    if (assignEventBtn) {
        assignEventBtn.onclick = function() {
            const bookingId = bookingSelect.value;
            const eventIndex = document.getElementById('eventSelect').value;
            const member = document.getElementById('assignMember').value;
            
            if (bookingId && eventIndex !== "" && member) {
                const booking = DB.getAllBookings().find(b => b.id == bookingId);
                if (booking) {
                    const event = booking.events[eventIndex];
                    const assignment = {
                        id: Date.now(),
                        bookingId,
                        bookingName: `${booking.bride} & ${booking.groom}`,
                        eventName: event.functionType,
                        date: event.date,
                        member
                    };
                    
                    const assignments = DB.getAllAssignments() || [];
                    DB.setItem('assignments', [...assignments, assignment]);
                    
                    // Reset form and reload data
                    bookingSelect.value = '';
                    document.getElementById('eventSelect').innerHTML = '<option value="">Select an Event</option>';
                    document.getElementById('assignMember').value = '';
                    loadBookingsAndEvents();
                }
            } else {
                alert('Please select a booking, event, and team member');
            }
        };
    }
    // Listen for storage events (so bookings created in other pages/tabs update this panel)
    window.addEventListener('storage', function(e) {
        if (e.key === 'bookings' || e.key === 'assignments' || e.key === 'teamMembers') {
            loadBookingsAndEvents();
            loadTeamMembers();
        }
    });
});

// Delete booking function available to the admin panel
function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const bookings = DB.getAllBookings() || [];
    const updated = bookings.filter(b => String(b.id) !== String(bookingId));
    DB.setItem('bookings', updated);
    // Also remove any assignments related to this booking
    const assignments = DB.getAllAssignments() || [];
    const remainingAssignments = assignments.filter(a => String(a.bookingId) !== String(bookingId));
    DB.setItem('assignments', remainingAssignments);
    loadBookingsAndEvents();
}

// Make removeTeamMember function available globally
window.removeTeamMember = removeTeamMember;
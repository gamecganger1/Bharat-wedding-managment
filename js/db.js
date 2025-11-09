// Unified database helper for all pages
const DB = {
    // Core storage operations
    getItem: function(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    setItem: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
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
        return this.getItem('team') || [];
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
};

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
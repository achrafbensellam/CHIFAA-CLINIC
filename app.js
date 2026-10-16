/**
 * ========================================================
 * Shifaa Clinic - Application Logic (app.js)
 * Vanilla JavaScript state management, validation & localStorage
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let appointments = JSON.parse(localStorage.getItem('shifaa_appointments')) || [];
    let currentViewMode = 'card'; // 'card' or 'table'
    let pendingDeleteId = null;
    let conflictPayload = null;

    // DOM Elements - Navigation & Views
    const landingView = document.getElementById('landingView');
    const appView = document.getElementById('appView');
    const navLinks = document.querySelectorAll('.nav-link');
    const goToAppBtn = document.getElementById('goToAppBtn');
    const tryToolHeroBtn = document.getElementById('tryToolHeroBtn');
    const launchManagerBottomBtn = document.getElementById('launchManagerBottomBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const footerManagerLink = document.getElementById('footerManagerLink');

    // DOM Elements - Form & Inputs
    const appointmentForm = document.getElementById('appointmentForm');
    const customerNameInput = document.getElementById('customerName');
    const serviceTypeInput = document.getElementById('serviceType');
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentTimeInput = document.getElementById('appointmentTime');
    const resetFormBtn = document.getElementById('resetFormBtn');

    // DOM Elements - Schedule & Filters
    const appointmentsCardGrid = document.getElementById('appointmentsCardGrid');
    const appointmentsTableView = document.getElementById('appointmentsTableView');
    const appointmentsTableBody = document.getElementById('appointmentsTableBody');
    const emptyState = document.getElementById('emptyState');
    const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const searchInput = document.getElementById('searchInput');
    const filterService = document.getElementById('filterService');
    const filterDate = document.getElementById('filterDate');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const upcomingCountEl = document.getElementById('upcomingCount');

    // DOM Elements - Alerts & Modals
    const appAlert = document.getElementById('appAlert');
    const alertMessage = document.getElementById('alertMessage');
    const alertCloseBtn = document.getElementById('alertCloseBtn');
    const conflictModal = document.getElementById('conflictModal');
    const conflictDetailsText = document.getElementById('conflictDetailsText');
    const closeConflictModalBtn = document.getElementById('closeConflictModalBtn');
    const deleteModal = document.getElementById('deleteModal');
    const deleteDetailsText = document.getElementById('deleteDetailsText');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Set minimum date for appointment date picker to today
    const todayStr = new Date().toISOString().split('T')[0];
    appointmentDateInput.min = todayStr;

    // ==========================================
    // 1. Navigation & View Switching
    // ==========================================
    function switchView(viewName) {
        if (viewName === 'app') {
            landingView.classList.remove('active');
            appView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            appView.classList.remove('active');
            landingView.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        mainNav.classList.remove('open');
    }

    goToAppBtn.addEventListener('click', () => switchView('app'));
    tryToolHeroBtn.addEventListener('click', () => switchView('app'));
    launchManagerBottomBtn.addEventListener('click', () => switchView('app'));
    backToHomeBtn.addEventListener('click', () => switchView('landing'));
    if (footerManagerLink) {
        footerManagerLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('app');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-target');
            if (target === 'landing') {
                switchView('landing');
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });

    // ==========================================
    // 2. Alert & Notification System
    // ==========================================
    function showAlert(message, type = 'success') {
        alertMessage.textContent = message;
        appAlert.className = `alert-banner ${type}`;
        appAlert.classList.remove('d-none');
        
        setTimeout(() => {
            appAlert.classList.add('d-none');
        }, 5000);
    }

    alertCloseBtn.addEventListener('click', () => {
        appAlert.classList.add('d-none');
    });

    // ==========================================
    // 3. Form Validation & Submission
    // ==========================================
    function validateForm() {
        let isValid = true;
        const nameVal = customerNameInput.value.trim();
        const serviceVal = serviceTypeInput.value;
        const dateVal = appointmentDateInput.value;
        const timeVal = appointmentTimeInput.value;
        // const nameRegex = /^[\u0600-\u06FFa-zA-Z]+(?:\s[\u0600-\u06FFa-zA-Z]+)*$/;
        // const nameRegex = /^[a-zA-Z\u0600-\u06FF]+(?:\s[a-zA-Z\u0600-\u06FF]+)*$/;
           const nameRegex = /^[A-Za-z\u00C0-\u00FF\u0600-\u06FF]+(\s[A-Za-z\u00C0-\u00FF\u0600-\u06FF]+)*$/;
           const numregex = [0-9]; 

        if (!nameVal || nameVal.length < 2 || !nameRegex.test(nameVal)) {
            customerNameInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        } else {
            customerNameInput.closest('.form-group').classList.remove('invalid');
        }

        if (!serviceVal) {
            serviceTypeInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        } else {
            serviceTypeInput.closest('.form-group').classList.remove('invalid');
        }

        if (!dateVal) {
            appointmentDateInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        } else {
            const selectedDate = new Date(dateVal + 'T00:00:00');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                appointmentDateInput.closest('.form-group').classList.add('invalid');
                document.getElementById('dateError').textContent = 'Appointments cannot be booked in the past.';
                isValid = false;
            } else {
                appointmentDateInput.closest('.form-group').classList.remove('invalid');
            }
        }

        if (!timeVal) {
            appointmentTimeInput.closest('.form-group').classList.add('invalid');
            isValid = false;
        } else {
            appointmentTimeInput.closest('.form-group').classList.remove('invalid');
        }

        return isValid;
    }

    function checkConflict(date, time) {
        return appointments.find(app => app.date === date && app.time === time);
    }

    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showAlert('Please fix the highlighted errors before submitting.', 'danger');
            return;
        }

        const newAppointment = {
            id: 'APT-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            customerName: customerNameInput.value.trim(),
            service: serviceTypeInput.value,
            date: appointmentDateInput.value,
            time: appointmentTimeInput.value,
            createdAt: new Date().toISOString()
        };

        const conflict = checkConflict(newAppointment.date, newAppointment.time);
        if (conflict) {
            conflictPayload = newAppointment;
            showConflictModal(conflict);
            return;
        }

        saveAndRefresh(newAppointment);
    });

    function saveAndRefresh(newApp) {
        appointments.push(newApp);
        persistAppointments();
        renderAppointments();
        appointmentForm.reset();
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));
        
        showAlert(`Appointment successfully booked for ${newApp.customerName} (${newApp.service}) on ${formatDateNice(newApp.date)} at ${formatTimeNice(newApp.time)}!`, 'success');
    }

    resetFormBtn.addEventListener('click', () => {
        appointmentForm.reset();
        document.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));
    });

    // ==========================================
    // 4. Persistence (localStorage)
    // ==========================================
    function persistAppointments() {
        localStorage.setItem('shifaa_appointments', JSON.stringify(appointments));
    }

    // ==========================================
    // 5. Sorting & Filtering Appointments
    // ==========================================
    function getFilteredAndSortedAppointments() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const serviceFilter = filterService.value;
        const dateFilter = filterDate.value;

        let filtered = appointments.filter(app => {
            const matchesSearch = app.customerName.toLowerCase().includes(searchTerm);
            const matchesService = serviceFilter === '' || app.service === serviceFilter;
            const matchesDate = dateFilter === '' || app.date === dateFilter;
            return matchesSearch && matchesService && matchesDate;
        });

        filtered.sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`);
            const dateTimeB = new Date(`${b.date}T${b.time}`);
            return dateTimeA - dateTimeB;
        });

        return filtered;
    }

    // ==========================================
    // 6. Rendering Schedule (Cards & Table)
    // ==========================================
    function renderAppointments() {
        const list = getFilteredAndSortedAppointments();

        const now = new Date();
        const upcomingList = appointments.filter(app => new Date(`${app.date}T${app.time}`) >= now);
        upcomingCountEl.textContent = upcomingList.length;

        if (list.length === 0) {
            appointmentsCardGrid.classList.add('d-none');
            appointmentsTableView.classList.add('d-none');
            emptyState.classList.remove('d-none');
            return;
        }

        emptyState.classList.add('d-none');

        if (currentViewMode === 'card') {
            appointmentsCardGrid.classList.remove('d-none');
            appointmentsTableView.classList.add('d-none');
            renderCardView(list);
        } else {
            appointmentsCardGrid.classList.add('d-none');
            appointmentsTableView.classList.remove('d-none');
            renderTableView(list);
        }
    }

    function renderCardView(list) {
        appointmentsCardGrid.innerHTML = '';
        list.forEach(app => {
            const card = document.createElement('div');
            card.className = 'appointment-card';
            card.innerHTML = `
                <div class="appointment-card-header">
                    <span class="patient-name">${escapeHtml(app.customerName)}</span>
                    <span class="service-badge">${escapeHtml(app.service)}</span>
                </div>
                <div class="appointment-details">
                    <div><i class="fa-solid fa-calendar text-primary"></i> ${formatDateNice(app.date)}</div>
                    <div><i class="fa-solid fa-clock text-primary"></i> ${formatTimeNice(app.time)}</div>
                </div>
                <div class="appointment-card-footer">
                    <span class="status-pill confirmed"><i class="fa-solid fa-check"></i> Confirmed</span>
                    <button class="btn btn-outline btn-sm text-danger border-danger cancel-btn" data-id="${app.id}" title="Cancel Appointment">
                        <i class="fa-solid fa-trash-can"></i> Cancel
                    </button>
                </div>
            `;
            appointmentsCardGrid.appendChild(card);
        });
        bindCancelButtons();
    }

    function renderTableView(list) {
        appointmentsTableBody.innerHTML = '';
        list.forEach(app => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(app.customerName)}</strong></td>
                <td><span class="service-badge">${escapeHtml(app.service)}</span></td>
                <td>${formatDateNice(app.date)} at ${formatTimeNice(app.time)}</td>
                <td><span class="status-pill confirmed">Confirmed</span></td>
                <td class="text-end">
                    <button class="btn btn-outline btn-sm text-danger border-danger cancel-btn" data-id="${app.id}" title="Cancel Appointment">
                        <i class="fa-solid fa-trash-can"></i> Cancel
                    </button>
                </td>
            `;
            appointmentsTableBody.appendChild(tr);
        });
        bindCancelButtons();
    }

    function bindCancelButtons() {
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                promptDeleteAppointment(id);
            });
        });
    }

    // ==========================================
    // 7. Cancellation & Deletion Flow
    // ==========================================
    function promptDeleteAppointment(id) {
        pendingDeleteId = id;
        const app = appointments.find(a => a.id === id);
        if (!app) return;

        deleteDetailsText.innerHTML = `
            <strong>Patient:</strong> ${escapeHtml(app.customerName)}<br>
            <strong>Service:</strong> ${escapeHtml(app.service)}<br>
            <strong>Date & Time:</strong> ${formatDateNice(app.date)} at ${formatTimeNice(app.time)}
        `;
        deleteModal.classList.remove('d-none');
    }

    confirmDeleteBtn.addEventListener('click', () => {
        if (!pendingDeleteId) return;
        const appIndex = appointments.findIndex(a => a.id === pendingDeleteId);
        if (appIndex !== -1) {
            const removed = appointments.splice(appIndex, 1)[0];
            persistAppointments();
            renderAppointments();
            showAlert(`Appointment for ${removed.customerName} has been successfully cancelled.`, 'warning');
        }
        deleteModal.classList.add('d-none');
        pendingDeleteId = null;
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.classList.add('d-none');
        pendingDeleteId = null;
    });

    // ==========================================
    // 8. Conflict Modal Handlers
    // ==========================================
    function showConflictModal(existingApp) {
        conflictDetailsText.innerHTML = `
            <strong>Existing Patient:</strong> ${escapeHtml(existingApp.customerName)}<br>
            <strong>Service:</strong> ${escapeHtml(existingApp.service)}<br>
            <strong>Conflicting Slot:</strong> ${formatDateNice(existingApp.date)} at ${formatTimeNice(existingApp.time)}
        `;
        conflictModal.classList.remove('d-none');
    }

    closeConflictModalBtn.addEventListener('click', () => {
        conflictModal.classList.add('d-none');
        conflictPayload = null;
    });

    // ==========================================
    // 9. Event Listeners for Filters & View Toggles
    // ==========================================
    cardViewBtn.addEventListener('click', () => {
        currentViewMode = 'card';
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        renderAppointments();
    });

    tableViewBtn.addEventListener('click', () => {
        currentViewMode = 'table';
        tableViewBtn.classList.add('active');
        cardViewBtn.classList.remove('active');
        renderAppointments();
    });

    searchInput.addEventListener('input', renderAppointments);
    filterService.addEventListener('change', renderAppointments);
    filterDate.addEventListener('change', renderAppointments);

    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterService.value = '';
        filterDate.value = '';
        renderAppointments();
    });

    emptyStateResetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterService.value = '';
        filterDate.value = '';
        renderAppointments();
        customerNameInput.focus();
    });

    // ==========================================
    // Helper Functions
    // ==========================================
    function formatDateNice(dateStr) {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTimeNice(timeStr) {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Initialize Mock Data if LocalStorage is Empty
    if (appointments.length === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        const dayAfterStr = dayAfter.toISOString().split('T')[0];

        appointments = [
            {
                id: 'APT-shifaa-1',
                customerName: 'Sarah Jenkins',
                service: 'General Consultation',
                date: tomorrowStr,
                time: '09:30',
                createdAt: new Date().toISOString()
            },
            {
                id: 'APT-shifaa-2',
                customerName: 'Michael Chang',
                service: 'Cardiology',
                date: tomorrowStr,
                time: '11:00',
                createdAt: new Date().toISOString()
            },
            {
                id: 'APT-shifaa-3',
                customerName: 'Emily Rodriguez',
                service: 'Pediatrics',
                date: dayAfterStr,
                time: '14:15',
                createdAt: new Date().toISOString()
            }
        ];
        persistAppointments();
    }

    // Initial Render Call
    renderAppointments();
});

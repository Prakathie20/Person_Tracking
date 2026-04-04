document.addEventListener('DOMContentLoaded', () => {
    // Basic Navigation Logic
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
            
            // Refresh data based on view
            if(btn.dataset.target === 'dashboard') loadDashboardStats();
            if(btn.dataset.target === 'patients') loadPatients();
            if(btn.dataset.target === 'doctors') loadDoctors();
            if(btn.dataset.target === 'appointments') loadAppointmentsData();
        });
    });

    // Modals
    const modals = {
        addPatient: document.getElementById('addPatientModal'),
        addDoctor: document.getElementById('addDoctorModal')
    };

    document.getElementById('openAddPatientModal').addEventListener('click', () => modals.addPatient.classList.add('active'));
    document.getElementById('openAddDoctorModal').addEventListener('click', () => modals.addDoctor.classList.add('active'));

    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Toast logic
    window.showToast = function(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${isError ? 'error' : ''}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    // Data Fetching and Submissions
    
    // Add Patient
    document.getElementById('add-patient-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('patient-name').value,
            age: parseInt(document.getElementById('patient-age').value),
            gender: document.getElementById('patient-gender').value
        };

        try {
            let res = await fetch('/api/patients', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                showToast('Patient Added Successfully!');
                modals.addPatient.classList.remove('active');
                e.target.reset();
                loadPatients();
            }
        } catch(err) {
            showToast('Error adding patient', true);
        }
    });

    // Add Doctor
    document.getElementById('add-doctor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('doctor-name').value,
            specialization: document.getElementById('doctor-spec').value
        };

        try {
            let res = await fetch('/api/doctors', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            if(res.ok) {
                showToast('Doctor Added Successfully!');
                modals.addDoctor.classList.remove('active');
                e.target.reset();
                loadDoctors();
            }
        } catch(err) {
            showToast('Error adding doctor', true);
        }
    });

    // Book Appointment
    document.getElementById('appointment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            patientId: document.getElementById('appt-patient').value,
            doctorId: document.getElementById('appt-doctor').value,
            appointmentDate: document.getElementById('appt-date').value
        };

        try {
            let res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
            let data = await res.json();
            if(res.ok) {
                showToast(data.message || 'Appointment Booked!');
                e.target.reset();
                loadAppointmentsData();
            } else {
                showToast(data.error || 'Failed to book appointment', true);
            }
        } catch(err) {
            showToast('Error booking appointment', true);
        }
    });


    // Fetchers
    async function loadPatients() {
        let res = await fetch('/api/patients');
        let data = await res.json();
        let tbody = document.getElementById('patients-table-body');
        tbody.innerHTML = data.map(p => `<tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.gender}</td>
        </tr>`).join('');
    }

    async function loadDoctors() {
        let res = await fetch('/api/doctors');
        let data = await res.json();
        let tbody = document.getElementById('doctors-table-body');
        tbody.innerHTML = data.map(d => `<tr>
            <td>${d.id}</td>
            <td>${d.name}</td>
            <td>${d.specialization}</td>
        </tr>`).join('');
    }

    async function loadAppointmentsData() {
        // Load table
        let apptRes = await fetch('/api/appointments');
        let apptData = await apptRes.json();
        let tbody = document.getElementById('appointments-table-body');
        tbody.innerHTML = apptData.map(a => `<tr>
            <td>${a.id}</td>
            <td>${a.patient.name}</td>
            <td>${a.doctor.name}</td>
            <td>${a.appointmentDate}</td>
        </tr>`).join('');

        // Populate selects
        let pRes = await fetch('/api/patients');
        let pData = await pRes.json();
        document.getElementById('appt-patient').innerHTML = '<option value="">-- Choose Patient --</option>' + 
            pData.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        let dRes = await fetch('/api/doctors');
        let dData = await dRes.json();
        document.getElementById('appt-doctor').innerHTML = '<option value="">-- Choose Doctor --</option>' + 
            dData.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    async function loadDashboardStats() {
        let pRes = await fetch('/api/patients');
        let pData = await pRes.json();
        document.getElementById('stat-patients').textContent = pData.length;

        let dRes = await fetch('/api/doctors');
        let dData = await dRes.json();
        document.getElementById('stat-doctors').textContent = dData.length;

        let apptRes = await fetch('/api/appointments');
        let apptData = await apptRes.json();
        document.getElementById('stat-appointments').textContent = apptData.length;
    }

    // Initial Load
    loadDashboardStats();
});

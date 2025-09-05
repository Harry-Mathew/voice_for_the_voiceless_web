// script.js
document.addEventListener('DOMContentLoaded', () => {
    let userLat = null;
    let userLon = null;
    let reports = JSON.parse(localStorage.getItem('reports')) || [];

    // Add some fake initial reports if none exist (for demo purposes)
    if (reports.length === 0) {
        reports = [
            {
                latitude: 37.7749,
                longitude: -122.4194,
                description: 'Injured dog with a limp near Golden Gate Park',
                severity: 7,
                survival: 8,
                photo: null
            },
            {
                latitude: 37.7833,
                longitude: -122.4167,
                description: 'Cat with scratches in downtown area',
                severity: 5,
                survival: 6,
                photo: null
            },
            {
                latitude: 37.7694,
                longitude: -122.4862,
                description: 'Bird with broken wing in Presidio',
                severity: 9,
                survival: 4,
                photo: null
            }
        ];
        localStorage.setItem('reports', JSON.stringify(reports));
    }

    const homeSection = document.getElementById('home');
    const reportSection = document.getElementById('report');
    const reportBtn = document.getElementById('report-btn');
    const backBtn = document.getElementById('back-btn');
    const reportForm = document.getElementById('report-form');
    const photoInput = document.getElementById('photo');
    const previewDiv = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const descriptionInput = document.getElementById('description');
    const severitySelect = document.getElementById('severity');
    const survivalSelect = document.getElementById('survival');
    const animalList = document.getElementById('animal-list');
    const sortSelect = document.getElementById('sort-select');
    const getLocationBtn = document.getElementById('get-location-btn');
    const statusMessage = document.getElementById('status-message');
    const useCurrentLocationBtn = document.getElementById('use-current-location');

    // Function to calculate distance using Haversine formula
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    // Function to render the list of animals
    function renderList() {
        animalList.innerHTML = '';
        let filteredReports = reports;

        // Filter by distance if user location is available
        if (userLat !== null && userLon !== null) {
            filteredReports = reports.filter(report => {
                const dist = getDistance(userLat, userLon, report.latitude, report.longitude);
                return dist <= 10; // 10 km radius
            });
            statusMessage.textContent = filteredReports.length > 0 ? 'Showing injured animals within 10km' : 'No injured animals nearby';
        } else {
            statusMessage.textContent = 'Showing all reported injured animals';
        }

        // Sort the reports based on dropdown
        const sortValue = sortSelect.value;
        filteredReports.sort((a, b) => {
            if (sortValue === 'severity-desc') return b.severity - a.severity;
            if (sortValue === 'severity-asc') return a.severity - b.severity;
            if (sortValue === 'survival-desc') return b.survival - a.survival;
            if (sortValue === 'survival-asc') return a.survival - b.survival;
            return 0;
        });

        // Render cards
        filteredReports.forEach(report => {
            const card = document.createElement('div');
            card.classList.add('animal-card');
            if (report.photo) {
                const img = document.createElement('img');
                img.src = report.photo;
                img.alt = 'Animal Photo';
                card.appendChild(img);
            }
            const descP = document.createElement('p');
            descP.textContent = report.description;
            card.appendChild(descP);
            const sevP = document.createElement('p');
            sevP.textContent = `Severity: ${report.severity}`;
            card.appendChild(sevP);
            const surP = document.createElement('p');
            surP.textContent = `Chance of Survival: ${report.survival}`;
            card.appendChild(surP);
            if (userLat !== null && userLon !== null) {
                const dist = getDistance(userLat, userLon, report.latitude, report.longitude).toFixed(2);
                const distP = document.createElement('p');
                distP.textContent = `Distance: ${dist} km`;
                card.appendChild(distP);
            }
            animalList.appendChild(card);
        });
    }

    // Initial render
    renderList();

    // Event listeners
    reportBtn.addEventListener('click', () => {
        homeSection.classList.add('hidden');
        reportSection.classList.remove('hidden');
    });

    backBtn.addEventListener('click', () => {
        reportSection.classList.add('hidden');
        homeSection.classList.remove('hidden');
        reportForm.reset();
        previewDiv.classList.add('hidden');
        renderList(); // Refresh list on back
    });

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                previewDiv.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    useCurrentLocationBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitudeInput.value = position.coords.latitude;
                longitudeInput.value = position.coords.longitude;
            },
            (error) => {
                alert(`Error getting location: ${error.message}`);
            }
        );
    });

    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const latitude = parseFloat(latitudeInput.value);
        const longitude = parseFloat(longitudeInput.value);
        const description = descriptionInput.value;
        const severity = parseInt(severitySelect.value);
        const survival = parseInt(survivalSelect.value);
        let photoBase64 = null;

        if (photoInput.files.length > 0) {
            const file = photoInput.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                photoBase64 = event.target.result;
                saveReport(latitude, longitude, description, severity, survival, photoBase64);
            };
            reader.readAsDataURL(file);
        } else {
            saveReport(latitude, longitude, description, severity, survival, photoBase64);
        }
    });

    function saveReport(latitude, longitude, description, severity, survival, photo) {
        if (!isNaN(latitude) && !isNaN(longitude) && description && !isNaN(severity) && !isNaN(survival)) {
            reports.push({ latitude, longitude, description, severity, survival, photo });
            localStorage.setItem('reports', JSON.stringify(reports));
            alert('Report submitted successfully! Thank you for helping.');
            reportForm.reset();
            previewDiv.classList.add('hidden');
            reportSection.classList.add('hidden');
            homeSection.classList.remove('hidden');
            renderList();
        } else {
            alert('Please fill all fields correctly.');
        }
    }

    sortSelect.addEventListener('change', renderList);

    getLocationBtn.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLat = position.coords.latitude;
                userLon = position.coords.longitude;
                renderList();
            },
            (error) => {
                alert(`Error getting location: ${error.message}`);
                userLat = null;
                userLon = null;
                renderList();
            }
        );
    });
});
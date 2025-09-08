// script.js (for index.html)
document.addEventListener('DOMContentLoaded', () => {
    emailjs.init("YOUR_EMAILJS_USER_ID"); // Replace with your EmailJS User ID

    let userLat = null;
    let userLon = null;
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    let user = JSON.parse(localStorage.getItem('user')) || null;
    let verificationCode = null;

    // Clean up old reports (24 hours)
    reports = reports.filter(report => Date.now() - report.timestamp < 24 * 60 * 60 * 1000);
    localStorage.setItem('reports', JSON.stringify(reports));

    // Add some fake initial reports if none exist (for demo purposes)
    if (reports.length === 0) {
        const now = Date.now();
        reports = [
            {
                latitude: 37.7749,
                longitude: -122.4194,
                description: 'Injured dog with a limp near Golden Gate Park',
                severity: 7,
                survival: 8,
                photo: null,
                timestamp: now
            },
            {
                latitude: 37.7833,
                longitude: -122.4167,
                description: 'Cat with scratches in downtown area',
                severity: 5,
                survival: 6,
                photo: null,
                timestamp: now
            },
            {
                latitude: 37.7694,
                longitude: -122.4862,
                description: 'Bird with broken wing in Presidio',
                severity: 9,
                survival: 4,
                photo: null,
                timestamp: now
            }
        ];
        localStorage.setItem('reports', JSON.stringify(reports));
    }

    const authSection = document.getElementById('auth-section');
    const homeSection = document.getElementById('home');
    const authTitle = document.getElementById('auth-title');
    const authForm = document.getElementById('auth-form');
    const authSubmit = document.getElementById('auth-submit');
    const toggleAuth = document.getElementById('toggle-auth');
    const verificationSection = document.getElementById('verification-section');
    const verifyBtn = document.getElementById('verify-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const codeInput = document.getElementById('code');
    const reportBtn = document.getElementById('report-btn');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.getElementById('dropdown-content');
    const animalList = document.getElementById('animal-list');
    const sortSelect = document.getElementById('sort-select');
    const getLocationBtn = document.getElementById('get-location-btn');
    const statusMessage = document.getElementById('status-message');

    let isSignup = true;

    function showAuth() {
        authSection.classList.remove('hidden');
        homeSection.classList.add('hidden');
        reportBtn.disabled = true;
        if (isSignup) {
            authTitle.textContent = 'Sign Up';
            authSubmit.textContent = 'Sign Up';
            toggleAuth.textContent = 'Switch to Login';
        } else {
            authTitle.textContent = 'Login';
            authSubmit.textContent = 'Login';
            toggleAuth.textContent = 'Switch to Signup';
        }
    }

    function showHome() {
        authSection.classList.add('hidden');
        homeSection.classList.remove('hidden');
        reportBtn.disabled = false;
        renderList();
    }

    if (!user || !user.verified) {
        showAuth();
    } else {
        showHome();
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        if (isSignup) {
            // Simulate signup
            user = { email, password, verified: false };
            localStorage.setItem('user', JSON.stringify(user));
            // Generate verification code
            verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            // Send email with EmailJS
            emailjs.send("service_bvctqwr", "template_pij5e3r", {
                to_email: email,
                code: verificationCode
            })
            .then(function(response) {
                alert('Verification code sent to your email! Check your inbox/spam.');
                verificationSection.classList.remove('hidden');
            }, function(error) {
                alert('Failed to send verification email: ' + JSON.stringify(error));
            });
        } else {
            // Login
            if (user && user.email === email && user.password === password && user.verified) {
                showHome();
            } else {
                alert('Invalid credentials or not verified.');
            }
        }
    });

    verifyBtn.addEventListener('click', () => {
        if (codeInput.value === verificationCode) {
            user.verified = true;
            localStorage.setItem('user', JSON.stringify(user));
            alert('Email verified!');
            verificationSection.classList.add('hidden');
            showHome();
        } else {
            alert('Invalid code.');
        }
    });

    toggleAuth.addEventListener('click', () => {
        isSignup = !isSignup;
        verificationSection.classList.add('hidden');
        showAuth();
    });

    menuBtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('hidden');
    });

    reportBtn.addEventListener('click', () => {
        if (user && user.verified) {
            window.location.href = 'report.html';
        } else {
            alert('Please log in or sign up first.');
        }
    });

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

    if (user && user.verified) {
        renderList();
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
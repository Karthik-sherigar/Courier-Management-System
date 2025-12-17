document.addEventListener('DOMContentLoaded', () => {
    // --- Config & State ---
    const API_URL = '/api';
    const state = {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null
    };

    // --- API Service ---
    const api = {
        async request(endpoint, method = 'GET', data = null) {
            const headers = { 'Content-Type': 'application/json' };
            if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
            try {
                const res = await fetch(`${API_URL}${endpoint}`, { method, headers, body: data ? JSON.stringify(data) : null });
                const resData = await res.json();
                if (!res.ok) throw new Error(resData.message || 'Something went wrong');
                return resData;
            } catch (err) { alert(err.message); throw err; }
        },
        login: (data) => api.request('/auth/login', 'POST', data),
        register: (data) => api.request('/auth/register', 'POST', data),
        createShipment: (data) => api.request('/shipments', 'POST', { ...data, userId: state.user?._id }),
        getUserShipments: (userId) => api.request(`/shipments/user/${userId}`),
        getAllShipments: () => api.request('/shipments'),
        trackShipment: (id) => api.request(`/shipments/track/${id}`),
        updateStatus: (id, data) => api.request(`/shipments/${id}/status`, 'PUT', data)
    };

    // --- Helper Components ---
    const Navbar = () => {
        const user = state.user;
        let navLinks = `
            <li class="nav-item" onclick="router.navigate('home')">Home</li>
            <li class="nav-item">Features</li>
            <li class="nav-item">About</li>
             <li class="nav-item" onclick="router.navigate('track')">Track Shipment</li>
        `;
        if (user) navLinks += `<li class="nav-item" onclick="router.navigate('dashboard')">Dashboard</li>`;

        const authBtn = user
            ? `<button class="btn btn-primary" onclick="handleLogout()">Logout</button>`
            : `<button class="btn btn-outline" onclick="router.navigate('login')">Login</button> <button class="btn btn-primary" onclick="router.navigate('register')">Get Started</button>`;

        return `
            <div class="container flex justify-between items-center">
                <div class="logo" onclick="router.navigate('home')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5 9.5 9.75 12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"/></svg>
                    SwiftCourier
                </div>
                <ul class="nav-links hidden-mobile">${navLinks}</ul>
                <div class="flex gap-4">${authBtn}</div>
            </div>
        `;
    };

    const Footer = () => `
        <footer style="background: #111827; color: white; padding: 4rem 0; margin-top: 4rem;">
            <div class="container text-center">
                <div class="logo justify-center mb-4" style="color:white;">SwiftCourier</div>
                <p style="color: #9ca3af; margin-bottom: 2rem;">Fast, reliable, and smart courier management for modern businesses.</p>
                <div style="color: #6b7280; font-size: 0.9rem;">&copy; 2025 SwiftCourier. All rights reserved.</div>
            </div>
        </footer>
    `;

    // --- Pages ---
    const pages = {
        home: `
            <section class="hero">
                <div class="container grid" style="grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
                    <div class="hero-content">
                        <h1 class="text-primary">Fast, Reliable <br> & Smart Courier <span class="text-primary">Management</span></h1>
                        <p class="text-muted" style="font-size: 1.125rem; margin-bottom: 2rem;">Real-time tracking, secure delivery, and easy booking. Experience the future of logistics with our intelligent courier management system.</p>
                        <div class="flex gap-4">
                            <button class="btn btn-primary" onclick="router.navigate('login')">Book Courier &rarr;</button>
                            <button class="btn btn-outline" onclick="router.navigate('track')">Track Shipment</button>
                        </div>
                    </div>
                    <div class="hero-image" style="background: #eff6ff; border-radius: 2rem; height: 400px; display:flex; align-items:center; justify-content:center;">
                        <!-- Placeholder for 3D Illustration -->
                        <div style="font-size: 5rem;">📦 🚚 🌍</div>
                    </div>
                </div>
            </section>

            <section class="container" style="padding: 4rem 1.5rem;">
                <h2 class="text-center" style="margin-bottom: 3rem;">Why Choose <span class="text-primary">SwiftCourier</span>?</h2>
                <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div class="feature-card">
                        <div style="background:#e0e7ff; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; color: var(--primary); margin-bottom:1rem;">⚡</div>
                        <h3>Real-time Tracking</h3>
                        <p class="text-muted">Track your packages in real-time with GPS precision. Know exactly where your shipment is at any moment.</p>
                    </div>
                    <div class="feature-card">
                        <div style="background:#d1fae5; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; color: #059669; margin-bottom:1rem;">🛡️</div>
                        <h3>Secure Delivery</h3>
                        <p class="text-muted">End-to-end encryption and proof of delivery ensure your packages are always safe and accounted for.</p>
                    </div>
                    <div class="feature-card">
                        <div style="background:#fce7f3; width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; color: #db2777; margin-bottom:1rem;">⏱️</div>
                        <h3>Express Shipping</h3>
                        <p class="text-muted">Need it fast? Our express shipping option guarantees same-day or next-day delivery.</p>
                    </div>
                </div>
            </section>

             <section style="background: var(--bg-surface); padding: 4rem 0;">
                <div class="container">
                    <h2 class="text-center" style="margin-bottom: 3rem;">How It <span class="text-primary">Works</span></h2>
                    <div class="flex justify-between" style="text-align: center;">
                        <div class="step-card">
                            <div class="step-number">01</div>
                            <h4>Book Courier</h4>
                            <p class="text-muted text-sm">Enter pickup & delivery details.</p>
                        </div>
                         <div class="step-card">
                            <div class="step-number">02</div>
                            <h4>Pickup</h4>
                            <p class="text-muted text-sm">Courier collects the package.</p>
                        </div>
                         <div class="step-card">
                            <div class="step-number">03</div>
                            <h4>Track</h4>
                            <p class="text-muted text-sm">Monitor journey in real-time.</p>
                        </div>
                         <div class="step-card">
                            <div class="step-number">04</div>
                            <h4>Delivered</h4>
                            <p class="text-muted text-sm">Secure delivery with proof.</p>
                        </div>
                    </div>
                </div>
            </section>
        `,
        login: `
            <div class="auth-container">
                <div class="auth-left">
                     <div class="logo" style="color: white; margin-bottom: 2rem;">SwiftCourier</div>
                    <h1>Welcome to <br> SwiftCourier</h1>
                    <p style="opacity: 0.9;">Fast, reliable, and smart courier management. Track shipments, book deliveries, and manage your logistics all in one place.</p>
                    <div class="auth-stats">
                        <div><h2>500K+</h2><small>Deliveries</small></div>
                        <div><h2>200+</h2><small>Cities</small></div>
                        <div><h2>99.9%</h2><small>On time</small></div>
                    </div>
                </div>
                <div class="auth-right">
                    <div class="auth-box">
                        <h2 class="text-center">Log In</h2>
                        <form onsubmit="handleLogin(event)">
                            <div class="input-group">
                                <label class="input-label">Email</label>
                                <input type="email" id="login-email" class="form-input" required placeholder="you@example.com">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Password</label>
                                <input type="password" id="login-password" class="form-input" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Log In &rarr;</button>
                        </form>
                        <p class="text-center text-muted" style="margin-top: 1.5rem;">Don't have an account? <a href="#" onclick="router.navigate('register')" class="text-primary">Create account</a></p>
                    </div>
                </div>
            </div>
        `,
        register: `
             <div class="auth-container">
                <div class="auth-left">
                    <div class="logo" style="color: white; margin-bottom: 2rem;">SwiftCourier</div>
                    <h1>Join the <br>Network</h1>
                    <p style="opacity: 0.9;">Create an account to start booking shipments and tracking your deliveries instantly.</p>
                </div>
                <div class="auth-right">
                    <div class="auth-box">
                        <h2 class="text-center">Create account</h2>
                        <p class="text-center text-muted" style="margin-bottom: 1.5rem;">Fill in your details to get started</p>
                        
                        <div class="role-tabs">
                            <div class="role-tab active" onclick="setRole('customer', this)">Customer</div>
                            <div class="role-tab" onclick="setRole('staff', this)">Delivery Staff</div>
                            <div class="role-tab" onclick="setRole('admin', this)">Admin</div>
                        </div>
                        <input type="hidden" id="reg-role" value="customer">

                        <form onsubmit="handleRegister(event)">
                            <div class="input-group">
                                <label class="input-label">Full Name</label>
                                <input type="text" id="reg-name" class="form-input" required placeholder="John Doe">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Email</label>
                                <input type="email" id="reg-email" class="form-input" required placeholder="you@example.com">
                            </div>
                            <div class="input-group">
                                <label class="input-label">Password</label>
                                <input type="password" id="reg-password" class="form-input" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Create Account &rarr;</button>
                        </form>
                        <p class="text-center text-muted" style="margin-top: 1.5rem;">Already have an account? <a href="#" onclick="router.navigate('login')" class="text-primary">Sign in</a></p>
                    </div>
                </div>
            </div>
        `,
        track: `
            <div class="container" style="padding: 4rem 1rem;">
                <div class="track-header">
                    <h2>Track Your <span class="text-primary">Shipment</span></h2>
                    <p class="text-muted">Enter your tracking ID to see real-time updates on your package</p>
                </div>
                <div class="track-input-container">
                    <input type="text" id="track-id" class="track-input" placeholder="Enter Tracking ID (e.g. SC284719)">
                    <button class="btn btn-primary" onclick="handleTrack()" style="border-radius: 99px; padding: 0.75rem 2rem; margin: 0.25rem;">Track</button>
                </div>

                <div id="track-result" style="display:none; margin-top: 3rem;">
                    <!-- Result Card -->
                    <div style="background:white; border:1px solid var(--border); border-radius: 1rem; padding: 2rem; box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
                         <div class="flex justify-between items-center" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                            <div>
                                <small class="text-muted">Tracking ID</small>
                                <h3 id="t-id" class="text-primary"></h3>
                            </div>
                            <span id="t-status" class="status-badge"></span>
                         </div>
                         <div class="flex justify-between">
                            <div>
                                <small class="text-muted">From</small>
                                <div id="t-from" style="font-weight: 600;"></div>
                            </div>
                            <div style="font-size: 1.5rem; color: var(--border);">---></div>
                            <div>
                                <small class="text-muted">To</small>
                                <div id="t-to" style="font-weight: 600;"></div>
                            </div>
                             <div>
                                <small class="text-muted">Est. Delivery</small>
                                <div id="t-est" style="font-weight: 600;">Dec 18, 2025</div>
                            </div>
                         </div>
                    </div>

                    <!-- Timeline & Map -->
                    <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                         <div>
                            <h3>Shipment Timeline</h3>
                            <div id="t-timeline" class="timeline-container"></div>
                        </div>
                        <div>
                            <h3>Live Location</h3>
                            <div id="track-map" style="background:#eff6ff; height:100%; min-height:300px; border-radius:1rem; display:flex; flex-direction:column; align-items:center; justify-content:center; border: 2px dashed var(--border);">
                                <div style="font-size:3rem">🗺️</div>
                                <p class="text-muted">Map View Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        dashboard: () => `
            <div class="container" style="padding: 3rem 1rem;">
                <div class="flex justify-between items-center mb-4">
                    <h2>Dashboard</h2>
                    <div>Welcome, <strong>${state.user?.name}</strong></div>
                </div>
                ${state.user?.role === 'customer' ? getCustomerDashboard() : getStaffDashboard()}
            </div>
        `
    };

    const getCustomerDashboard = () => `
        <div class="grid" style="grid-template-columns: 1fr; gap: 2rem;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; border: 1px solid var(--border);">
                 <div class="flex justify-between items-center mb-4">
                    <h3>Book New Shipment</h3>
                    <button class="btn btn-outline" onclick="loadUserShipments()">Refresh History</button>
                 </div>

                 <!-- Wizard Progress -->
                 <div class="wizard-steps">
                    <div id="w-step-1" class="wizard-step-item active">
                        <div class="step-indicator">1</div>
                        <div class="step-label">Sender</div>
                    </div>
                    <div id="w-step-2" class="wizard-step-item">
                        <div class="step-indicator">2</div>
                        <div class="step-label">Receiver</div>
                    </div>
                    <div id="w-step-3" class="wizard-step-item">
                        <div class="step-indicator">3</div>
                        <div class="step-label">Package</div>
                    </div>
                    <div id="w-step-4" class="wizard-step-item">
                        <div class="step-indicator">4</div>
                        <div class="step-label">Confirm</div>
                    </div>
                 </div>

                <!-- Wizard Steps -->
                <form onsubmit="handleBooking(event)">
                    
                    <!-- Step 1: Sender -->
                    <div id="step-1" class="form-step active">
                        <div class="input-group"><label class="input-label">Sender Name</label><input id="book-s-name" class="form-input" placeholder="Your Name"></div>
                         <div class="input-group"><label class="input-label">Sender Address</label><input id="book-s-addr" class="form-input" placeholder="Your Address"></div>
                        <button type="button" class="btn btn-primary" onclick="nextStep(1)">Next: Receiver &rarr;</button>
                    </div>

                    <!-- Step 2: Receiver -->
                    <div id="step-2" class="form-step">
                        <div class="input-group"><label class="input-label">Receiver Name</label><input id="book-r-name" class="form-input" placeholder="Receiver Name"></div>
                        <div class="input-group"><label class="input-label">Receiver Address</label><input id="book-r-addr" class="form-input" placeholder="Delivery Address"></div>
                         <div class="flex gap-4">
                            <button type="button" class="btn btn-outline" onclick="prevStep(2)">&larr; Back</button>
                            <button type="button" class="btn btn-primary" onclick="nextStep(2)">Next: Package &rarr;</button>
                        </div>
                    </div>

                    <!-- Step 3: Package -->
                    <div id="step-3" class="form-step">
                         <div class="input-group flex gap-4">
                            <div style="flex:1"><label class="input-label">Weight (kg)</label><input type="number" id="book-weight" class="form-input" placeholder="e.g. 5"></div>
                            <div style="flex:1"><label class="input-label">Type</label>
                                <select id="book-type" class="form-input">
                                    <option>Standard</option><option>Express</option>
                                </select>
                            </div>
                        </div>
                         <div class="input-group"><label class="input-label">Description</label><input id="book-desc" class="form-input" placeholder="Fragile, Electronics, etc."></div>
                         <div class="flex gap-4">
                            <button type="button" class="btn btn-outline" onclick="prevStep(3)">&larr; Back</button>
                            <button type="button" class="btn btn-primary" onclick="nextStep(3)">Calculate Price &rarr;</button>
                        </div>
                    </div>

                    <!-- Step 4: Confirm -->
                    <div id="step-4" class="form-step">
                        <div style="background: var(--bg-surface); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; text-align: center;">
                            <small class="text-muted">Estimated Cost</small>
                            <h2 id="price-display" class="text-primary" style="font-size: 2.5rem; margin: 0.5rem 0;">$0.00</h2>
                            <p id="summary-text" class="text-muted text-sm"></p>
                        </div>
                         <div class="flex gap-4">
                            <button type="button" class="btn btn-outline" onclick="prevStep(4)">&larr; Back</button>
                            <button type="submit" class="btn btn-primary btn-block">Confirm & Pay</button>
                        </div>
                    </div>

                </form>
            </div>
            
            <div>
                 <h3>Your Recent Shipments</h3>
                 <div id="user-shipments" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">Loading...</div>
            </div>
        </div>
    `;

    const getStaffDashboard = () => `
        <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
            <!-- Pickup Queue -->
            <div>
                <h3 class="flex items-center gap-2">
                    <span>🔔</span> Pickup Requests
                    <span id="pickup-count" class="badge">0</span>
                </h3>
                <div id="pickup-list" style="margin-top: 1rem;">
                    <p class="text-muted">No new requests.</p>
                </div>
            </div>

            <!-- Active Deliveries -->
            <div>
                <h3 class="flex items-center gap-2">
                    <span>🚚</span> Active Deliveries
                </h3>
                <div id="active-list" style="margin-top: 1rem;">
                    <p class="text-muted">No active jobs.</p>
                </div>
            </div>
        </div>
    `;

    // --- Router ---
    const router = {
        navigate: (page) => {
            const app = document.getElementById('app');
            const isAuthPage = ['login', 'register'].includes(page);

            // Render Content
            app.innerHTML = typeof pages[page] === 'function' ? pages[page]() : pages[page];

            // Render Navbar/Footer only if NOT auth page
            const nav = document.getElementById('nav-placeholder');
            const foot = document.getElementById('footer-placeholder');
            if (nav) nav.innerHTML = isAuthPage ? '' : Navbar();
            if (foot) foot.innerHTML = isAuthPage ? '' : Footer();

            window.scrollTo(0, 0);

            // Post-render actions
            if (page === 'dashboard') {
                if (state.user?.role === 'customer') loadUserShipments();
                else loadAllShipments();
            }
        }
    };

    // --- Actions ---
    window.router = router;

    window.setRole = (role, el) => {
        document.getElementById('reg-role').value = role;
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
    };

    window.handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await api.login({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            state.user = data; state.token = data.token;
            router.navigate('dashboard');
        } catch (err) { console.error(err); }
    };

    window.handleRegister = async (e) => {
        e.preventDefault();
        try {
            const data = await api.register({
                name: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                role: document.getElementById('reg-role').value
            });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            state.user = data; state.token = data.token;
            router.navigate('dashboard');
        } catch (err) { console.error(err); }
    };

    window.handleLogout = () => {
        localStorage.clear();
        state.user = null; state.token = null;
        router.navigate('login');
    };

    let bookingData = {};

    window.nextStep = (step) => {
        // Validation
        const sName = document.getElementById('book-s-name').value;
        const sAddr = document.getElementById('book-s-addr').value;
        const rName = document.getElementById('book-r-name').value;
        const rAddr = document.getElementById('book-r-addr').value;
        const weight = document.getElementById('book-weight').value;
        const type = document.getElementById('book-type').value;

        if (step === 1) {
            if (!sName || !sAddr) return alert('Please complete Sender details');
            bookingData.sender = { name: sName, address: sAddr, contact: '1234567890' };
        }
        if (step === 2) {
            if (!rName || !rAddr) return alert('Please complete Receiver details');
            bookingData.receiver = { name: rName, address: rAddr, contact: '0987654321' };
        }
        if (step === 3) {
            if (!weight) return alert('Please enter weight');
            bookingData.packageDetails = { weight, packageType: type, description: document.getElementById('book-desc').value };

            // Price Calc
            const basePrice = 10;
            const weightPrice = weight * 5;
            const typePrice = type === 'Express' ? 20 : 0;
            const total = basePrice + weightPrice + typePrice;
            document.getElementById('price-display').innerText = '$' + total.toFixed(2);
            document.getElementById('summary-text').innerText = `${type} delivery of ${weight}kg package to ${rAddr}.`;
        }

        // Transition
        document.getElementById(`step-${step}`).classList.remove('active');
        document.getElementById(`step-${step + 1}`).classList.add('active');

        document.getElementById(`w-step-${step}`).classList.add('completed');
        document.getElementById(`w-step-${step}`).classList.remove('active');
        document.getElementById(`w-step-${step + 1}`).classList.add('active');
    };

    window.prevStep = (step) => {
        document.getElementById(`step-${step}`).classList.remove('active');
        document.getElementById(`step-${step - 1}`).classList.add('active');

        document.getElementById(`w-step-${step}`).classList.remove('active');
        document.getElementById(`w-step-${step - 1}`).classList.remove('completed');
        document.getElementById(`w-step-${step - 1}`).classList.add('active');
    };

    window.handleBooking = async (e) => {
        e.preventDefault();
        try {
            await api.createShipment(bookingData);
            alert('Shipment Booked Successfully!');
            // Reset Wizard
            loadUserShipments();
            router.navigate('dashboard'); // Re-render to reset
        } catch (err) { console.error(err); alert('Booking Failed'); }
    };

    window.handleTrack = async () => {
        const id = document.getElementById('track-id').value;
        const resDiv = document.getElementById('track-result');
        try {
            const data = await api.trackShipment(id);
            resDiv.style.display = 'block';

            // Populate Basic Info
            document.getElementById('t-id').innerText = data.trackingId;
            document.getElementById('t-status').innerText = data.status;
            document.getElementById('t-status').className = `status-badge status-${data.status.replace(/ /g, '-')}`;
            document.getElementById('t-from').innerText = data.sender?.address || 'N/A';
            document.getElementById('t-to').innerText = data.receiver?.address || 'N/A';

            // Populate Timeline
            const steps = ['Booked', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
            let currentFound = false;

            // Map actual history to steps for visualization
            const historyMap = new Map(data.history.map(h => [h.status, h]));

            const historyHtml = steps.map((step, index) => {
                const historyItem = historyMap.get(step);
                const isCompleted = !!historyItem;
                const isCurrent = step === data.status;

                let statusClass = '';
                if (isCurrent) statusClass = 'active';
                else if (isCompleted) statusClass = 'completed';

                const time = historyItem ? new Date(historyItem.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                const loc = historyItem ? historyItem.location : '';

                return `
                <div class="timeline-item ${statusClass}">
                    <div class="timeline-line"></div>
                    <div class="timeline-icon">
                       ${getIconForStatus(step)}
                    </div>
                    <div class="timeline-content">
                        <div>
                            <div style="font-weight:600">${step}</div>
                            <small class="text-muted">${loc}</small>
                        </div>
                        <div class="text-muted" style="font-size:0.875rem">
                           ${time}
                        </div>
                    </div>
                </div>`;
            }).join('');
            document.getElementById('t-timeline').innerHTML = historyHtml;

            // Mock Map Update
            document.getElementById('track-map').innerHTML = `
                <div style="font-size:3rem">🗺️</div>
                <p class="text-muted" style="margin-top:1rem">Current Location: <strong>${data.currentLocation}</strong></p>
                <div style="background:#dbeafe; padding:0.5rem 1rem; border-radius:1rem; font-size:0.8rem; color:var(--primary); margin-top:0.5rem">Live GPS Signal Active</div>
            `;

        } catch (err) {
            resDiv.style.display = 'none';
            alert('Shipment not found');
        }
    };

    window.updateShipmentStatus = async (id) => {
        const newStatus = prompt("Enter status (Picked Up, In Transit, Out for Delivery, Delivered):");
        const loc = prompt("Enter location:");
        if (!newStatus) return;
        try {
            await api.updateStatus(id, { status: newStatus, location: loc });
            loadAllShipments();
        } catch (err) { console.error(err); }
    };

    function getIconForStatus(status) {
        if (status.includes('Booked')) return '📦';
        if (status.includes('Picked')) return '🚚';
        if (status.includes('Transit')) return '✈️';
        if (status.includes('Delivered')) return '✅';
        return '📍';
    }

    async function loadUserShipments() {
        try {
            const data = await api.getUserShipments(state.user._id);
            document.getElementById('user-shipments').innerHTML = data.map(s => `
                <div style="padding: 1rem; border-bottom: 1px solid var(--border); display:flex; justify-content:space-between;">
                    <div><strong>${s.trackingId}</strong> <br> <small>${s.receiver.name}</small></div>
                    <span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span>
                </div>
            `).join('');
        } catch (err) { }
    }

    async function loadAllShipments() {
        try {
            const data = await api.getAllShipments();

            // Filter
            const pickups = data.filter(s => s.status === 'Booked');
            const active = data.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status));

            // Render Pickups
            const pickupHtml = pickups.length ? pickups.map(s => `
                <div class="action-card">
                    <div>
                        <strong>${s.trackingId}</strong> <br>
                        <small class="text-muted">${s.sender.address} -> ${s.receiver.address}</small> <br>
                        <span class="status-badge status-Booked">New</span>
                    </div>
                    <div>
                        <button class="btn btn-primary" style="padding: 0.5rem;" onclick="handleStaffAction('${s.trackingId}', 'Picked Up')">Accept</button>
                    </div>
                </div>
            `).join('') : '<p class="text-muted">No new requests.</p>';

            document.getElementById('pickup-list').innerHTML = pickupHtml;
            document.getElementById('pickup-count').innerText = pickups.length;

            // Render Active
            const activeHtml = active.length ? active.map(s => `
                <div class="action-card">
                    <div>
                        <strong>${s.trackingId}</strong> <br>
                        <small class="text-muted">Status: ${s.status}</small>
                    </div>
                    <div class="action-btn-group">
                        ${getActionsForStatus(s)}
                    </div>
                </div>
            `).join('') : '<p class="text-muted">No active jobs.</p>';

            document.getElementById('active-list').innerHTML = activeHtml;

        } catch (err) { }
    }

    window.handleStaffAction = async (id, status) => {
        let proof = null;
        if (status === 'Delivered') {
            const hasProof = confirm("Client received package? Click OK to simulate Photo Upload.");
            if (!hasProof) return;
            proof = "https://via.placeholder.com/150?text=Proof+of+Delivery"; // Mock URL
        }

        if (confirm(`Update status to ${status}?`)) {
            try {
                await api.updateStatus(id, { status, deliveryProof: proof });

                // Mock Notification
                alert(`Notification Sent: Shipment ${id} is now ${status}`);

                loadAllShipments();
            } catch (err) { console.error(err); }
        }
    };

    function getActionsForStatus(s) {
        if (s.status === 'Picked Up') return `<button class="btn btn-outline" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'In Transit')">Start Transit</button>`;
        if (s.status === 'In Transit') return `<button class="btn btn-outline" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'Out for Delivery')">Out for Delivery</button>`;
        if (s.status === 'Out for Delivery') return `<button class="btn btn-success" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'Delivered')">Complete</button>`;
        return '';
    }

    // --- Init ---
    router.navigate('home');
});

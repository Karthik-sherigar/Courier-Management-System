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
            } catch (err) {
                // Suppress standard alert here, let caller handle or show toast
                throw err;
            }
        },
        login: (data) => api.request('/auth/login', 'POST', data),
        register: (data) => api.request('/auth/register', 'POST', data),
        createShipment: (data) => api.request('/shipments', 'POST', { ...data, userId: state.user?._id }),
        getUserShipments: (userId) => api.request(`/shipments/user/${userId}`),
        getAllShipments: () => api.request('/shipments'),
        trackShipment: (id) => api.request(`/shipments/track/${id}`),
        updateStatus: (id, data) => api.request(`/shipments/${id}/status`, 'PUT', data)
    };

    // --- Toast Notification ---
    const showToast = (message, type = 'info') => {
        const container = document.getElementById('toast-container') || createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const createToastContainer = () => {
        const div = document.createElement('div');
        div.id = 'toast-container';
        div.className = 'toast-container';
        document.body.appendChild(div);
        return div;
    };

    // --- Helper Components ---
    const Navbar = () => {
        const user = state.user;
        const currentHash = window.location.hash.replace('#', '') || 'home';

        let linksHtml = '';

        // Strict Nav Logic
        if (!user) {
            // Guest: Only Home
            linksHtml = `<li class="nav-item ${currentHash === 'home' ? 'active' : ''}" onclick="router.navigate('home')">Home</li>`;
        } else {
            // Auth: Home, Track, Dashboard
            // Logic:
            // Customer: Home, Track, Dashboard
            // Staff/Admin: Track, Dashboard (No Home)

            if (user.role === 'customer') {
                linksHtml += `<li class="nav-item ${currentHash === 'home' ? 'active' : ''}" onclick="router.navigate('home')">Home</li>`;
            }

            linksHtml += `
                <li class="nav-item ${currentHash === 'track' ? 'active' : ''}" onclick="router.navigate('track')">Track Shipment</li>
                <li class="nav-item ${currentHash === 'dashboard' ? 'active' : ''}" onclick="router.navigate('dashboard')">Dashboard</li>
            `;
        }

        const authBtn = user
            ? `<button class="btn btn-primary" onclick="handleLogout()">Logout</button>`
            : `<button class="btn btn-outline" onclick="router.navigate('login')">Login</button> <button class="btn btn-primary" onclick="router.navigate('register')">Get Started</button>`;

        return `
            <div class="glass" style="width:100%">
                <div class="container flex justify-between items-center" style="padding-top:1rem; padding-bottom:1rem;">
                    <div class="logo" onclick="router.navigate('home')">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5 9.5 9.75 12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"/></svg>
                        SwiftCourier
                    </div>
                    
                    <button class="mobile-toggle" onclick="toggleMobileMenu()">☰</button>

                    <ul id="nav-links-list" class="nav-links">
                        ${linksHtml}
                         <!-- Mobile Only Auth Buttons -->
                         <li class="nav-item hidden" style="display:none;" id="mobile-auth">
                            ${authBtn}
                         </li>
                    </ul>

                    <div class="flex gap-4 hidden-mobile">${authBtn}</div>
                </div>
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
                <div class="container-narrow grid" style="grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
                    <div class="hero-content">
                        <h1 class="text-primary">Fast, Reliable <br> & Smart Courier <span class="text-primary">Management</span></h1>
                        <p class="text-muted" style="font-size: 1.125rem; margin-bottom: 2rem;">Real-time tracking, secure delivery, and easy booking. Experience the future of logistics with our intelligent courier management system.</p>
                        <div class="flex gap-4">
                            <button class="btn btn-primary" onclick="handleHomeBooking()">Book Courier &rarr;</button>
                            <button class="btn btn-outline" onclick="router.navigate('track')">Track Shipment</button>
                        </div>
                    </div>
                    <div class="hero-image" style="background: #eff6ff; border-radius: 2rem; height: 400px; display:flex; align-items:center; justify-content:center;">
                        <!-- Placeholder for 3D Illustration -->
                        <div style="font-size: 5rem;">📦 🚚 🌍</div>
                    </div>
                </div>
            </section>

            <section class="container-narrow" style="padding: 4rem 1.5rem;">
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
                <div class="container-narrow">
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
            <div class="container">
                <div class="dashboard-header">
                    <div>
                        <h2 style="margin:0;">Dashboard</h2>
                        <p class="text-muted" style="margin:0;">Welcome back, <strong>${state.user?.name}</strong></p>
                    </div>
                    <div>
                         <span class="status-badge status-Booked">${state.user?.role.toUpperCase()}</span>
                    </div>
                </div>
                ${state.user?.role === 'customer' ? getCustomerDashboard() : state.user?.role === 'staff' ? getStaffDashboard() : getAdminDashboard()}
            </div>
        `
    };

    // --- Auto Refresh ---
    let refreshInterval;
    const startAutoRefresh = () => {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            const page = window.location.hash || 'dashboard'; // simple check
            if (state.user) {
                if (state.user.role === 'customer') loadUserShipments();
                else loadAllShipments();
            }
        }, 10000); // 10s refresh
    };

    const stopAutoRefresh = () => {
        if (refreshInterval) clearInterval(refreshInterval);
    };

    const getCustomerDashboard = () => `
        <div class="grid" style="grid-template-columns: 1fr; gap: 2rem;">
            <!-- Summary Cards -->
            <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div class="status-card" style="background:var(--primary); color:white; padding:1.5rem; border-radius:1rem;">
                    <h3 id="cust-total">0</h3>
                    <small>Total Bookings</small>
                </div>
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="cust-active">0</h3>
                    <small class="text-muted">In Transit</small>
                </div>
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="cust-delivered">0</h3>
                    <small class="text-muted">Delivered</small>
                </div>
            </div>

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
                 <div id="user-shipments" class="dashboard-grid">Loading...</div>
            </div>
        </div>
    `;

    const getAdminDashboard = () => `
        <div class="grid" style="grid-template-columns: 1fr; gap: 2rem;">
            <!-- Analytics Cards -->
            <div class="grid" style="grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="admin-total">0</h3>
                    <small class="text-muted">Total Shipments</small>
                </div>
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="admin-active">0</h3>
                    <small class="text-muted">Active Now</small>
                </div>
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="admin-revenue" class="text-primary">$0</h3>
                    <small class="text-muted">Total Revenue</small>
                </div>
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="admin-delayed" style="color:var(--danger)">0</h3>
                    <small class="text-muted">Delayed (>3d)</small>
                </div>
            </div>

            <!-- Shipment Monitor -->
            <div style="background: white; padding: 2rem; border-radius: 1rem; border: 1px solid var(--border);">
                <h3>Live Shipment Monitor</h3>
                <div style="overflow-x:auto;">
                    <table style="width:100%; text-align:left; border-collapse:collapse; margin-top:1rem;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border); color:var(--text-muted);">
                                <th style="padding:1rem;">Tracking ID</th>
                                <th style="padding:1rem;">Sender</th>
                                <th style="padding:1rem;">Status</th>
                                <th style="padding:1rem;">Price</th>
                                <th style="padding:1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="admin-shipment-list">
                            <tr><td colspan="5" style="padding:1rem; text-align:center;">Loading...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    const getStaffDashboard = () => `
        <div class="grid" style="grid-template-columns: 1fr; gap: 2rem;">
             <!-- Stats for Staff -->
            <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="pickup-count">0</h3>
                    <small>Pending Pickups</small>
                </div>
                 <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3 id="active-jobs-count">0</h3>
                    <small>Active Deliveries</small>
                </div>
                 <div class="status-card" style="background:white; border:1px solid var(--border); padding:1.5rem; border-radius:1rem;">
                    <h3>--</h3>
                    <small>Performance</small>
                </div>
            </div>

            <!-- New Pickup Requests -->
            <div>
                <h3 style="margin-bottom:1rem">New Pickup Requests</h3>
                <div id="pickup-list" class="dashboard-grid">Loading...</div>
            </div>

            <!-- Active Jobs -->
             <div>
                <h3 style="margin-bottom:1rem">My Active Jobs</h3>
                <div id="active-list" class="dashboard-grid">Loading...</div>
            </div>
        </div>
    `;


    // --- Router ---
    const router = {
        navigate: (page) => {
            // Strict Role Routing Guard
            if (page === 'home' && state.user && ['staff', 'admin'].includes(state.user.role)) {
                return router.navigate('dashboard');
            }

            // Update URL hash for history and active link checking
            window.location.hash = page;

            stopAutoRefresh(); // Stop previous poll
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
                startAutoRefresh(); // Start polling
            } else if (page === 'track') {
                // Tracking auto-refresh could be added here similar to dashboard
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
            showToast('Login Successful!', 'success');
            router.navigate('dashboard');
        } catch (err) {
            showToast(err.message, 'error');
        }
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
            showToast('Account Created!', 'success');
            router.navigate('dashboard');
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    window.handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            state.user = null; state.token = null;
            showToast('Logged out successfully', 'info');
            router.navigate('login');
        }
    };

    window.handleHomeBooking = () => {
        if (state.user) {
            router.navigate('dashboard');
        } else {
            router.navigate('login');
        }
    };

    window.toggleMobileMenu = () => {
        const nav = document.getElementById('nav-links-list');
        nav.classList.toggle('active');
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
            if (!sName || !sAddr) return showToast('Please complete Sender details', 'error');
            bookingData.sender = { name: sName, address: sAddr, contact: '1234567890' };
        }
        if (step === 2) {
            if (!rName || !rAddr) return showToast('Please complete Receiver details', 'error');
            bookingData.receiver = { name: rName, address: rAddr, contact: '0987654321' };
        }
        if (step === 3) {
            if (!weight) return showToast('Please enter weight', 'error');

            // Price Calc
            const basePrice = 10;
            const weightPrice = weight * 5;
            const typePrice = type === 'Express' ? 20 : 0;
            const total = basePrice + weightPrice + typePrice;

            bookingData.packageDetails = {
                weight,
                packageType: type,
                description: document.getElementById('book-desc').value,
                price: total
            };

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
            showToast('Shipment Booked Successfully!', 'success');
            // Reset Wizard
            loadUserShipments();
            router.navigate('dashboard'); // Re-render to reset
        } catch (err) { showToast('Booking Failed: ' + err.message, 'error'); }
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
            showToast('Shipment not found', 'error');
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

            // Populate Cards
            document.getElementById('cust-total').innerText = data.length;
            document.getElementById('cust-active').innerText = data.filter(s => ['In Transit', 'Out for Delivery', 'Picked Up'].includes(s.status)).length;
            document.getElementById('cust-delivered').innerText = data.filter(s => s.status === 'Delivered').length;

            document.getElementById('user-shipments').innerHTML = data.map(s => `
                <div class="modern-card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">${s.trackingId}</div>
                            <small class="text-muted">To: ${s.receiver.name}</small>
                        </div>
                        <span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span>
                    </div>
                    <div class="card-body">
                         <p class="text-sm text-muted">From: ${s.sender.address}</p>
                         <p class="text-sm text-muted">To: ${s.receiver.address}</p>
                    </div>
                    <div class="card-footer">
                         <button class="btn btn-outline" style="padding:0.5rem;" onclick="router.navigate('track'); setTimeout(()=> {document.getElementById('track-id').value='${s.trackingId}'; handleTrack()}, 500);">Track</button>
                    </div>
                </div>
            `).join('');
        } catch (err) { }
    }

    async function loadAllShipments() {
        try {
            const data = await api.getAllShipments();

            // ADMIN LOGIC
            if (state.user.role === 'admin') {
                const total = data.length;
                const activeCount = data.filter(s => ['In Transit', 'Out for Delivery', 'Picked Up'].includes(s.status)).length;
                const revenue = data.reduce((acc, curr) => acc + (curr.packageDetails?.price || 0), 0);
                // Mock delay
                const delayed = data.filter(s => new Date(s.createdAt) < new Date(Date.now() - 3 * 86400000) && s.status !== 'Delivered').length;

                document.getElementById('admin-total').innerText = total;
                document.getElementById('admin-active').innerText = activeCount;
                document.getElementById('admin-revenue').innerText = '$' + revenue.toFixed(2);
                document.getElementById('admin-delayed').innerText = delayed;

                document.getElementById('admin-shipment-list').innerHTML = data.map(s => `
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:1rem;"><strong>${s.trackingId}</strong></td>
                    <td style="padding:1rem;">${s.sender.name}</td>
                    <td style="padding:1rem;"><span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span></td>
                    <td style="padding:1rem;">$${(s.packageDetails?.price || 0).toFixed(2)}</td>
                    <td style="padding:1rem;">
                         <button class="btn btn-outline" style="padding:0.25rem 0.5rem; font-size:0.8rem" onclick="router.navigate('track'); setTimeout(()=> {document.getElementById('track-id').value='${s.trackingId}'; handleTrack()}, 500);">View</button>
                    </td>
                </tr>
            `).join('');
                return;
            }

            // STAFF LOGIC

            // Filter
            const pickups = data.filter(s => s.status === 'Booked');
            const active = data.filter(s => ['Picked Up', 'In Transit', 'Out for Delivery'].includes(s.status));

            // Render Pickups
            const pickupHtml = pickups.length ? pickups.map(s => `
            <div class="modern-card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${s.trackingId}</div>
                        <div class="card-subtitle">Pickup Request</div>
                    </div>
                    <span class="status-badge status-Booked">New</span>
                </div>
                <div class="card-body">
                    <p><strong>From:</strong> ${s.sender.address}</p>
                    <p><strong>To:</strong> ${s.receiver.address}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" onclick="handleStaffAction('${s.trackingId}', 'Picked Up')">Accept</button>
                    <button class="btn btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="handleStaffAction('${s.trackingId}', 'Cancelled')">Reject</button>
                </div>
            </div>
        `).join('') : '<div class="text-muted text-center" style="grid-column: 1 / -1; padding: 2rem;">No new pickup requests.</div>';

            document.getElementById('pickup-list').innerHTML = pickupHtml;
            document.getElementById('pickup-count').innerText = pickups.length;

            // Render Active
            const activeHtml = active.length ? active.map(s => `
            <div class="modern-card">
                 <div class="card-header">
                    <div>
                        <div class="card-title">${s.trackingId}</div>
                        <div class="card-subtitle">Active Delivery</div>
                    </div>
                    <span class="status-badge status-${s.status.replace(/ /g, '-')}">${s.status}</span>
                </div>
                 <div class="card-body">
                    <p><strong>From:</strong> ${s.sender.address}</p>
                    <p><strong>To:</strong> ${s.receiver.address}</p>
                    <p class="text-muted text-sm" style="margin-top:0.5rem">Current: ${s.currentLocation || 'N/A'}</p>
                </div>
                <div class="card-footer">
                    ${getActionsForStatus(s)}
                </div>
            </div>
        `).join('') : '<div class="text-muted text-center" style="grid-column: 1 / -1; padding: 2rem;">No active jobs.</div>';

            document.getElementById('active-list').innerHTML = activeHtml;
            document.getElementById('active-jobs-count').innerText = active.length; // Update count

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
                showToast(`Status updated to ${status}`, 'success');

                loadAllShipments();
            } catch (err) { showToast(err.message, 'error'); }
        }
    };

    function getActionsForStatus(s) {
        if (s.status === 'Picked Up') return `<button class="btn btn-outline" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'In Transit')">Start Transit</button>`;
        if (s.status === 'In Transit') return `<button class="btn btn-outline" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'Out for Delivery')">Out for Delivery</button>`;
        if (s.status === 'Out for Delivery') return `<button class="btn btn-success" style="padding:0.25rem 0.5rem" onclick="handleStaffAction('${s.trackingId}', 'Delivered')">Complete</button>`;
        return '';
    }

    // --- Init ---
    // --- Init ---
    const initPage = window.location.hash.replace('#', '') || 'home';
    router.navigate(initPage);
});

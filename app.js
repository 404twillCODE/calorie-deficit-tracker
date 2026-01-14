// Initialize Supabase client
let supabaseClient;
let currentUser = null;

// Initialize Supabase - scripts load in order, so this should work
(function initSupabase() {
    if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined' && supabaseUrl && supabaseAnonKey) {
        if (typeof supabase !== 'undefined') {
            try {
                supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
                console.log('✓ Supabase client initialized');
            } catch (error) {
                console.error('✗ Error initializing Supabase:', error);
            }
        } else {
            console.error('✗ Supabase library not loaded - check script order');
        }
    } else {
        console.error('✗ Supabase credentials missing - check config.js');
    }
})();

// State management
let currentDate = new Date();
let todayData = null;
let allData = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Give a moment for Supabase to initialize if needed
    if (!supabaseClient && typeof supabase !== 'undefined') {
        if (typeof supabaseUrl !== 'undefined' && typeof supabaseAnonKey !== 'undefined' && supabaseUrl && supabaseAnonKey) {
            supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
            console.log('✓ Supabase client initialized on DOMContentLoaded');
        }
    }
    
    // Handle email verification callback
    await handleEmailVerificationCallback();
    
    await checkAuth();
    setupAuthListeners();
});

// Handle email verification callback from URL hash
async function handleEmailVerificationCallback() {
    if (!supabaseClient) return;
    
    // Check if there's a hash in the URL (from email verification)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
        // Password reset flow - clear hash
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }
    
    if (accessToken && type === 'signup') {
        // Email verification successful
        try {
            // The session should already be set by Supabase, but we'll verify
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            
            if (session && session.user) {
                // Clear the hash from URL
                window.history.replaceState(null, '', window.location.pathname);
                // Show success message
                showLoginForm();
                showAuthError('loginError', 'Email verified! You can now sign in.');
            }
        } catch (error) {
            console.error('Error handling verification callback:', error);
        }
    }
}

// Check authentication status
async function checkAuth() {
    if (!supabaseClient) {
        console.error('Supabase client not initialized. Check config.js and ensure Supabase CDN is loaded.');
        showAuthScreen();
        // Show error in the auth form
        setTimeout(() => {
            const errorMsg = document.getElementById('loginError') || document.getElementById('signupError');
            if (errorMsg) {
                showAuthError(errorMsg.id, 'Supabase is not configured. Please check your configuration.');
            }
        }, 100);
        return;
    }

    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.error('Error checking session:', error);
            showAuthScreen();
            return;
        }

        if (session && session.user) {
            currentUser = session.user;
            showAppScreen();
            initializeApp();
        } else {
            showAuthScreen();
        }
    } catch (error) {
        console.error('Error in checkAuth:', error);
        showAuthScreen();
    }

    // Listen for auth state changes (but don't auto-refresh)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
            // Only update if we're not already showing the app
            if (!currentUser || currentUser.id !== session.user.id) {
                currentUser = session.user;
                showAppScreen();
                initializeApp();
            }
        } else if (event === 'SIGNED_OUT') {
            // Only update if we're currently signed in
            if (currentUser) {
                currentUser = null;
                allData = [];
                todayData = null;
                showAuthScreen();
            }
        } else if (event === 'TOKEN_REFRESHED') {
            // Token refreshed, update session but don't change UI
            if (session && session.user) {
                currentUser = session.user;
            }
        }
    });
}

// Setup authentication event listeners
function setupAuthListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Signup
    document.getElementById('signupBtn').addEventListener('click', handleSignup);
    document.getElementById('signupPasswordConfirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });

    // Form switching
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Show auth screen
function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').classList.add('hidden');
    clearAuthErrors();
}

// Show app screen
function showAppScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').classList.remove('hidden');
}

// Show login form
function showLoginForm() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    clearAuthErrors();
}

// Show signup form
function showSignupForm() {
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    clearAuthErrors();
}

// Handle login
async function handleLogin() {
    // Check if Supabase is configured
    if (!supabaseClient) {
        showAuthError('loginError', 'Supabase is not configured. Please check your configuration.');
        console.error('Supabase client is not initialized');
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAuthError('loginError', 'Please enter both email and password');
        return;
    }

    // Disable button during login
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing In...';

    try {
        console.log('Attempting to sign in...');
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error);
            showAuthError('loginError', error.message || 'Failed to sign in. Please try again.');
            loginBtn.disabled = false;
            loginBtn.textContent = originalText;
            return;
        }

        if (data.user) {
            console.log('Login successful');
            currentUser = data.user;
            showAppScreen();
            initializeApp();
        }
    } catch (error) {
        console.error('Login exception:', error);
        showAuthError('loginError', 'An error occurred. Please check the console for details.');
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
}

// Handle signup
async function handleSignup() {
    // Check if Supabase is configured
    if (!supabaseClient) {
        showAuthError('signupError', 'Supabase is not configured. Please check your configuration.');
        console.error('Supabase client is not initialized');
        return;
    }

    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    if (!email || !password || !passwordConfirm) {
        showAuthError('signupError', 'Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showAuthError('signupError', 'Password must be at least 6 characters');
        return;
    }

    if (password !== passwordConfirm) {
        showAuthError('signupError', 'Passwords do not match');
        return;
    }

    // Disable button during signup
    const signupBtn = document.getElementById('signupBtn');
    const originalText = signupBtn.textContent;
    signupBtn.disabled = true;
    signupBtn.textContent = 'Creating Account...';

    try {
        console.log('Attempting to sign up...');
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error('Signup error:', error);
            showAuthError('signupError', error.message || 'Failed to create account. Please try again.');
            signupBtn.disabled = false;
            signupBtn.textContent = originalText;
            return;
        }

        console.log('Signup successful:', data);

        // Check if email confirmation is required
        if (data.user && !data.session) {
            // Email confirmation required
            showSignupSuccess(`Account created! Please check your email (${email}) to verify your account.`);
            signupBtn.disabled = false;
            signupBtn.textContent = originalText;
            
            // Clear form
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            document.getElementById('signupPasswordConfirm').value = '';
            
            // Don't auto-switch to login form - let user stay on signup form
            return;
        }

        if (data.user && data.session) {
            // Email confirmation not required, auto sign in
            console.log('Auto sign-in successful');
            currentUser = data.user;
            showAppScreen();
            initializeApp();
        } else {
            showAuthError('signupError', 'Account creation failed. Please try again.');
            signupBtn.disabled = false;
            signupBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Signup exception:', error);
        showAuthError('signupError', 'An error occurred. Please check the console for details.');
        signupBtn.disabled = false;
        signupBtn.textContent = originalText;
    }
}

// Handle logout
async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
        // Auth state change listener will handle UI update
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Show auth error
function showAuthError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (!errorEl) {
        console.error('Error element not found:', elementId);
        alert(message); // Fallback to alert
        return;
    }
    errorEl.textContent = message;
    errorEl.classList.add('show');
    // Hide success message if showing
    const successEl = document.getElementById('signupSuccess');
    if (successEl) {
        successEl.classList.remove('show');
    }
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, 5000);
}

// Show signup success message
function showSignupSuccess(message) {
    const successEl = document.getElementById('signupSuccess');
    if (!successEl) {
        alert(message); // Fallback to alert
        return;
    }
    successEl.textContent = message;
    successEl.classList.add('show');
    // Hide error message if showing
    const errorEl = document.getElementById('signupError');
    if (errorEl) {
        errorEl.classList.remove('show');
    }
    // Keep success message visible longer
    setTimeout(() => {
        successEl.classList.remove('show');
    }, 10000);
}

// Clear auth errors
function clearAuthErrors() {
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    const signupSuccess = document.getElementById('signupSuccess');
    
    if (loginError) {
        loginError.classList.remove('show');
        loginError.textContent = '';
    }
    if (signupError) {
        signupError.classList.remove('show');
        signupError.textContent = '';
    }
    if (signupSuccess) {
        signupSuccess.classList.remove('show');
        signupSuccess.textContent = '';
    }
}

// Show general error
function showError(message) {
    alert(message);
}

// Initialize app after authentication
function initializeApp() {
    updateDateDisplay();
    loadTodayData();
    setupEventListeners();
}

// Update date display
function updateDateDisplay() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[currentDate.getDay()];
    const dateStr = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    document.getElementById('dayName').textContent = dayName;
    document.getElementById('dateValue').textContent = dateStr;
    
    // Update stat label
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(currentDate);
    selectedDate.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();
    
    const labelEl = document.getElementById('todayDeficitLabel');
    if (labelEl) {
        labelEl.textContent = isToday ? "Today's Deficit" : "Day's Deficit";
    }
    
    // Update navigation buttons
    updateDateNavigation();
}

// Change date by days
function changeDate(days) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    currentDate = newDate;
    updateDateDisplay();
    loadTodayData();
}

// Go to today
function goToToday() {
    currentDate = new Date();
    updateDateDisplay();
    loadTodayData();
}

// Update date navigation buttons
function updateDateNavigation() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(currentDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    const isToday = selectedDate.getTime() === today.getTime();
    
    const todayBtn = document.getElementById('todayBtn');
    if (todayBtn) {
        if (isToday) {
            todayBtn.classList.add('hidden');
        } else {
            todayBtn.classList.remove('hidden');
        }
    }
    
    // Disable next button if trying to go to future
    const nextDayBtn = document.getElementById('nextDayBtn');
    if (nextDayBtn) {
        if (selectedDate >= today) {
            nextDayBtn.disabled = true;
        } else {
            nextDayBtn.disabled = false;
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDay);
    }
    
    const caloriesEaten = document.getElementById('caloriesEaten');
    const caloriesBurned = document.getElementById('caloriesBurned');
    
    if (caloriesEaten) {
        caloriesEaten.addEventListener('input', debounce(updateCalculations, 300));
    }
    if (caloriesBurned) {
        caloriesBurned.addEventListener('input', debounce(updateCalculations, 300));
    }
    
    // Date navigation
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const todayBtn = document.getElementById('todayBtn');
    
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', () => changeDate(-1));
    }
    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', () => changeDate(1));
    }
    if (todayBtn) {
        todayBtn.addEventListener('click', goToToday);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load today's data (or selected date)
async function loadTodayData() {
    if (!currentUser || !supabaseClient) {
        return;
    }

    const dateKey = formatDateKey(currentDate);
    
    try {
        const { data, error } = await supabaseClient
            .from('calorie_entries')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('date', dateKey)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error loading data:', error);
            todayData = null;
            clearInputs();
        } else if (data) {
            todayData = data;
            populateInputs();
        } else {
            todayData = null;
            clearInputs();
        }
        
        await loadAllData();
        updateCalculations();
        updateStats();
        updateHistory();
    } catch (error) {
        console.error('Error in loadTodayData:', error);
        todayData = null;
        clearInputs();
    }
}

// Clear input fields
function clearInputs() {
    const caloriesEaten = document.getElementById('caloriesEaten');
    const caloriesBurned = document.getElementById('caloriesBurned');
    if (caloriesEaten) caloriesEaten.value = '';
    if (caloriesBurned) caloriesBurned.value = '';
    updateCalculations();
}

// Populate input fields
function populateInputs() {
    if (todayData) {
        const caloriesEaten = document.getElementById('caloriesEaten');
        const caloriesBurned = document.getElementById('caloriesBurned');
        if (caloriesEaten) caloriesEaten.value = todayData.calories_eaten || '';
        if (caloriesBurned) caloriesBurned.value = todayData.calories_burned || '';
    }
}

// Save day data
async function saveDay() {
    if (!currentUser || !supabaseClient) {
        showError('You must be logged in to save data');
        return;
    }

    const caloriesEaten = parseFloat(document.getElementById('caloriesEaten').value) || 0;
    const caloriesBurned = parseFloat(document.getElementById('caloriesBurned').value) || 0;
    const dateKey = formatDateKey(currentDate);
    
    const entry = {
        date: dateKey,
        calories_eaten: caloriesEaten,
        calories_burned: caloriesBurned,
        deficit: caloriesBurned - caloriesEaten
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('calorie_entries')
            .upsert({
                user_id: currentUser.id,
                date: dateKey,
                calories_eaten: caloriesEaten,
                calories_burned: caloriesBurned,
                deficit: entry.deficit,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,date'
            });
        
        if (error) {
            console.error('Error saving to Supabase:', error);
            showError('Failed to save data. Please try again.');
            return;
        }
        
        todayData = entry;
        await loadAllData();
        updateCalculations();
        updateStats();
        updateHistory();
        
        // Show feedback
        const btn = document.getElementById('saveBtn');
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('Error in saveDay:', error);
        showError('Failed to save data. Please try again.');
    }
}

// Load all data for stats
async function loadAllData() {
    if (!currentUser || !supabaseClient) {
        allData = [];
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from('calorie_entries')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error loading all data:', error);
            allData = [];
        } else {
            allData = data || [];
        }
    } catch (error) {
        console.error('Error in loadAllData:', error);
        allData = [];
    }
}

// Update calculations
function updateCalculations() {
    const caloriesEatenEl = document.getElementById('caloriesEaten');
    const caloriesBurnedEl = document.getElementById('caloriesBurned');
    
    if (!caloriesEatenEl || !caloriesBurnedEl) return;
    
    const caloriesEaten = parseFloat(caloriesEatenEl.value) || 0;
    const caloriesBurned = parseFloat(caloriesBurnedEl.value) || 0;
    const deficit = caloriesBurned - caloriesEaten;
    
    updateDeficitDisplay('todayDeficit', deficit);
}

// Update stats
function updateStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentWeek = getWeekNumber(now);
    
    // Filter data for current period
    const yearData = allData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === currentYear;
    });
    
    const monthData = yearData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getMonth() === currentMonth;
    });
    
    const weekData = monthData.filter(entry => {
        const entryDate = new Date(entry.date);
        return getWeekNumber(entryDate) === currentWeek;
    });
    
    // Calculate totals
    const weekTotal = weekData.reduce((sum, entry) => sum + (entry.deficit || 0), 0);
    const monthTotal = monthData.reduce((sum, entry) => sum + (entry.deficit || 0), 0);
    const yearTotal = yearData.reduce((sum, entry) => sum + (entry.deficit || 0), 0);
    
    updateDeficitDisplay('weekDeficit', weekTotal);
    updateDeficitDisplay('monthDeficit', monthTotal);
    updateDeficitDisplay('yearDeficit', yearTotal);
}

// Update deficit display
function updateDeficitDisplay(elementId, deficit) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = formatNumber(deficit);
    element.className = 'stat-value';
    if (deficit > 0) {
        element.classList.add('positive');
    } else if (deficit < 0) {
        element.classList.add('negative');
    }
}

// Format number with sign
function formatNumber(num) {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${Math.round(num).toLocaleString()}`;
}

// Update history display
function updateHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    const recentData = allData.slice(0, 7); // Show last 7 days
    
    if (recentData.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No entries yet. Start tracking your calories!</div>';
        return;
    }
    
    historyList.innerHTML = recentData.map(entry => {
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const deficit = entry.deficit || 0;
        const deficitClass = deficit >= 0 ? 'positive' : 'negative';
        const dateKey = entry.date;
        const isSelected = formatDateKey(currentDate) === dateKey;
        const selectedClass = isSelected ? 'selected' : '';
        
        return `
            <div class="history-item ${selectedClass}" data-date="${dateKey}" onclick="selectDate('${dateKey}')">
                <div>
                    <div class="history-item-date">${dayName}, ${dateStr}</div>
                    <div class="history-item-details">
                        <span>Eaten: ${Math.round(entry.calories_eaten || 0)}</span>
                        <span>Burned: ${Math.round(entry.calories_burned || 0)}</span>
                    </div>
                </div>
                <div class="history-item-deficit ${deficitClass}">
                    ${formatNumber(deficit)}
                </div>
            </div>
        `;
    }).join('');
}

// Select date from history
function selectDate(dateKey) {
    const date = new Date(dateKey);
    if (!isNaN(date.getTime())) {
        currentDate = date;
        updateDateDisplay();
        loadTodayData();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Make selectDate available globally for onclick
window.selectDate = selectDate;
}

// Format date as YYYY-MM-DD
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

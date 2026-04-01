// Developer Tools Detection
function detectDevTools() {
    const threshold = 160; // Minimum height/width for dev tools
    
    const isDevToolsOpen = () => {
        return (
            window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold
        );
    };
    
    setInterval(() => {
        if (isDevToolsOpen()) {
            document.body.classList.add('dev-open');
            document.body.style.pointerEvents = 'none';
        } else {
            document.body.classList.remove('dev-open');
            document.body.style.pointerEvents = 'auto';
        }
    }, 500);
}

// Start detection when page loads
window.addEventListener('load', detectDevTools);

// Also start immediately for faster detection
detectDevTools();

let current = '';
let previous = '';
let op = undefined;
let history = []; // Objective: Store calculations in an array
let currentUser = null; // Track logged-in user

const currText = document.getElementById('curr-operand');
const prevText = document.getElementById('prev-operand');
const listUI = document.getElementById('history-list');

// Login/Logout Functions
function login() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    currentUser = username;
    localStorage.setItem('currentUser', username);
    
    // Check if user is admin
    if (username.toLowerCase() === 'bryton') {
        // Show admin panel
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('calculator-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        loadAllUsers();
    } else {
        // Load user's history
        const savedHistory = localStorage.getItem(`history_${username}`);
        history = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Show calculator, hide login
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('calculator-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('user-name').innerText = `Welcome, ${username}!`;
        
        // Update history display
        updateHistoryDisplay();
    }
    
    usernameInput.value = '';
}

function logout() {
    // Save history before logging out
    if (currentUser && history.length > 0 && currentUser.toLowerCase() !== 'bryton') {
        localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));
    }
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    current = '';
    previous = '';
    op = undefined;
    history = [];
    
    // Show login, hide calculator and admin
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('calculator-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    document.getElementById('username-input').focus();
}

// Admin Functions
function loadAllUsers() {
    const usersList = document.getElementById('users-list-ui');
    usersList.innerHTML = '';
    
    const allKeys = Object.keys(localStorage);
    const uniqueUsers = new Set();
    
    // Extract unique usernames from history keys
    allKeys.forEach(key => {
        if (key.startsWith('history_')) {
            const username = key.replace('history_', '');
            if (username.toLowerCase() !== 'currentuser') {
                uniqueUsers.add(username);
            }
        }
    });
    
    if (uniqueUsers.size === 0) {
        usersList.innerHTML = '<li style="color: #666;">No users found</li>';
        return;
    }
    
    uniqueUsers.forEach(username => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';
        li.style.padding = '10px';
        li.style.margin = '5px 0';
        li.style.backgroundColor = '#f0f0f0';
        li.style.borderRadius = '5px';
        li.style.borderLeft = '4px solid #FF6B35';
        li.style.transition = 'all 0.3s ease';
        li.innerHTML = `<strong>${username}</strong>`;
        li.onmouseover = () => {
            li.style.backgroundColor = '#e8e8e8';
            li.style.transform = 'translateX(5px)';
        };
        li.onmouseout = () => {
            li.style.backgroundColor = '#f0f0f0';
            li.style.transform = 'translateX(0)';
        };
        li.onclick = () => viewUserHistory(username);
        usersList.appendChild(li);
    });
}

function viewUserHistory(username) {
    const savedHistory = localStorage.getItem(`history_${username}`);
    const userHistory = savedHistory ? JSON.parse(savedHistory) : [];
    
    const adminHistoryList = document.getElementById('admin-history-list');
    const viewedUserName = document.getElementById('viewed-user-name');
    
    viewedUserName.innerText = `${username}'s Calculations`;
    viewedUserName.style.color = '#333';
    
    if (userHistory.length === 0) {
        adminHistoryList.innerHTML = '<li style="color: #666;">No calculations yet</li>';
        return;
    }
    
    adminHistoryList.innerHTML = '';
    userHistory.forEach((record, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-item">
                <div>
                    <span class="eq-text">${record.eq}</span> 
                    <span class="res-text">= ${record.res}</span>
                </div>
            </span>
        `;
        li.style.cursor = 'default';
        adminHistoryList.appendChild(li);
    });
}

function deleteAllData() {
    if (!currentUser) return;
    
    const confirm_delete = confirm(`Are you sure you want to delete all data for ${currentUser}? This cannot be undone.`);
    if (!confirm_delete) return;
    
    // Delete user's history from localStorage
    localStorage.removeItem(`history_${currentUser}`);
    
    // Clear from memory
    history = [];
    
    // Update display
    updateHistoryDisplay();
    
    alert(`All data for ${currentUser} has been deleted.`);
}

// Check if user was already logged in
window.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        
        if (savedUser.toLowerCase() === 'bryton') {
            // Auto-login as admin
            console.log(`Auto-logged in as admin: ${savedUser}`);
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('calculator-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            loadAllUsers();
        } else {
            // Auto-login as regular user
            const savedHistory = localStorage.getItem(`history_${savedUser}`);
            history = savedHistory ? JSON.parse(savedHistory) : [];
            
            console.log(`Auto-logged in as ${savedUser} with ${history.length} records`);
            
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('calculator-section').style.display = 'block';
            document.getElementById('admin-section').style.display = 'none';
            document.getElementById('user-name').innerText = `Welcome, ${savedUser}!`;
            updateHistoryDisplay();
        }
    }
});

// Also check on page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !currentUser) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = savedUser;
            
            if (savedUser.toLowerCase() === 'bryton') {
                document.getElementById('admin-section').style.display = 'block';
                document.getElementById('calculator-section').style.display = 'none';
                loadAllUsers();
            } else {
                const savedHistory = localStorage.getItem(`history_${savedUser}`);
                history = savedHistory ? JSON.parse(savedHistory) : [];
                document.getElementById('calculator-section').style.display = 'block';
                document.getElementById('admin-section').style.display = 'none';
                document.getElementById('user-name').innerText = `Welcome, ${savedUser}!`;
                updateHistoryDisplay();
            }
        }
    }
});

function addNum(num) {
    if (num === '.' && current.includes('.')) return;
    current = current.toString() + num.toString();
    updateUI();
}

function chooseOp(operation) {
    if (current === '') return;
    if (previous !== '') exec();
    op = operation;
    previous = current;
    current = '';
    updateUI();
}

function exec() {
    let result;
    const p = parseFloat(previous);
    const c = parseFloat(current);
    if (isNaN(p) || isNaN(c)) return;

    // Objective: Implement functions for basic operations
    switch (op) {
        case '+': result = p + c; break;
        case '-': result = p - c; break;
        case '×': result = p * c; break;
        case '÷': result = c === 0 ? "Error" : p / c; break;
        default: return;
    }

    // Objective: Store each calculation in an array
    const record = { 
        eq: `${p} ${op} ${c}`, 
        res: result 
    };
    history.push(record);
    
    // Save to localStorage
    if (currentUser) {
        localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));
    }
    
    // Objective: Display history to user
    updateHistoryUI(record);

    current = result;
    op = undefined;
    previous = '';
    updateUI();
}

function updateHistoryUI(record) {
    if (history.length === 1) listUI.innerHTML = '';
    const li = document.createElement('li');
    const index = history.length - 1;
    li.innerHTML = `
        <span class="history-item">
            <div>
                <span class="eq-text">${record.eq}</span> 
                <span class="res-text">= ${record.res}</span>
            </div>
        </span>
        <button class="delete-history-btn" onclick="deleteHistoryRecord(${index})">×</button>
    `;
    listUI.appendChild(li);
}

function updateHistoryDisplay() {
    if (history.length === 0) {
        listUI.innerHTML = '<li style="color: #666;">Waiting for data...</li>';
    } else {
        listUI.innerHTML = '';
        history.forEach((record, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="history-item">
                    <div>
                        <span class="eq-text">${record.eq}</span> 
                        <span class="res-text">= ${record.res}</span>
                    </div>
                </span>
                <button class="delete-history-btn" onclick="deleteHistoryRecord(${index})">×</button>
            `;
            listUI.appendChild(li);
        });
    }
}

function deleteHistoryRecord(index) {
    history.splice(index, 1);
    
    if (currentUser) {
        localStorage.setItem(`history_${currentUser}`, JSON.stringify(history));
    }
    
    updateHistoryDisplay();
}

function clearAll() {
    current = '';
    previous = '';
    op = undefined;
    updateUI();
}

function deleteLast() {
    current = current.toString().slice(0, -1);
    updateUI();
}

function toggleSign() {
    if (current === '') {
        current = '-'; // Start with negative sign if empty
        updateUI();
        return;
    }
    if (current.toString().startsWith('-')) {
        current = current.toString().substring(1);
    } else {
        current = '-' + current.toString();
    }
    updateUI();
}

function updateUI() {
    currText.innerText = current;
    prevText.innerText = previous && op ? `${previous} ${op}` : previous;
}
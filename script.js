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
    
    // Load user's history
    const savedHistory = localStorage.getItem(`history_${username}`);
    history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Show calculator, hide login
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('calculator-section').style.display = 'block';
    document.getElementById('user-name').innerText = `Welcome, ${username}!`;
    
    // Update history display
    updateHistoryDisplay();
    usernameInput.value = '';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    current = '';
    previous = '';
    op = undefined;
    history = [];
    
    // Show login, hide calculator
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('calculator-section').style.display = 'none';
    document.getElementById('username-input').focus();
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
        const savedHistory = localStorage.getItem(`history_${savedUser}`);
        history = savedHistory ? JSON.parse(savedHistory) : [];
        
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('calculator-section').style.display = 'block';
        document.getElementById('user-name').innerText = `Welcome, ${savedUser}!`;
        updateHistoryDisplay();
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

function updateUI() {
    currText.innerText = current;
    prevText.innerText = previous;
}
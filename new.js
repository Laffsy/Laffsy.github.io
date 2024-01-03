let startDate, dailyBudget;
let expenses = {};  // Storing expenses: { '2024-01-01': 50, '2024-01-03': 30, ... }

// Set budget and generate calendar
function setBudget() {
    startDate = new Date(document.getElementById('startDate').value);
    dailyBudget = parseFloat(document.getElementById('dailyBudget').value);
    generateCalendar();
}

// Generate calendar for the current month
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Clear existing calendar

    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Fill initial empty cells
    for (let i = 0; i < monthStart.getDay(); i++) {
        const cell = document.createElement('div');
        calendar.appendChild(cell);
    }

    // Fill days of the month
    for (let day = 1; day <= monthEnd.getDate(); day++) {
        const cell = document.createElement('div');
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
        const budgetForDay = calculateBudgetForDay(currentDate);
        cell.innerHTML = `${day}<br>$${budgetForDay.toFixed(2)}`;
        cell.className = expenses[currentDate.toISOString().split('T')[0]] ? 'expense-day' : '';
        cell.onclick = () => showExpensesModal(currentDate);
        calendar.appendChild(cell);
    }
}

// Calculate budget for a given day
function calculateBudgetForDay(date) {
    const differenceInDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    let totalBudget = differenceInDays * dailyBudget;
    Object.keys(expenses).forEach(expenseDate => {
        if (new Date(expenseDate) <= date) {
            totalBudget -= expenses[expenseDate];
        }
    });
    return totalBudget;
}

// Show modal with expenses for a specific day
function showExpensesModal(date) {
    const modal = document.getElementById('expenseModal');
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = date.toDateString();
    if (expenses[date.toISOString().split('T')[0]]) {
        expensesList.innerHTML += `<p>Expense: $${expenses[date.toISOString().split('T')[0]]}</p>`;
    } else {
        expensesList.innerHTML += "<p>No expenses</p>";
    }
    modal.style.display = "block";
}

// Close the modal
function closeModal() {
    document.getElementById('expenseModal').style.display = "none";
}

// Add expense for a specific date
function addExpense() {
    const expenseDate = document.getElementById('expenseDate').value;
    const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
    expenses[expenseDate] = (expenses[expenseDate] || 0) + expenseAmount;
    generateCalendar();  // Update calendar
    closeModal();        // Close modal after adding expense
}

// Export data to CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Budget\n";
    for (let day = 1; day <= 31; day++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), day);
        if (currentDate.getMonth() !== startDate.getMonth()) break; // Stop if next month
        const budgetForDay = calculateBudgetForDay(currentDate);
        csvContent += `${currentDate.toISOString().split('T')[0]},${budgetForDay.toFixed(2)}\n`;
    }

    // Create a link and download the CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "budget.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
}

// Event listeners
window.onload = function() {
    document.getElementById('setBudgetButton').addEventListener('click', setBudget);
    document.getElementById('addExpenseButton').addEventListener('click', addExpense);
    document.getElementById('closeModal').addEventListener('click', closeModal);
};

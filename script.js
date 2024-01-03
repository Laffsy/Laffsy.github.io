// Wait for the DOM content to be loaded before running the script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let dailyBudget = 0; // Daily budget amount
    let expenses = []; // Array to store expenses
    let startDate; // Start date for the budget
    let currentMonth = new Date().getMonth(); // Current month
    let currentYear = new Date().getFullYear(); // Current year
    let accumulatedBudget = 0; // Accumulated budget
    let lastCalculatedDate; // Last date for which budget was calculated

    // Event listener for setting the budget
    document.getElementById('set-budget').addEventListener('click', function() {
        // Set the start date based on user input
        startDate = new Date(document.getElementById('start-date').value + 'T00:00:00');
        // Set the daily budget based on user input
        dailyBudget = parseFloat(document.getElementById('daily-budget').value);
        // Reset accumulated budget and last calculated date
        accumulatedBudget = 0;
        lastCalculatedDate = new Date(startDate);
        // Update the calendar view
        updateCalendar();
    });

    // Event listener for adding an expense
    document.getElementById('add-expense').addEventListener('click', function() {
        // Retrieve expense details from user input
        const expenseName = document.getElementById('expense-name').value;
        const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
        let expenseDateInput = document.getElementById('expense-date').value;
        let expenseDate = new Date(expenseDateInput + 'T00:00:00');
        

        // Add the expense to the expenses array
        expenses.push({
            name: expenseName,
            amount: expenseAmount,
            date: expenseDate.toISOString().split('T')[0]
        });

        // Update the calendar view
        updateCalendar();
    });

    // Event listeners for navigating between months
    document.getElementById('prev-month').addEventListener('click', function() {
        changeMonth(-1); // Go to the previous month
    });

    document.getElementById('next-month').addEventListener('click', function() {
        changeMonth(1); // Go to the next month
    });

    // Function to change the current month and update the calendar
    function changeMonth(delta) {
        currentMonth += delta;
        // Adjust year and month for year change
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    }

    // Function to update the calendar view
    function updateCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        // Set the current month and year display
        document.getElementById('month-year-display').innerText = `${monthNames[currentMonth]} ${currentYear}`;

        // Clear the previous calendar view
        let calendarDaysElement = document.getElementById('calendar-days');
        calendarDaysElement.innerHTML = '';

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        console.log("accumulatedBudget=" + accumulatedBudget);
        console.log("lastCalculatedDate=" + lastCalculatedDate);
        console.log("firstDayOfMonth=" + firstDayOfMonth);
        // Reset the accumulated budget at the start of the new view
        if (!lastCalculatedDate || firstDayOfMonth < lastCalculatedDate) {
            console.log("Reset the accumulated budget at the start of the new view");
            accumulatedBudget = 0;
            let tempDate = new Date(startDate);
            while (tempDate < firstDayOfMonth) {
                let tempDateString = tempDate.toISOString().split('T')[0];
                let dailyExpenses = expenses.filter(expense => expense.date === tempDateString).reduce((total, expense) => total + expense.amount, 0);
                
                accumulatedBudget += dailyBudget - dailyExpenses;
                tempDate.setDate(tempDate.getDate() + 1);
            }
        }

        // Set last calculated date to the first day of the current month
        lastCalculatedDate = new Date(currentYear, currentMonth, 1);

        // Create placeholders for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            let placeholder = document.createElement('div');
            placeholder.classList.add('day', 'placeholder');
            calendarDaysElement.appendChild(placeholder);
        }

        // Create calendar day elements
        for (let day = 1; day <= daysInMonth; day++) {
            let currentDate = new Date(currentYear, currentMonth, day);
            let dayElement = document.createElement('div');
            dayElement.classList.add('day');

            console.log("currentDate="+currentDate)
            console.log("startDate="+startDate)

            // Calculate and display the budget for each day
            if (currentDate >= startDate) {
                console.log("Calculate and display the budget for each day");
                let dayString = currentDate.toISOString().split('T')[0];
                let totalExpensesForDay = expenses.filter(expense => expense.date === dayString).reduce((total, expense) => total + expense.amount, 0);
                accumulatedBudget += dailyBudget - totalExpensesForDay;
                console.log(accumulatedBudget + " += " + dailyBudget + "  - " + totalExpensesForDay)

                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>$${Math.max(0, accumulatedBudget).toFixed(2)}`;
                dayElement.addEventListener('click', function() {
                    openModal(currentDate);
                });
                console.log("accumulatedBudget="+accumulatedBudget);
            } else {
                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>`;
            }

            calendarDaysElement.appendChild(dayElement);
        }
    }

    // Function to open the modal showing expenses for a specific day
    function openModal(date) {
        let modal = document.getElementById('expense-modal');
        let modalDate = document.getElementById('modal-date');
        let modalExpensesList = document.getElementById('modal-expenses-list');

        let dateString = date.toISOString().split('T')[0];
        modalDate.innerText = `Expenses for ${date.toDateString()}`;
        modalExpensesList.innerHTML = '';

        expenses.filter(expense => expense.date === dateString).forEach(expense => {
            let li = document.createElement('li');
            li.innerText = `${expense.name}: $${expense.amount.toFixed(2)}`;
            modalExpensesList.appendChild(li);
        });

        modal.style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
        let modal = document.getElementById('expense-modal');
        modal.style.display = 'none';
    }

    // Event listener to close the modal
    document.getElementsByClassName('close')[0].addEventListener('click', closeModal);

    // Initialize the calendar view
    updateCalendar();
});

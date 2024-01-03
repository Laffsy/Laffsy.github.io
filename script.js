document.addEventListener('DOMContentLoaded', function() {
    let dailyBudget = 0;
    let expenses = [];
    let startDate = new Date();
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let accumulatedBudget = 0;
    let lastCalculatedDate = null;

    document.getElementById('set-budget').addEventListener('click', function() {
        startDate = new Date(document.getElementById('start-date').value + 'T00:00:00');
        dailyBudget = parseFloat(document.getElementById('daily-budget').value);
        accumulatedBudget = 0;
        lastCalculatedDate = new Date(startDate);
        updateCalendar();
    });

    document.getElementById('add-expense').addEventListener('click', function() {
        const expenseName = document.getElementById('expense-name').value;
        const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
        let expenseDateInput = document.getElementById('expense-date').value;
        let expenseDate = new Date(expenseDateInput + 'T00:00:00');

        expenses.push({
            name: expenseName,
            amount: expenseAmount,
            date: expenseDate.toISOString().split('T')[0]
        });

        updateCalendar();
    });

    document.getElementById('prev-month').addEventListener('click', function() {
        changeMonth(-1);
    });

    document.getElementById('next-month').addEventListener('click', function() {
        changeMonth(1);
    });

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    }

    function updateCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        document.getElementById('month-year-display').innerText = `${monthNames[currentMonth]} ${currentYear}`;

        let calendarDaysElement = document.getElementById('calendar-days');
        calendarDaysElement.innerHTML = '';

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        if (firstDayOfMonth < startDate) {
            accumulatedBudget = 0;
            lastCalculatedDate = null;
        } else {
            let tempDate = lastCalculatedDate ? new Date(lastCalculatedDate) : new Date(startDate);
            while (tempDate < firstDayOfMonth) {
                let tempDateString = tempDate.toISOString().split('T')[0];
                let dailyExpenses = expenses.reduce((total, expense) => {
                    return expense.date === tempDateString ? total + expense.amount : total;
                }, 0);
                accumulatedBudget += dailyBudget - dailyExpenses;
                tempDate.setDate(tempDate.getDate() + 1);
            }
            lastCalculatedDate = new Date(firstDayOfMonth);
        }

        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            let placeholder = document.createElement('div');
            placeholder.classList.add('day', 'placeholder');
            calendarDaysElement.appendChild(placeholder);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            let currentDate = new Date(currentYear, currentMonth, day);
            let dayElement = document.createElement('div');
            dayElement.classList.add('day');

            if (currentDate >= startDate) {
                let dayString = currentDate.toISOString().split('T')[0];
                let totalExpensesForDay = expenses.reduce((total, expense) => {
                    return expense.date === dayString ? total + expense.amount : total;
                }, 0);

                accumulatedBudget += dailyBudget - totalExpensesForDay;
                lastCalculatedDate = currentDate;

                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>$${accumulatedBudget.toFixed(2)}`;
                dayElement.addEventListener('click', function() {
                    openModal(currentDate);
                });
            } else {
                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>`;
            }

            calendarDaysElement.appendChild(dayElement);
        }
    }

    function openModal(date) {
        let modal = document.getElementById('expense-modal');
        let modalDate = document.getElementById('modal-date');
        let modalExpensesList = document.getElementById('modal-expenses-list');

        let dateString = date.toISOString().split('T')[0];
        modalDate.innerText = `Expenses for ${date.toDateString()}`;
        modalExpensesList.innerHTML = '';

        expenses.forEach(expense => {
            if (expense.date === dateString) {
                let li = document.createElement('li');
                li.innerText = `${expense.name}: $${expense.amount.toFixed(2)}`;
                modalExpensesList.appendChild(li);
            }
        });

        modal.style.display = 'block';
    }

    function closeModal() {
        let modal = document.getElementById('expense-modal');
        modal.style.display = 'none';
    }

    document.getElementsByClassName('close')[0].addEventListener('click', closeModal);

    updateCalendar();
});

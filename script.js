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

    // ... Other event listeners ...

    function updateCalendar() {
        // ... existing setup for month and day names ...

        let calendarDaysElement = document.getElementById('calendar-days');
        calendarDaysElement.innerHTML = '';

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        if (firstDayOfMonth < lastCalculatedDate || !lastCalculatedDate) {
            accumulatedBudget = 0;
            let tempDate = new Date(startDate);
            while (tempDate < firstDayOfMonth) {
                let tempDateString = tempDate.toISOString().split('T')[0];
                let dailyExpenses = expenses.reduce((total, expense) => {
                    return expense.date === tempDateString ? total + expense.amount : total;
                }, 0);
                accumulatedBudget += dailyBudget - dailyExpenses;
                tempDate.setDate(tempDate.getDate() + 1);
            }
            lastCalculatedDate = new Date(firstDayOfMonth);
        } else if (firstDayOfMonth > lastCalculatedDate) {
            // Adjust accumulatedBudget for days between lastCalculatedDate and firstDayOfMonth
            let tempDate = new Date(lastCalculatedDate);
            while (tempDate < firstDayOfMonth) {
                accumulatedBudget += dailyBudget;
                tempDate.setDate(tempDate.getDate() + 1);
            }
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

                if (currentDate.getTime() === lastCalculatedDate.getTime()) {
                    accumulatedBudget += dailyBudget - totalExpensesForDay;
                }

                lastCalculatedDate = currentDate;

                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>$${accumulatedBudget.toFixed(2)}`;
                dayElement.addEventListener('click', function() {
                    openModal(currentDate);
                });
            } else if (currentDate < startDate) {
                dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>`;
            }

            calendarDaysElement.appendChild(dayElement);
        }
    }

    // ... Modal functions ...

    updateCalendar();
});

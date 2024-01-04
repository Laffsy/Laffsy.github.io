// current issues:
// when starting in a different month other than the first month on display, it will "set" that month to whatever the intitial compounding budget is.
// example: Upon load it defaults to January. i go to February then set budget to 32 click Set Budget. 
// It will set Feb 1 to be 32. if i go to Jan it is right. If i go back to feb it is right.

// when adding expense, it is doing something wrong. still researching.


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
    let boolToggle = false;

    document.getElementById('export-csv').addEventListener('click', exportToCSV);

    document.getElementById('import-csv').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            importFromCSV(file);
        }
    });


    function importFromCSV(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const text = event.target.result;
            const rows = text.split("\n");
            expenses = []; // Clear existing expenses

            rows.forEach((row, index) => {
                if (index === 0) return; // Skip header row
                const [loadedStartDate, loadedDailyBudget, expenseDate, expenseName, expenseAmount] = row.split(",");

                // Update startDate and dailyBudget for the first row
                if (index === 1) {
                    startDate = new Date(loadedStartDate);
                    dailyBudget = parseFloat(loadedDailyBudget);

                    // Update currentMonth and currentYear based on the imported startDate
                    currentMonth = startDate.getMonth();
                    currentYear = startDate.getFullYear();

                    // Set the input fields values
                    document.getElementById('start-date').value = startDate.toISOString().split('T')[0];
                    document.getElementById('daily-budget').value = dailyBudget.toString();
                }

                // Add expense to the expenses array
                if (expenseDate && expenseAmount) {
                    expenses.push({
                        date: expenseDate,
                        name: expenseName || '', // Use empty string if expenseName is blank
                        amount: parseFloat(expenseAmount)
                    });
                }
            });

            // Reset accumulated budget and last calculated date
            accumulatedBudget = 0;
            lastCalculatedDate = new Date(startDate);

            // Refresh application state/display
            updateCalendar(); // Update the calendar view to reflect the loaded data
        };
        reader.onerror = function(error) {
            // console.log("Error reading file:", error);
        };
        reader.readAsText(file);
    }



    // Event listener for setting the budget
    document.getElementById('set-budget').addEventListener('click', function() {
        // Validate daily budget input
        const dailyBudgetInput = document.getElementById('daily-budget').value;
        if (dailyBudgetInput === '' || isNaN(dailyBudgetInput) || parseFloat(dailyBudgetInput) < 0) {
            alert('Please enter a valid daily budget.');
            return; // Stop execution if validation fails
        }

        // Set the start date based on user input
        startDate = new Date(document.getElementById('start-date').value + 'T00:00:00');

        // Set the daily budget based on validated input
        dailyBudget = parseFloat(dailyBudgetInput);

        // Reset accumulated budget and last calculated date
        accumulatedBudget = 0;
        lastCalculatedDate = new Date(startDate);
        currentMonth = startDate.getMonth();
        currentYear = startDate.getFullYear();

        // Update the calendar view
        updateCalendar(); // Update calendar only if startDate is set
    });


    // Event listener for adding an expense
    document.getElementById('add-expense').addEventListener('click', function() {
        // Retrieve expense details from user input
        const expenseName = document.getElementById('expense-name').value;
        const expenseAmountInput = document.getElementById('expense-amount').value;
        let expenseDateInput = document.getElementById('expense-date').value;

        // Validate expense amount input
        if (expenseAmountInput === '' || isNaN(expenseAmountInput) || parseFloat(expenseAmountInput) < 0) {
            alert('Please enter a valid expense amount.');
            return; // Stop execution if validation fails
        }

        let expenseDate = new Date(expenseDateInput + 'T00:00:00');
        boolToggle = true;

        // Add the expense to the expenses array
        expenses.push({
            name: expenseName,
            amount: parseFloat(expenseAmountInput),
            date: expenseDate.toISOString().split('T')[0]
        });

        // console.log("Expense added. Running updateCalendar();");

        // Update the calendar view
        updateCalendar();
    });



    // Event listeners for navigating between months
    document.getElementById('prev-month').addEventListener('click', function() {
        // console.log("Going to previous month.")
        changeMonth(-1); // Go to the previous month
    });

    document.getElementById('next-month').addEventListener('click', function() {
        // console.log("Going to next month.")
        changeMonth(1); // Go to the next month
    });

    // Function to change the current month and update the calendar
    function changeMonth(delta) {
        // console.log("Current month = " + currentMonth + ". Adding/Subtracting: " + delta + " which equals = " + (currentMonth + delta));
        currentMonth += delta;
        // Adjust year and month for year change
        if (currentMonth < 0) {
            // console.log("going to prior year");
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            // console.log("going to next year");
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    }

    // Function to update the calendar view
    function updateCalendar() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

        // Set the current month and year display
        document.getElementById('month-year-display').innerText = `${monthNames[currentMonth]} ${currentYear}`;

        // if (!startDate) {
        // // Handle empty calendar state, e.g., display a message or leave the calendar blank
        // document.getElementById('month-year-display').innerText = 'Please set a start date and budget';
        // document.getElementById('calendar-days').innerHTML = '';
        // return; // Exit the function early
        // }

        // Clear the previous calendar view
        let calendarDaysElement = document.getElementById('calendar-days');
        calendarDaysElement.innerHTML = '';

        let firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // Reset the accumulated budget at the start of the new view
        if (!lastCalculatedDate || firstDayOfMonth < lastCalculatedDate) {
            // console.log("executes on: initial load, going back a month,");
            accumulatedBudget = 0;
            let tempDate = new Date(startDate);
            // console.log("tempdate is " + tempDate)
            // console.log("first day of month is " + firstDayOfMonth)

            if (tempDate < firstDayOfMonth) {
                // console.log("tempDate (" + tempDate + ") " + "LESSTHAN" + "( " + firstDayOfMonth + ")")
            }

            while (tempDate < firstDayOfMonth) {

                let tempDateString = tempDate.toISOString().split('T')[0];
                let dailyExpenses = expenses.filter(expense => expense.date === tempDateString).reduce((total, expense) => total + expense.amount, 0);
                // console.log("HI " + accumulatedBudget);
                accumulatedBudget += dailyBudget - dailyExpenses;
                // console.log(accumulatedBudget);
                tempDate.setDate(tempDate.getDate() + 1);
            }
            // console.log("final accumulated date is after comparing first day vs temp date: " + accumulatedBudget)
        }

        // Set last calculated date to the first day of the current month
        // Needed when going to previous months I guess?
        lastCalculatedDate = new Date(currentYear, currentMonth, 1);
        // console.log("lastCalculatedDate =" + lastCalculatedDate)

        // Create placeholders for days before the first day of the month
        //Keeps it in Sun Mon Tue Wed Thu Fri Sat format
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


            let dayString = currentDate.toISOString().split('T')[0];
            let hasExpenses = expenses.some(expense => expense.date === dayString);

            // Apply a different class if the day has expenses
            if (hasExpenses) {
                dayElement.classList.add('day-with-expense');
            }

            // Calculate and display the budget for each day

            if (currentDate >= startDate) {
                // console.log('currentDate >= startDate');
                let dayString = currentDate.toISOString().split('T')[0];
                // console.log('daystring = ' + dayString)
                let totalExpensesForDay = expenses.filter(expense => expense.date === dayString).reduce((total, expense) => total + expense.amount, 0);
                // console.log('toalExpensesForDay = ' + totalExpensesForDay)

                if (boolToggle === true) {
                    accumulatedBudget = 0;
                    boolToggle = false;
                    let tempDate = new Date(startDate);
                    // console.log("tempdate is " + tempDate)
                    // console.log("first day of month is " + firstDayOfMonth)

                    if (tempDate < firstDayOfMonth) {
                        // console.log("tempDate (" + tempDate + ") " + "LESSTHAN" + "( " + firstDayOfMonth + ")")
                    }

                    while (tempDate < firstDayOfMonth) {

                        let tempDateString = tempDate.toISOString().split('T')[0];
                        let dailyExpenses = expenses.filter(expense => expense.date === tempDateString).reduce((total, expense) => total + expense.amount, 0);
                        // console.log("HI " + accumulatedBudget);
                        accumulatedBudget += dailyBudget - dailyExpenses;
                        // console.log(accumulatedBudget);
                        tempDate.setDate(tempDate.getDate() + 1);
                    }
                }

                accumulatedBudget += dailyBudget - totalExpensesForDay;

                //dayElement.innerHTML = `<strong>${dayNames[currentDate.getDay()]}, Day ${day}</strong><br>$${Math.max(0, accumulatedBudget).toFixed(2)}`;
                dayElement.innerHTML = `<span class="day-date">${day}</span><br>$${accumulatedBudget.toFixed(2)}`;
                dayElement.addEventListener('click', function() {
                    openModal(currentDate);
                });
            } else {
                dayElement.innerHTML = `<span class="day-date">${day}</span><br>`;
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

        window.addEventListener('click', function(event) {
            let modal = document.getElementById('expense-modal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        let modalContent = document.getElementsByClassName('modal-content')[0];
        modalContent.addEventListener('click', function(event) {
            event.stopPropagation(); // Stops the click from propagating to the window
        });


    }

    // Function to close the modal
    function closeModal() {
        let modal = document.getElementById('expense-modal');
        modal.style.display = 'none';
        // console.log("Modal closed.");
    }

    function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Start Date,Daily Budget,Expense Date,Expense Name,Expense Amount\n"; // Add headers

    // Add first line for start date and daily budget
    csvContent += `${startDate.toISOString()},${dailyBudget},,,\n`;

    // Add expenses in subsequent lines
    expenses.forEach(expense => {
        csvContent += `,,${expense.date},${expense.name || ''},${expense.amount}\n`;
    });

    // Encode and trigger download
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_budget_data.csv");
    document.body.appendChild(link); // Required for FF
    link.click();
}






    // Event listener to close the modal
    document.getElementsByClassName('close')[0].addEventListener('click', closeModal);

    // Initialize the calendar view
    updateCalendar();
});

// DOM elements
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryElements = document.querySelectorAll('.category');
const dateInput = document.querySelector('input[type="date"]');
const submitBtn = document.getElementById('submit');
const expenseList = document.getElementById('expenseList');
const totalDisplay = document.querySelector('#GraphInfo h3:nth-child(2)');
let selectedCategory = null;

// Charts
let expenseChart;
let categoryChart;

// Expense array
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Select category
categoryElements.forEach((cat) => {
  cat.addEventListener("click", () => {
    categoryElements.forEach(c => c.classList.remove('selected'));  
    cat.classList.add('selected');  
    selectedCategory = cat.id;                                 
  });
});


// Add expense
submitBtn.addEventListener('click', () => {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;

    if (!description || isNaN(amount) || !selectedCategory || !date) {
        alert("Please fill all fields and select a category.");
        return;
    }

    const expense = {
        id: Date.now(),
        description,
        amount,
        category: selectedCategory,
        date
    };

    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    clearForm();
    renderExpenses();
    updateTotal();
    updateCharts();
});
//Clear the form
function clearForm() {
    descriptionInput.value = '';
    amountInput.value = '';
    dateInput.value = '';
    selectedCategory = null;
    categoryElements.forEach(c => c.classList.remove('selected'));
}

// Render recent expenses
function renderExpenses() {
    expenseList.innerHTML = '';
    if (expenses.length === 0) {
        expenseList.innerHTML = '<h5>No Expense Added</h5>';
        return;
    }

    const lastExpenses = expenses.slice(-5).reverse();

    lastExpenses.forEach(exp => {
        const div = document.createElement('div');
        div.classList.add('expense-item');
        div.innerHTML = 
            `<p><strong>${exp.description}</strong> - ₹${exp.amount.toFixed(2)}</p>
            <small>${exp.category} | ${exp.date}</small>`
        ;
        expenseList.appendChild(div);
    });
}

// Update total
function updateTotal() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    totalDisplay.textContent = `₹ ${total.toFixed(2)}`;
}

// Update charts
function updateCharts() {
    const dates = expenses.map(e => e.date);
    const amounts = expenses.map(e => e.amount);

    if (expenseChart) expenseChart.destroy();
    if (categoryChart) categoryChart.destroy();

    // Line Chart (Total Expense Over Time)
    const ctx1 = document.getElementById('ExpenseChart').getContext('2d');
    expenseChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Expenses Over Time',
                data: amounts,
                fill: false,
                borderColor: 'blue',
                tension: 0.2
            }]
        },
        options: {
            responsive: true
        }
    });

    // Doughnut Chart (Category-wise)
    const categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const catLabels = Object.keys(categoryTotals);
    const catValues = Object.values(categoryTotals);

    const ctx2 = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: catValues,
                backgroundColor: [
                    '#FF6384', '#4cd96aff', '#ef6d10ff',
                    '#4BC0C0', '#9966FF', '#949089ff'
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderExpenses();
    updateTotal();
    updateCharts();
});

// Clear All Button
document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm("Are you sure you want to delete all expenses?")) {
        localStorage.removeItem('expenses');
        expenses = [];
        renderExpenses();
        updateTotal();
        updateCharts();
    }
});



// Sample data storage (persistent using localStorage)
let incomeData = [];
let expenseData = [];
let categories = [];
let currentSection = 'income-section';

// TAMBAHAN: Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('budgetTracker_incomeData', JSON.stringify(incomeData));
        localStorage.setItem('budgetTracker_expenseData', JSON.stringify(expenseData));
        localStorage.setItem('budgetTracker_categories', JSON.stringify(categories));
        console.log('Data berhasil disimpan ke localStorage');
    } catch (error) {
        console.error('Error menyimpan data:', error);
    }
}

// TAMBAHAN: Fungsi untuk memuat data dari localStorage
function loadFromLocalStorage() {
    try {
        const savedIncomeData = localStorage.getItem('budgetTracker_incomeData');
        const savedExpenseData = localStorage.getItem('budgetTracker_expenseData');
        const savedCategories = localStorage.getItem('budgetTracker_categories');
        
        if (savedIncomeData) {
            incomeData = JSON.parse(savedIncomeData);
        }
        
        if (savedExpenseData) {
            expenseData = JSON.parse(savedExpenseData);
        }
        
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        }
        
        console.log('Data berhasil dimuat dari localStorage');
    } catch (error) {
        console.error('Error memuat data:', error);
        // Jika ada error, gunakan data kosong
        incomeData = [];
        expenseData = [];
        categories = [];
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // TAMBAHAN: Muat data dari localStorage terlebih dahulu
    loadFromLocalStorage();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    
    // Initialize year filter
    initializeYearFilter();
    
    // Update dashboard
    updateDashboard();
    
    // TAMBAHAN: Update tampilan setelah data dimuat
    updateCategoriesList();
    updateExpenseCategories();
    
    // Add form event listeners
    setupFormHandlers();
    
    // Show welcome animation
    showWelcomeAnimation();
});

function showWelcomeAnimation() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
        }, index * 100);
    });
}

function setupFormHandlers() {
    // Income form handler
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addIncome();
        });
    }

    // Category form handler
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addCategory();
        });
    }

    // Expense form handler
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addExpense();
        });
    }
}

function showSection(sectionId, button) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn, .nav-item');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button and corresponding nav items
    if (button) {
        button.classList.add('active');
        
        // Also update the corresponding navigation in desktop/mobile
        const allNavButtons = document.querySelectorAll(`[onclick*="${sectionId}"]`);
        allNavButtons.forEach(btn => {
            btn.classList.add('active');
        });
    }

    currentSection = sectionId;
    
    // Update transaction list if history section is active
    if (sectionId === 'history-section') {
        updateTransactionsList();
    }
}

function addIncome() {
    const date = document.getElementById('incomeDate').value;
    const type = document.getElementById('incomeType').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    const description = document.getElementById('incomeDescription').value;

    // Validation
    if (!date || !type || !amount || amount <= 0) {
        showAlert('error', 'Mohon lengkapi semua field yang diperlukan dan pastikan jumlah lebih dari 0!');
        return;
    }

    const income = {
        id: Date.now(),
        date: date,
        type: type,
        amount: amount,
        description: description || 'Tidak ada keterangan'
    };

    incomeData.push(income);
    
    // TAMBAHAN: Simpan ke localStorage setelah menambah data
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('incomeForm').reset();
    document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
    
    // Update dashboard
    updateDashboard();
    
    // Show success message
    showAlert('success', 'Pemasukan berhasil ditambahkan!');
    
    // Add success animation to button
    const button = document.querySelector('#incomeForm button[type="submit"]');
    if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
        button.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
        }, 2000);
    }
}

function addCategory() {
    const name = document.getElementById('categoryName').value.trim();
    const budget = parseFloat(document.getElementById('categoryBudget').value);

    // Validation
    if (!name || !budget || budget <= 0) {
        showAlert('error', 'Mohon lengkapi nama kategori dan budget dengan nilai yang valid!');
        return;
    }

    // Check if category already exists (case insensitive)
    if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        showAlert('error', 'Kategori sudah ada!');
        return;
    }

    const category = {
        id: Date.now(),
        name: name,
        budget: budget,
        spent: 0
    };

    categories.push(category);
    
    // TAMBAHAN: Simpan ke localStorage setelah menambah data
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('categoryForm').reset();
    
    // Update displays
    updateCategoriesList();
    updateExpenseCategories();
    updateDashboard();
    
    // Show success message
    showAlert('success', 'Kategori berhasil ditambahkan!');
    
    // Add success animation to button
    const button = document.querySelector('#categoryForm button[type="submit"]');
    if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
        button.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
        }, 2000);
    }
}

function addExpense() {
    const date = document.getElementById('expenseDate').value;
    const categoryId = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value.trim();

    // Validation
    if (!date || !categoryId || !amount || !description || amount <= 0) {
        showAlert('error', 'Mohon lengkapi semua field dengan nilai yang valid!');
        return;
    }

    const category = categories.find(cat => cat.id == categoryId);
    if (!category) {
        showAlert('error', 'Kategori tidak ditemukan!');
        return;
    }

    // Check if expense exceeds remaining budget
    const remainingBudget = category.budget - category.spent;
    if (amount > remainingBudget) {
        const confirmed = confirm(`Pengeluaran melebihi sisa budget kategori ${category.name} (${formatCurrency(remainingBudget)}). Lanjutkan?`);
        if (!confirmed) return;
    }

    const expense = {
        id: Date.now(),
        date: date,
        categoryId: parseInt(categoryId),
        categoryName: category.name,
        amount: amount,
        description: description
    };

    expenseData.push(expense);
    
    // Update category spent amount
    category.spent += amount;
    
    // TAMBAHAN: Simpan ke localStorage setelah menambah data
    saveToLocalStorage();
    
    // Reset form
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // Update displays
    updateCategoriesList();
    updateDashboard();
    
    // Show success message
    showAlert('success', 'Pengeluaran berhasil ditambahkan!');
    
    // Add success animation to button
    const button = document.querySelector('#expenseForm button[type="submit"]');
    if (button) {
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
        button.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.backgroundColor = '';
        }, 2000);
    }
}

function updateDashboard() {
    const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
    const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
    
    // PERUBAHAN 1: Total Budget yang tersisa setelah dikurangi pengeluaran
    const remainingBudget = totalBudget - totalExpense;
    const remainingFunds = totalIncome - totalExpense;

    // Update dashboard elements
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalBudgetEl = document.getElementById('totalBudget');
    const totalExpenseEl = document.getElementById('totalExpense');
    const remainingFundsEl = document.getElementById('remainingFunds');

    if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
    
    // PERUBAHAN 1: Menampilkan sisa budget setelah dikurangi pengeluaran
    if (totalBudgetEl) {
        totalBudgetEl.textContent = formatCurrency(remainingBudget);
        
        // Add color coding for remaining budget
        if (remainingBudget < 0) {
            totalBudgetEl.style.color = '#e74c3c';
        } else if (remainingBudget < totalBudget * 0.2) {
            totalBudgetEl.style.color = '#f39c12';
        } else {
            totalBudgetEl.style.color = '#27ae60';
        }
    }
    
    if (totalExpenseEl) totalExpenseEl.textContent = formatCurrency(totalExpense);
    if (remainingFundsEl) {
        remainingFundsEl.textContent = formatCurrency(remainingFunds);
        
        // Add color coding for remaining funds
        if (remainingFunds < 0) {
            remainingFundsEl.style.color = '#e74c3c';
        } else if (remainingFunds < totalIncome * 0.2) {
            remainingFundsEl.style.color = '#f39c12';
        } else {
            remainingFundsEl.style.color = '#27ae60';
        }
    }
}

function updateCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Belum ada kategori. Tambahkan kategori terlebih dahulu.</p>';
        return;
    }

    categories.forEach(category => {
        const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
        const remaining = category.budget - category.spent;
        
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="margin: 0;">${category.name}</h4>
                <button onclick="deleteCategory(${category.id})" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 8px; border-radius: 4px; cursor: pointer;" title="Hapus kategori">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p style="margin: 0.2rem 0;">Budget: ${formatCurrency(category.budget)}</p>
            <p style="margin: 0.2rem 0;">Terpakai: ${formatCurrency(category.spent)} (${percentage.toFixed(1)}%)</p>
            <p style="margin: 0.2rem 0;">Sisa: ${formatCurrency(remaining)}</p>
            <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                <div style="background: ${percentage > 100 ? '#e74c3c' : percentage > 80 ? '#f39c12' : '#27ae60'}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s ease;"></div>
            </div>
        `;
        
        container.appendChild(categoryItem);
    });
}

function deleteCategory(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Check if category has expenses
    const hasExpenses = expenseData.some(expense => expense.categoryId === categoryId);
    
    if (hasExpenses) {
        showAlert('error', 'Tidak dapat menghapus kategori yang sudah memiliki pengeluaran!');
        return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${category.name}"?`)) {
        // Remove category
        categories = categories.filter(cat => cat.id !== categoryId);
        
        // TAMBAHAN: Simpan ke localStorage setelah menghapus data
        saveToLocalStorage();
        
        // Update displays
        updateCategoriesList();
        updateExpenseCategories();
        updateDashboard();
        
        showAlert('success', 'Kategori berhasil dihapus!');
    }
}

function updateExpenseCategories() {
    const select = document.getElementById('expenseCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Pilih Kategori --</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.name} (Sisa: ${formatCurrency(category.budget - category.spent)})`;
        select.appendChild(option);
    });
}

function updateTransactionsList() {
    const container = document.getElementById('transactionsList');
    if (!container) return;
    
    const filterType = document.getElementById('filterType')?.value || 'all';
    const filterMonth = document.getElementById('filterMonth')?.value || '';
    const filterYear = document.getElementById('filterYear')?.value || '';

    // Combine income and expense data
    let transactions = [];
    
    // Add income transactions
    incomeData.forEach(income => {
        transactions.push({
            ...income,
            type: 'income',
            category: income.type
        });
    });

    // Add expense transactions
    expenseData.forEach(expense => {
        transactions.push({
            ...expense,
            type: 'expense',
            category: expense.categoryName
        });
    });

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply filters
    let filteredTransactions = transactions;

    if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }

    if (filterMonth) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionMonth = new Date(t.date).getMonth() + 1;
            return transactionMonth.toString().padStart(2, '0') === filterMonth;
        });
    }

    if (filterYear) {
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionYear = new Date(t.date).getFullYear();
            return transactionYear.toString() === filterYear;
        });
    }

    // Display transactions
    container.innerHTML = '';

    if (filteredTransactions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Tidak ada transaksi ditemukan.</p>';
        return;
    }

    filteredTransactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = `transaction-item ${transaction.type}`;
        
        const formattedDate = new Date(transaction.date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        transactionItem.innerHTML = `
            <div class="transaction-header">
                <div>
                    <strong>${transaction.category}</strong>
                    <div style="font-size: 0.9rem; color: #666;">${formattedDate}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
            </div>
            <div style="color: #666; font-size: 0.9rem;">
                ${transaction.description}
            </div>
        `;
        
        container.appendChild(transactionItem);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showAlert(type, message) {
    // Fallback jika SweetAlert tidak tersedia
    if (typeof Swal === 'undefined') {
        alert(message);
        return;
    }
    
    const icon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
    const title = type === 'success' ? 'Berhasil!' : type === 'error' ? 'Error!' : 'Info';
    
    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
}

function initializeYearFilter() {
    const yearSelect = document.getElementById('filterYear');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

function applyFilter() {
    updateTransactionsList();
    showAlert('info', 'Filter diterapkan!');
}

// PERUBAHAN 2: Fungsi download report dengan format table yang lebih rapi
function downloadReport() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        showAlert('error', 'PDF library tidak tersedia!');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        let yPosition = 20;
        
        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN BUDGET TRACKER', 105, yPosition, { align: 'center' });
        yPosition += 10;
        
        // Date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, yPosition, { align: 'center' });
        yPosition += 20;
        
        // Summary Table
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RINGKASAN KEUANGAN', 20, yPosition);
        yPosition += 10;
        
        const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
        const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
        const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);
        const remainingBudget = totalBudget - totalExpense;
        const remainingFunds = totalIncome - totalExpense;
        
        // Summary table data
        const summaryData = [
            ['Keterangan', 'Jumlah'],
            ['Total Pemasukan', formatCurrency(totalIncome)],
            ['Total Budget Awal', formatCurrency(totalBudget)],
            ['Total Pengeluaran', formatCurrency(totalExpense)],
            ['Sisa Budget', formatCurrency(remainingBudget)],
            ['Sisa Dana', formatCurrency(remainingFunds)]
        ];
        
        // Draw summary table
        yPosition = drawTable(doc, summaryData, 20, yPosition, [60, 60]);
        yPosition += 15;
        
        // Categories Budget Table
        if (categories.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DETAIL KATEGORI BUDGET', 20, yPosition);
            yPosition += 10;
            
            const categoryData = [['Kategori', 'Budget', 'Terpakai', 'Sisa', 'Persentase']];
            
            categories.forEach(category => {
                const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                const remaining = category.budget - category.spent;
                categoryData.push([
                    category.name,
                    formatCurrency(category.budget),
                    formatCurrency(category.spent),
                    formatCurrency(remaining),
                    percentage.toFixed(1) + '%'
                ]);
            });
            
            yPosition = drawTable(doc, categoryData, 20, yPosition, [40, 35, 35, 35, 25]);
            yPosition += 15;
        }
        
        // Recent Transactions Table
        if (incomeData.length > 0 || expenseData.length > 0) {
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('RIWAYAT TRANSAKSI TERBARU', 20, yPosition);
            yPosition += 10;
            
            // Combine and sort transactions
            let allTransactions = [];
            
            incomeData.forEach(income => {
                allTransactions.push({
                    date: income.date,
                    type: 'Pemasukan',
                    category: income.type,
                    description: income.description,
                    amount: income.amount
                });
            });
            
            expenseData.forEach(expense => {
                allTransactions.push({
                    date: expense.date,
                    type: 'Pengeluaran',
                    category: expense.categoryName,
                    description: expense.description,
                    amount: expense.amount
                });
            });
            
            // Sort by date (newest first) and take first 10
            allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            allTransactions = allTransactions.slice(0, 10);
            
            const transactionData = [['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah']];
            
            allTransactions.forEach(transaction => {
                const formattedDate = new Date(transaction.date).toLocaleDateString('id-ID');
                const amount = transaction.type === 'Pemasukan' ? 
                    '+' + formatCurrency(transaction.amount) : 
                    '-' + formatCurrency(transaction.amount);
                    
                transactionData.push([
                    formattedDate,
                    transaction.type,
                    transaction.category,
                    transaction.description.length > 15 ? 
                        transaction.description.substring(0, 15) + '...' : 
                        transaction.description,
                    amount
                ]);
            });
            
            yPosition = drawTable(doc, transactionData, 20, yPosition, [30, 25, 35, 40, 35]);
        }
        
        doc.save('Report Budget.pdf');
        showAlert('success', 'Laporan berhasil diunduh!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showAlert('error', 'Gagal mengunduh laporan!');
    }
}

// Helper function to draw tables in PDF
function drawTable(doc, data, x, y, columnWidths) {
    const rowHeight = 8;
    let currentY = y;
    
    doc.setFontSize(9);
    
    data.forEach((row, rowIndex) => {
        let currentX = x;
        
        // Set font style for header row
        if (rowIndex === 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(240, 240, 240); // Light gray background for header
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFillColor(255, 255, 255); // White background for data rows
        }
        
        // Draw row background
        const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
        doc.rect(currentX, currentY - 6, totalWidth, rowHeight, 'F');
        
        // Draw cell borders and text
        row.forEach((cell, cellIndex) => {
            const cellWidth = columnWidths[cellIndex];
            
            // Draw cell border
            doc.setDrawColor(0, 0, 0);
            doc.rect(currentX, currentY - 6, cellWidth, rowHeight);
            
            // Draw cell text
            doc.setTextColor(0, 0, 0);
            const cellText = cell.toString();
            
            // Check if text fits in cell, truncate if necessary
            const textWidth = doc.getTextWidth(cellText);
            let displayText = cellText;
            
            if (textWidth > cellWidth - 4) {
                // Truncate text to fit
                while (doc.getTextWidth(displayText + '...') > cellWidth - 4 && displayText.length > 0) {
                    displayText = displayText.slice(0, -1);
                }
                displayText += '...';
            }
            
            doc.text(displayText, currentX + 2, currentY - 1);
            currentX += cellWidth;
        });
        
        currentY += rowHeight;
    });
    
    return currentY;
}

//interactive effects
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        } else {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        }
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                showSection('income-section');
                break;
            case '2':
                showSection('category-section');
                break;
            case '3':
                showSection('expense-section');
                break;
            case '4':
                showSection('history-section');
                break;
            case '5' :
                showSection('settings-section');
                break;
        }
    }
});

// PERUBAHAN: Fungsi saveData menggunakan localStorage
function saveData() {
    try {
        const data = {
            incomeData: incomeData,
            expenseData: expenseData,
            categories: categories,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('budgetTracker_data', JSON.stringify(data));
        console.log('Data berhasil disimpan ke localStorage');
        return true;
    } catch (error) {
        console.error('Error menyimpan data ke localStorage:', error);
        showAlert('error', 'Gagal menyimpan data!');
        return false;
    }
}

// PERUBAHAN: Fungsi loadData menggunakan localStorage
function loadData() {
    try {
        const savedData = localStorage.getItem('budgetTracker_data');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Validasi data
            if (data.incomeData && Array.isArray(data.incomeData)) {
                incomeData = data.incomeData;
            }
            
            if (data.expenseData && Array.isArray(data.expenseData)) {
                expenseData = data.expenseData;
            }
            
            if (data.categories && Array.isArray(data.categories)) {
                categories = data.categories;
            }
            
            console.log('Data berhasil dimuat dari localStorage');
            console.log(`Terakhir diupdate: ${data.lastUpdated}`);
            return true;
        } else {
            console.log('Tidak ada data tersimpan di localStorage');
            return false;
        }
    } catch (error) {
        console.error('Error memuat data dari localStorage:', error);
        // Reset ke data kosong jika ada error
        incomeData = [];
        expenseData = [];
        categories = [];
        showAlert('error', 'Gagal memuat data tersimpan!');
        return false;
    }
}

// TAMBAHAN: Fungsi untuk export data ke file JSON
function exportData() {
    try {
        const data = {
            incomeData: incomeData,
            expenseData: expenseData,
            categories: categories,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `budget-data-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showAlert('success', 'Data berhasil diekspor!');
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('error', 'Gagal mengekspor data!');
    }
}

// TAMBAHAN: Fungsi untuk import data dari file JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validasi struktur data
            if (!importedData.incomeData || !importedData.expenseData || !importedData.categories) {
                throw new Error('Format file tidak valid');
            }
            
            // Konfirmasi sebelum menimpa data
            if (confirm('Import data akan menimpa semua data yang ada. Lanjutkan?')) {
                incomeData = importedData.incomeData || [];
                expenseData = importedData.expenseData || [];
                categories = importedData.categories || [];
                
                // Simpan ke localStorage
                saveData();
                
                // Update tampilan
                updateDashboard();
                updateCategoriesList();
                updateExpenseCategories();
                updateTransactionsList();
                
                showAlert('success', 'Data berhasil diimpor!');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            showAlert('error', 'File tidak valid atau rusak!');
        }
    };
    
    reader.readAsText(file);
    // Reset input file
    event.target.value = '';
}

// TAMBAHAN: Fungsi untuk menghapus semua data
function clearAllData() {
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
        if (confirm('Konfirmasi sekali lagi: Hapus semua data pemasukan, pengeluaran, dan kategori?')) {
            try {
                // Hapus dari localStorage
                localStorage.removeItem('budgetTracker_data');
                localStorage.removeItem('budgetTracker_incomeData');
                localStorage.removeItem('budgetTracker_expenseData');
                localStorage.removeItem('budgetTracker_categories');
                
                // Reset variabel
                incomeData = [];
                expenseData = [];
                categories = [];
                
                // Update tampilan
                updateDashboard();
                updateCategoriesList();
                updateExpenseCategories();
                updateTransactionsList();
                
                showAlert('success', 'Semua data berhasil dihapus!');
            } catch (error) {
                console.error('Error clearing data:', error);
                showAlert('error', 'Gagal menghapus data!');
            }
        }
    }
}

// TAMBAHAN: Fungsi untuk mendapatkan informasi storage
function getStorageInfo() {
    try {
        let totalSize = 0;
        let itemCount = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('budgetTracker_')) {
                totalSize += localStorage[key].length;
                itemCount++;
            }
        }
        
        // Konversi ke KB
        const sizeKB = (totalSize / 1024).toFixed(2);
        
        return {
            itemCount: itemCount,
            totalSize: totalSize,
            sizeKB: sizeKB,
            maxSize: 5120 // 5MB dalam KB (approximate localStorage limit)
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
    }
}

// TAMBAHAN: Fungsi untuk backup otomatis
function autoBackup() {
    try {
        const backupKey = `budgetTracker_backup_${Date.now()}`;
        const data = {
            incomeData: incomeData,
            expenseData: expenseData,
            categories: categories,
            backupDate: new Date().toISOString()
        };
        
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        // Hapus backup lama (simpan hanya 3 backup terakhir)
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('budgetTracker_backup_'));
        
        if (backupKeys.length > 3) {
            // Sort by timestamp (oldest first)
            backupKeys.sort();
            // Hapus backup tertua
            for (let i = 0; i < backupKeys.length - 3; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        }
        
        console.log('Auto backup berhasil');
    } catch (error) {
        console.error('Error creating auto backup:', error);
    }
}

// TAMBAHAN: Fungsi untuk memulihkan dari backup
function restoreFromBackup() {
    try {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('budgetTracker_backup_'));
        
        if (backupKeys.length === 0) {
            showAlert('info', 'Tidak ada backup yang tersedia!');
            return;
        }
        
        // Sort by timestamp (newest first)
        backupKeys.sort().reverse();
        
        // Tampilkan pilihan backup
        let backupOptions = 'Pilih backup yang ingin dipulihkan:\n\n';
        backupKeys.forEach((key, index) => {
            const timestamp = key.replace('budgetTracker_backup_', '');
            const date = new Date(parseInt(timestamp)).toLocaleString('id-ID');
            backupOptions += `${index + 1}. ${date}\n`;
        });
        
        const choice = prompt(backupOptions + '\nMasukkan nomor pilihan (1-' + backupKeys.length + '):');
        
        if (choice && choice >= 1 && choice <= backupKeys.length) {
            const selectedKey = backupKeys[choice - 1];
            const backupData = JSON.parse(localStorage.getItem(selectedKey));
            
            if (confirm('Memulihkan backup akan menimpa data saat ini. Lanjutkan?')) {
                incomeData = backupData.incomeData || [];
                expenseData = backupData.expenseData || [];
                categories = backupData.categories || [];
                
                // Simpan sebagai data utama
                saveData();
                
                // Update tampilan
                updateDashboard();
                updateCategoriesList();
                updateExpenseCategories();
                updateTransactionsList();
                
                showAlert('success', 'Data berhasil dipulihkan dari backup!');
            }
        }
    } catch (error) {
        console.error('Error restoring from backup:', error);
        showAlert('error', 'Gagal memulihkan data dari backup!');
    }
}

// Modifikasi fungsi yang sudah ada untuk menggunakan saveData() yang baru
// Ganti semua pemanggilan saveToLocalStorage() dengan saveData()
// Ganti semua pemanggilan loadFromLocalStorage() dengan loadData()

// TAMBAHAN: Event listener untuk auto-save setiap 5 menit
setInterval(function() {
    if (incomeData.length > 0 || expenseData.length > 0 || categories.length > 0) {
        autoBackup();
    }
}, 5 * 60 * 1000);

 // Back to top functionality
 window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setActive(clickedItem) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    clickedItem.classList.add('active');
    
    // Add haptic feedback simulation
    if (navigator.vibrate) {
        navigator.vibrate(10);
    }
}

// Add touch feedback for iOS devices
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
    });
    
    item.addEventListener('touchend', function() {
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});
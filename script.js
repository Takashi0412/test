document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const form = document.getElementById('add-form');
    const transactionList = document.getElementById('transaction-list');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const balanceEl = document.getElementById('balance');
    const dateInput = document.getElementById('date');

    // 今日の日付をフォームのデフォルト値に設定
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;

    // トランザクションデータを格納する配列（ローカルストレージから読み込む）
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // ローカルストレージにトランザクションを保存する関数
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // 通貨フォーマット関数
    function formatCurrency(num) {
        return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(num);
    }

    // トランザクションをDOMに追加して描画する関数
    function renderTransactions() {
        // リストをクリア
        transactionList.innerHTML = '';

        // トランザクションがなければメッセージ表示
        if (transactions.length === 0) {
            transactionList.innerHTML = '<tr><td colspan="7" style="text-align:center;">取引履歴はありません。</td></tr>';
            return;
        }

        // 各トランザクションを描画
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const isIncome = transaction.type === 'income';
            row.classList.add(isIncome ? 'income-row' : 'expense-row');

            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.member}</td>
                <td>${isIncome ? '収入' : '支出'}</td>
                <td>${transaction.category}</td>
                <td>${transaction.description}</td>
                <td class="amount">${formatCurrency(transaction.amount)}</td>
                <td><button class="delete-btn" data-id="${transaction.id}">削除</button></td>
            `;
            transactionList.appendChild(row);
        });
    }

    // サマリー（合計値）を更新する関数
    function updateSummary() {
        const amounts = transactions.map(t => t.amount);
        
        const totalIncome = amounts
            .filter((_, i) => transactions[i].type === 'income')
            .reduce((acc, item) => acc + item, 0);

        const totalExpense = amounts
            .filter((_, i) => transactions[i].type === 'expense')
            .reduce((acc, item) => acc + item, 0);

        const balance = totalIncome - totalExpense;

        totalIncomeEl.textContent = formatCurrency(totalIncome);
        totalExpenseEl.textContent = formatCurrency(totalExpense);
        balanceEl.textContent = formatCurrency(balance);
    }

    // トランザクションを追加する関数
    function addTransaction(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const member = document.getElementById('member').value;
        const type = document.querySelector('input[name="type"]:checked').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const amount = +document.getElementById('amount').value;

        if (date.trim() === '' || member.trim() === '' || category.trim() === '' || description.trim() === '' || amount <= 0) {
            alert('すべての項目を正しく入力してください。');
            return;
        }

        const transaction = {
            id: generateID(),
            date,
            member,
            type,
            category,
            description,
            amount
        };

        transactions.push(transaction);
        
        // 日付でソート
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        updateAndSave();
        
        // フォームをリセット
        form.reset();
        // 日付は今日の日付に再設定
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    
    // トランザクションを削除する関数
    function deleteTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateAndSave();
    }

    // ユニークIDを生成する関数
    function generateID() {
        return Math.floor(Math.random() * 1000000000);
    }
    
    // 更新と保存をまとめて行う関数
    function updateAndSave() {
        renderTransactions();
        updateSummary();
        saveTransactions();
    }

    // イベントリスナーの設定
    form.addEventListener('submit', addTransaction);
    
    transactionList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = +e.target.getAttribute('data-id');
            if (confirm('この取引を削除してもよろしいですか？')) {
                deleteTransaction(id);
            }
        }
    });

    // 初期化
    updateAndSave();
});

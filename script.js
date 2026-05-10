const CATEGORIES = {
    expense: ["食費", "日用品", "交通費", "交際費", "住居費", "通信費", "娯楽", "その他"],
    income: ["給料", "ボーナス", "副業", "お小遣い", "その他"]
};

document.addEventListener("DOMContentLoaded", () => {
    const typeSelect = document.getElementById("type");
    const categorySelect = document.getElementById("category");
    const amountInput = document.getElementById("amount");
    const memoInput = document.getElementById("memo");
    const dateInput = document.getElementById("date");
    const addButton = document.getElementById("add");
    const monthFilter = document.getElementById("monthFilter");
    const list = document.getElementById("list");

    let records = JSON.parse(localStorage.getItem("records")) || [];
    let editId = null;

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    function updateCategoryOptions() {
        const type = typeSelect.value;
        categorySelect.innerHTML = CATEGORIES[type].map(cat => `<option value="${cat}">${cat}</option>`).join("");
    }

    typeSelect.addEventListener("change", updateCategoryOptions);
    updateCategoryOptions();

    function render() {
        list.innerHTML = "";
        let income = 0, expense = 0;

        const filtered = monthFilter.value ? records.filter(r => r.date.startsWith(monthFilter.value)) : records;
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        filtered.forEach(record => {
            const li = document.createElement("li");
            li.className = `record-item ${record.type}`;
            li.innerHTML = `
                <div>
                    <small>${record.date}</small>
                    <div><strong>${record.category}</strong></div>
                    <div style="font-size:0.8rem; color:#636e72;">${record.memo}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-weight:bold; color:${record.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
                        ${record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString()}円
                    </div>
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                </div>
            `;
            
            li.querySelector(".delete-btn").onclick = () => {
                if(confirm('削除しますか？')){
                    records = records.filter(r => r.id !== record.id);
                    localStorage.setItem("records", JSON.stringify(records));
                    render();
                }
            };

            li.querySelector(".edit-btn").onclick = () => {
                typeSelect.value = record.type;
                updateCategoryOptions();
                categorySelect.value = record.category;
                amountInput.value = record.amount;
                memoInput.value = record.memo;
                dateInput.value = record.date;
                editId = record.id;
                addButton.textContent = "更新する";
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            if(record.type === "income") income += record.amount;
            else expense += record.amount;
            list.appendChild(li);
        });

        document.getElementById("totalIncome").textContent = income.toLocaleString();
        document.getElementById("totalExpense").textContent = expense.toLocaleString();
        const bal = income - expense;
        const balEl = document.getElementById("balance");
        balEl.textContent = bal.toLocaleString();
        balEl.style.color = bal < 0 ? "var(--expense-color)" : "var(--income-color)";
    }

    addButton.onclick = () => {
        if (!amountInput.value) return alert("金額を入力してください");
        
        const data = {
            id: editId || Date.now(),
            type: typeSelect.value,
            category: categorySelect.value,
            amount: Number(amountInput.value),
            memo: memoInput.value,
            date: dateInput.value
        };

        if (editId) {
            records = records.map(r => r.id === editId ? data : r);
            editId = null;
            addButton.textContent = "記録を追加する";
        } else {
            records.push(data);
        }

        localStorage.setItem("records", JSON.stringify(records));
        render();
        amountInput.value = ""; memoInput.value = ""; dateInput.value = today;
    };

    monthFilter.onchange = render;
    document.getElementById("clearFilter").onclick = () => { monthFilter.value = ""; render(); };
    render();
});
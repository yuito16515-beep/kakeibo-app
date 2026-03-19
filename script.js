document.addEventListener("DOMContentLoaded", () => {

  const typeSelect = document.getElementById("type");
  const categoryInput = document.getElementById("category");
  const amountInput = document.getElementById("amount");
  const memoInput = document.getElementById("memo");
  const dateInput = document.getElementById("date");
  const addButton = document.getElementById("add");

  const monthFilter = document.getElementById("monthFilter");
  const clearFilter = document.getElementById("clearFilter");

  const list = document.getElementById("list");
  const totalIncomeEl = document.getElementById("totalIncome");
  const totalExpenseEl = document.getElementById("totalExpense");
  const balanceEl = document.getElementById("balance");

  let records = JSON.parse(localStorage.getItem("records")) || [];
  let editId = null;
  let currentMonth = "";

  function save() {
    localStorage.setItem("records", JSON.stringify(records));
  }

  function render() {

    list.innerHTML = "";

    let filteredRecords = records;

    if (currentMonth) {
      filteredRecords = records.filter(record =>
        record.date.slice(0, 7) === currentMonth.slice(0, 7)
      );
    }

    let totalIncome = 0;
    let totalExpense = 0;

    filteredRecords.forEach((record) => {

      const li = document.createElement("li");

      li.innerHTML = `
        ${record.date} /
        ${record.category} /
        ${record.memo} /
        ${record.amount}円
        <div>
          <button class="edit">編集</button>
          <button class="delete">削除</button>
        </div>
      `;

      if (record.type === "income") {
        totalIncome += record.amount;
      } else {
        totalExpense += record.amount;
      }

      li.querySelector(".delete").onclick = () => {
        records = records.filter(r => r.id !== record.id);
        save();
        render();
      };

      li.querySelector(".edit").onclick = () => {
        typeSelect.value = record.type;
        categoryInput.value = record.category;
        amountInput.value = record.amount;
        memoInput.value = record.memo;
        dateInput.value = record.date;
        editId = record.id;
        addButton.textContent = "更新";
      };

      list.appendChild(li);
    });

    totalIncomeEl.textContent = totalIncome;
    totalExpenseEl.textContent = totalExpense;
    balanceEl.textContent = totalIncome - totalExpense;

    // マイナスなら赤表示
    balanceEl.style.color =
      totalIncome - totalExpense < 0 ? "red" : "black";
  }

  addButton.onclick = () => {

    if (!categoryInput.value || !amountInput.value || !dateInput.value) {
      alert("必須項目を入力してください");
      return;
    }

    if (editId) {

      records = records.map(record =>
        record.id === editId
          ? {
              ...record,
              type: typeSelect.value,
              category: categoryInput.value,
              amount: Number(amountInput.value),
              memo: memoInput.value,
              date: dateInput.value
            }
          : record
      );

      editId = null;
      addButton.textContent = "追加";

    } else {

      records.push({
        id: Date.now(),
        type: typeSelect.value,
        category: categoryInput.value,
        amount: Number(amountInput.value),
        memo: memoInput.value,
        date: dateInput.value
      });
    }

    save();
    render();

    categoryInput.value = "";
    amountInput.value = "";
    memoInput.value = "";
  };

  monthFilter.onchange = () => {
    currentMonth = monthFilter.value;
    render();
  };

  clearFilter.onclick = () => {
    monthFilter.value = "";
    currentMonth = "";
    render();
  };

  render();
});
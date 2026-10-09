const keypad = document.querySelector(".keypad");
const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history")

let current = "0";       
let previous = null;      
let operator = null;     
let waitingForNext = false;
let justEvaluated = false;  

const symbols = { "/": "÷", "*": "×", "-": "−", "+": "+" };
const MAX_DIGITS = 12;


function updateDisplay() {
  currentEl.textContent = current;

  
  if (current.length > 12) {
    currentEl.style.fontSize = "1.5rem";
  } else if (current.length > 9) {
    currentEl.style.fontSize = "2rem";
  } else if (current.length > 6) {
    currentEl.style.fontSize = "2.5rem";
  } else {
    currentEl.style.fontSize = "3rem";
  }
}

function setHistory(text) {
  historyEl.textContent = text;
}


function formatResult(value) {
 
  return Number(value.toPrecision(12)).toString();
}

function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);

  switch (op) {
    case "+": return formatResult(a + b);
    case "-": return formatResult(a - b);
    case "*": return formatResult(a * b);
    case "/": return b === 0 ? "Error" : formatResult(a / b);
  }
}

function resetAll() {
  current = "0";
  previous = null;
  operator = null;
  waitingForNext = false;
  justEvaluated = false;
  setHistory("");
}


function inputNumber(value) {
  if (current === "Error") resetAll();


  if (waitingForNext || justEvaluated) {
    current = "0";
    waitingForNext = false;
    justEvaluated = false;
    if (!operator) setHistory("");
  }

  if (value === "." && current.includes(".")) return;
  if (current.replace(/[-.]/g, "").length >= MAX_DIGITS) return;

  if (current === "0" && value !== ".") {
    current = value;
  } else {
    current += value;
  }
  updateDisplay();
}

function inputOperator(op) {
  if (current === "Error") return;


  if (waitingForNext) {
    operator = op;
    setHistory(`${previous} ${symbols[op]}`);
    return;
  }


  if (operator && previous !== null) {
    current = calculate(previous, current, operator);
    updateDisplay();
    if (current === "Error") {
      setHistory("");
      operator = null;
      previous = null;
      return;
    }
  }

  previous = current;
  operator = op;
  waitingForNext = true;
  justEvaluated = false;
  setHistory(`${previous} ${symbols[op]}`);
}

function equals() {
  if (operator === null || waitingForNext || current === "Error") return;

  const expression = `${previous} ${symbols[operator]} ${current} =`;
  current = calculate(previous, current, operator);

  setHistory(current === "Error" ? "" : expression);
  previous = null;
  operator = null;
  justEvaluated = true;
  updateDisplay();
}


function cancelLast() {
  if (current === "Error") {
    resetAll();
  } else if (waitingForNext || justEvaluated) {
    return;
  } else {
    current = current.slice(0, -1);
    if (current === "" || current === "-") current = "0";
  }
  updateDisplay();
}


function deleteAll() {
  resetAll();
  updateDisplay();
}

function percent() {
  if (current === "Error") return;
  current = formatResult(parseFloat(current) / 100);
  updateDisplay();
}


keypad.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  if (btn.dataset.number !== undefined) {
    inputNumber(btn.dataset.number);
  } else if (btn.dataset.operator) {
    inputOperator(btn.dataset.operator);
  } else if (btn.dataset.action === "clear") {
    cancelLast();
  } else if (btn.dataset.action === "delete") {
    deleteAll();
  } else if (btn.dataset.action === "percent") {
    percent();
  } else if (btn.dataset.action === "equals") {
    equals();
  }
});


document.addEventListener("keydown", (event) => {
  const key = event.key;

  if ((key >= "0" && key <= "9") || key === ".") {
    inputNumber(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    event.preventDefault();
    inputOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") {
    cancelLast();
  } else if (key === "Escape" || key === "Delete") {
    deleteAll();
  } else if (key === "%") {
    percent();
  }
});


updateDisplay();
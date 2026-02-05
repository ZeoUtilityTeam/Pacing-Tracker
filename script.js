const items = [
  "NEM Sub", "NEM Resub", "NEM Approval", "PTO Sub", "PTO Resub", "PTO Approval",
  "Signature Sent", "Signature Received", "Chatters"
];

const timePerItem = {
  "NEM Sub": 25,
  "PTO Sub": 25,
  "NEM Approval": 5,
  "PTO Approval": 5,
  "Signature Received": 5,
  "Chatters": 3,
  "Signature Sent": 15,
  "NEM Resub": 15,
  "PTO Resub": 15
};

const tracker = document.getElementById("tracker");
const totalDisplay = document.getElementById("total-count");
const progressBar = document.getElementById("progress-bar");
const progressDisplay = document.getElementById("progress-display");
const shiftHoursInput = document.getElementById("shift-hours");
const darkModeToggle = document.getElementById("darkModeToggle");
const icon = darkModeToggle.querySelector(".icon");

const counters = {};
let confettiFired = false;

/* ---------------- HELPERS (BIG STABILITY BOOST) ---------------- */

function autoResizeInput(input) {
  const length = input.value.length || 1;
  input.style.width = (length + 1) + "ch";
}

function getValue(el) {
  return parseInt(el.tagName === "INPUT" ? el.value : el.textContent) || 0;
}

function setValue(el, val) {
  if (el.tagName === "INPUT") {
    el.value = val;
  } else {
    el.textContent = val;
  }
}

/* ---------------- STORAGE ---------------- */

function loadFromStorage() {
  const saved = localStorage.getItem("trackerCounts");
  if (saved) return JSON.parse(saved);

  // default values must MATCH labels EXACTLY
  return Object.fromEntries(items.map(i => [i, 0]));
}

function saveToStorage() {
  const data = {};
  for (let label in counters) {
    data[label] = getValue(counters[label]);
  }
  localStorage.setItem("trackerCounts", JSON.stringify(data));
}

/* ---------------- TOTAL + PROGRESS ---------------- */

function updateTotal() {
  let totalMinutes = 0;

  for (let label in counters) {
    totalMinutes += getValue(counters[label]) * (timePerItem[label] || 0);
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  totalDisplay.textContent =
    `Total: ${totalMinutes} min (${hours} hr ${minutes} min)`;

  const shiftHours = parseFloat(shiftHoursInput.value);

  if (!isNaN(shiftHours) && shiftHours > 0) {
    const percentage = Math.round(
      (totalMinutes / (shiftHours * 60)) * 100
    );

    const capped = Math.min(100, percentage);

    progressBar.style.width = `${capped}%`;
    progressDisplay.textContent = `Progress: ${percentage}%`;

    if (percentage >= 90 && !confettiFired) {
      confettiFired = true;
      fireConfetti();
    }
  } else {
    progressBar.style.width = "0%";
    progressDisplay.textContent =
      "Enter shift hours to see progress";
  }
}

/* ---------------- CONFETTI ---------------- */

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#ff8800", "#ffffff", "#000000"]
    });

    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#ff8800", "#ffffff", "#000000"]
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ---------------- BUILD UI ---------------- */

const values = loadFromStorage();

items.forEach(label => {

  const div = document.createElement("div");
  div.className = "item";

  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label + ":";

  const controls = document.createElement("div");
  controls.className = "controls";

  let counterEl;

  // ⭐ CHATTERS = TYPEABLE INPUT
  if (label === "Chatters") {

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = values[label] || 0;
    input.className = "count-input";

    autoResizeInput(input);

    input.addEventListener("input", () => {
      if (input.value < 0) input.value = 0;

      autoResizeInput(input);
      saveToStorage();
      updateTotal();
    });

    const plusButton = document.createElement("button");
    plusButton.textContent = "+";

    plusButton.onclick = () => {
      setValue(input, getValue(input) + 1);
      autoResizeInput(input);
      saveToStorage();
      updateTotal();
    };

    const minusButton = document.createElement("button");
    minusButton.textContent = "−";

    minusButton.onclick = () => {
      setValue(input, Math.max(0, getValue(input) - 1));
      autoResizeInput(input);
      saveToStorage();
      updateTotal();
    };

    controls.append(minusButton, input, plusButton);
    counterEl = input;


  } else {

    const span = document.createElement("span");
    span.className = "count";
    span.textContent = values[label] || 0;

    const plusButton = document.createElement("button");
    plusButton.textContent = "+";

    plusButton.onclick = () => {
      setValue(span, getValue(span) + 1);
      saveToStorage();
      updateTotal();
    };

    const minusButton = document.createElement("button");
    minusButton.textContent = "−";

    minusButton.onclick = () => {
      setValue(span, Math.max(0, getValue(span) - 1));
      saveToStorage();
      updateTotal();
    };

    controls.append(minusButton, span, plusButton);
    counterEl = span;
  }

  counters[label] = counterEl;

  div.append(labelSpan, controls);
  tracker.append(div);
});

/* ---------------- RESET ---------------- */

document.getElementById("reset").onclick = () => {
  if (confirm("Reset all counts?")) {

    for (let label in counters) {
      setValue(counters[label], 0);
    }

    saveToStorage();
    updateTotal();
    confettiFired = false;
  }
};

/* ---------------- GOOGLE FORM ---------------- */

document.getElementById("submit").onclick = () => {

  const totalCount = Object.values(counters)
    .reduce((sum, el) => sum + getValue(el), 0);

  if (totalCount === 0) {
    alert("Please enter some values before submitting.");
    return;
  }

  const baseUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLSdoD9t7gkUVwBCO5by91cJ59lsUUPEQy-XL_00phfjMnRVqcQ/viewform?usp=pp_url";

  const formMap = {
    "NEM Sub": "entry.1750084173",
    "NEM Approval": "entry.2022773303",
    "NEM Resub": "entry.2134902399",
    "PTO Sub": "entry.1414420551",
    "PTO Approval": "entry.1602704240",
    "PTO Resub": "entry.1105379573",
    "Signature Sent": "entry.1718501368",
    "Signature Received": "entry.895961438",
  };

  const params = new URLSearchParams();

  for (let label in counters) {
    const entryId = formMap[label];
    if (entryId) {
      params.append(entryId, getValue(counters[label]));
    }
  }

  window.open(`${baseUrl}&${params.toString()}`, "_blank");
};

/* ---------------- SHIFT HOURS ---------------- */

shiftHoursInput.addEventListener("input", updateTotal);

/* ---------------- DARK MODE ---------------- */

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  icon.textContent = "☀️";
}

darkModeToggle.onclick = () => {

  darkModeToggle.classList.add("spin");
  setTimeout(() =>
    darkModeToggle.classList.remove("spin"), 400);

  const isDark = document.body.classList.toggle("dark-mode");

  localStorage.setItem("darkMode", isDark);
  icon.textContent = isDark ? "☀️" : "🌙";
};

updateTotal();

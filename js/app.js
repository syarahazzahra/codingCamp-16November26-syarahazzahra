/* =============================================
   MY DASHBOARD — app.js
   Challenges implemented:
     ✅ Light / Dark mode
     ✅ Custom name in greeting
     ✅ Prevent duplicate tasks
     ✅ Change Pomodoro time (bonus)
     ✅ Sort tasks (bonus)
   ============================================= */

"use strict";

/* ─── LocalStorage keys ─── */
const LS = {
  THEME: "dashboard_theme",
  NAME:  "dashboard_name",
  TASKS: "dashboard_tasks",
  LINKS: "dashboard_links",
  TIMER: "dashboard_timer_duration",
};

/* =============================================
   1. GREETING & CLOCK
   ============================================= */
const greetingText = document.getElementById("greeting-text");
const datetimeText = document.getElementById("datetime-text");

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function updateClock() {
  const now    = new Date();
  const name   = localStorage.getItem(LS.NAME) || "";
  const suffix = name ? `, ${name}` : "!";
  greetingText.textContent = `${getGreeting(now.getHours())}${suffix}`;
  datetimeText.textContent = `${formatDate(now)} · ${formatTime(now)}`;
}

updateClock();
setInterval(updateClock, 1000);

/* =============================================
   2. CUSTOM NAME
   ============================================= */
const nameBtn        = document.getElementById("name-btn");
const nameModal      = document.getElementById("name-modal");
const nameInput      = document.getElementById("name-input");
const nameSaveBtn    = document.getElementById("name-save-btn");
const nameCancelBtn  = document.getElementById("name-cancel-btn");

function openNameModal() {
  nameInput.value = localStorage.getItem(LS.NAME) || "";
  nameModal.classList.remove("hidden");
  nameInput.focus();
}

function closeNameModal() {
  nameModal.classList.add("hidden");
}

function saveName() {
  const val = nameInput.value.trim();
  if (val) {
    localStorage.setItem(LS.NAME, val);
  } else {
    localStorage.removeItem(LS.NAME);
  }
  closeNameModal();
  updateClock();
}

nameBtn.addEventListener("click", openNameModal);
nameSaveBtn.addEventListener("click", saveName);
nameCancelBtn.addEventListener("click", closeNameModal);
nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") saveName(); });
nameModal.addEventListener("click", (e) => { if (e.target === nameModal) closeNameModal(); });

/* =============================================
   3. LIGHT / DARK THEME
   ============================================= */
const themeBtn = document.getElementById("theme-btn");
const html     = document.documentElement;

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(LS.THEME, theme);
}

// Load saved or default to light
applyTheme(localStorage.getItem(LS.THEME) || "light");

themeBtn.addEventListener("click", () => {
  applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

/* =============================================
   4. FOCUS TIMER
   ============================================= */
const timerDisplay   = document.getElementById("timer-display");
const startBtn       = document.getElementById("start-btn");
const stopBtn        = document.getElementById("stop-btn");
const resetBtn       = document.getElementById("reset-btn");
const timerDurationEl = document.getElementById("timer-duration");
const setDurationBtn  = document.getElementById("set-duration-btn");

let timerDuration  = parseInt(localStorage.getItem(LS.TIMER) || "25", 10);
let timeLeft       = timerDuration * 60;
let timerInterval  = null;
let isRunning      = false;

function formatTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTimer(timeLeft);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      timerDisplay.textContent = "00:00";
      alert("⏰ Time's up! Great focus session!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  stopTimer();
  timeLeft = timerDuration * 60;
  renderTimer();
}

function setCustomDuration() {
  const val = parseInt(timerDurationEl.value, 10);
  if (isNaN(val) || val < 1 || val > 120) {
    alert("Please enter a duration between 1 and 120 minutes.");
    return;
  }
  timerDuration = val;
  localStorage.setItem(LS.TIMER, String(val));
  resetTimer();
}

// Initialise display on load
timerDurationEl.value = timerDuration;
renderTimer();

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
setDurationBtn.addEventListener("click", setCustomDuration);
timerDurationEl.addEventListener("keydown", (e) => { if (e.key === "Enter") setCustomDuration(); });

/* =============================================
   5. TO-DO LIST
   ============================================= */
const todoInput   = document.getElementById("todo-input");
const todoAddBtn  = document.getElementById("todo-add-btn");
const todoListEl  = document.getElementById("todo-list");
const sortSelect  = document.getElementById("sort-select");

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(LS.TASKS)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(LS.TASKS, JSON.stringify(tasks));
}

function getSortedTasks(tasks) {
  const order = sortSelect.value;
  const copy  = [...tasks];
  if (order === "az") {
    copy.sort((a, b) => a.text.localeCompare(b.text));
  } else if (order === "za") {
    copy.sort((a, b) => b.text.localeCompare(a.text));
  } else if (order === "done") {
    copy.sort((a, b) => Number(a.done) - Number(b.done));
  }
  return copy;
}

function renderTasks() {
  const tasks = loadTasks();
  const sorted = getSortedTasks(tasks);
  todoListEl.innerHTML = "";

  if (sorted.length === 0) {
    todoListEl.innerHTML = '<li style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No tasks yet. Add one above!</li>';
    return;
  }

  sorted.forEach((task) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${task.done ? "checked" : ""} aria-label="Mark done" />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions">
        <button class="todo-btn edit" title="Edit">✏️</button>
        <button class="todo-btn delete" title="Delete">🗑️</button>
      </div>
    `;

    // Toggle done
    li.querySelector(".todo-checkbox").addEventListener("change", () => toggleTask(task.id));

    // Edit
    li.querySelector(".todo-btn.edit").addEventListener("click", () => startEdit(task.id, li));

    // Delete
    li.querySelector(".todo-btn.delete").addEventListener("click", () => deleteTask(task.id));

    todoListEl.appendChild(li);
  });
}

function addTask() {
  const text = todoInput.value.trim();
  if (!text) return;

  const tasks = loadTasks();

  // ── Challenge: Prevent duplicate tasks (case-insensitive) ──
  const duplicate = tasks.some((t) => t.text.toLowerCase() === text.toLowerCase());
  if (duplicate) {
    alert(`"${text}" is already in your list!`);
    todoInput.focus();
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks(tasks);
  todoInput.value = "";
  renderTasks();
}

function toggleTask(id) {
  const tasks = loadTasks().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function startEdit(id, li) {
  const tasks   = loadTasks();
  const task    = tasks.find((t) => t.id === id);
  if (!task) return;

  const textSpan  = li.querySelector(".todo-text");
  const editInput = document.createElement("input");
  editInput.type      = "text";
  editInput.className = "todo-text-input";
  editInput.value     = task.text;
  editInput.maxLength = 100;

  textSpan.replaceWith(editInput);
  editInput.focus();

  const editBtn = li.querySelector(".todo-btn.edit");
  editBtn.textContent = "✅";
  editBtn.title = "Save";

  function saveEdit() {
    const newText = editInput.value.trim();
    if (!newText) return;

    // Prevent duplicate on edit too
    const otherTasks = tasks.filter((t) => t.id !== id);
    const duplicate  = otherTasks.some((t) => t.text.toLowerCase() === newText.toLowerCase());
    if (duplicate) {
      alert(`"${newText}" is already in your list!`);
      editInput.focus();
      return;
    }

    const updated = tasks.map((t) => t.id === id ? { ...t, text: newText } : t);
    saveTasks(updated);
    renderTasks();
  }

  editBtn.onclick = saveEdit;
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter")  saveEdit();
    if (e.key === "Escape") renderTasks();
  });
}

todoAddBtn.addEventListener("click", addTask);
todoInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });
sortSelect.addEventListener("change", renderTasks);

renderTasks();

/* =============================================
   6. QUICK LINKS
   ============================================= */
const linkNameInput  = document.getElementById("link-name-input");
const linkUrlInput   = document.getElementById("link-url-input");
const linkAddBtn     = document.getElementById("link-add-btn");
const linksContainer = document.getElementById("links-container");

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(LS.LINKS)) || [];
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(LS.LINKS, JSON.stringify(links));
}

function renderLinks() {
  const links = loadLinks();
  linksContainer.innerHTML = "";

  if (links.length === 0) {
    linksContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.88rem;">No links yet. Add one above!</p>';
    return;
  }

  links.forEach((link) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";

    const a = document.createElement("a");
    a.href   = link.url;
    a.target = "_blank";
    a.rel    = "noopener noreferrer";
    a.textContent = link.name || link.url;

    const delBtn = document.createElement("button");
    delBtn.className   = "link-delete-btn";
    delBtn.textContent = "✕";
    delBtn.title       = "Remove link";
    delBtn.addEventListener("click", () => deleteLink(link.id));

    chip.appendChild(a);
    chip.appendChild(delBtn);
    linksContainer.appendChild(chip);
  });
}

function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  if (!url) {
    alert("Please enter a URL.");
    linkUrlInput.focus();
    return;
  }

  // Prepend https:// if no protocol given
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;

  const links = loadLinks();
  links.push({ id: Date.now(), name: name || url, url });
  saveLinks(links);

  linkNameInput.value = "";
  linkUrlInput.value  = "";
  renderLinks();
}

function deleteLink(id) {
  const links = loadLinks().filter((l) => l.id !== id);
  saveLinks(links);
  renderLinks();
}

linkAddBtn.addEventListener("click", addLink);
linkUrlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addLink(); });

renderLinks();

/* =============================================
   UTILITY
   ============================================= */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

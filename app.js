import { getNote, countLinesByText, countVisualLines } from './notes.js';
import { playNote, playSequence } from './audio.js';

const STORAGE_KEY = 'doremi-todos';
let todos = [];

// --- Storage ---
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function load() {
  try {
    todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { todos = []; }
}

// --- Date ---
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayTodos() {
  const today = todayStr();
  return todos.filter(t => t.date === today);
}

// --- Note DOM builder ---
function buildNoteContainer(note) {
  const container = document.createElement('div');
  container.className = 'note-container';

  const head = document.createElement('div');
  head.className = 'note-head';
  head.style.background = note.color;
  head.style.top = (note.staffY - 5) + 'px';

  const stem = document.createElement('div');
  stem.className = 'note-stem';
  stem.style.background = note.color;
  // stem goes upward from note head
  stem.style.top = (note.staffY - 5 - 24) + 'px';

  const label = document.createElement('span');
  label.className = 'note-label';
  label.textContent = note.name;
  label.style.color = note.color;

  container.append(head, stem, label);
  return container;
}

// --- Render ---
function render() {
  const list = document.getElementById('todo-list');
  const items = todayTodos();

  if (items.length === 0) {
    list.innerHTML = '<li class="empty">오늘의 할 일을 추가해보세요</li>';
    document.getElementById('summary').textContent = '';
    return;
  }

  list.innerHTML = '';

  items.forEach((todo) => {
    const lines = countLinesByText(todo.text);
    const note = getNote(lines, todo.completed);

    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    const noteEl = buildNoteContainer(note);

    const check = document.createElement('div');
    check.className = 'todo-check';
    check.dataset.action = 'toggle';

    const textDiv = document.createElement('div');
    textDiv.className = 'todo-text';
    textDiv.textContent = todo.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'todo-delete';
    delBtn.dataset.action = 'delete';
    delBtn.title = '삭제';
    delBtn.innerHTML = '&times;';

    li.append(noteEl, check, textDiv, delBtn);
    list.appendChild(li);
  });

  // 렌더링 후 시각적 줄 수 측정 & 음표 업데이트
  requestAnimationFrame(() => updateNotesAfterRender(items));

  // Summary
  const melody = items.map(t => getNote(t._vl || countLinesByText(t.text), t.completed).name);
  document.getElementById('summary').textContent = `${items.length}개 — ${melody.join(' ')}`;
}

function updateNotesAfterRender(items) {
  const todoEls = document.querySelectorAll('.todo-item');
  const summaryParts = [];

  todoEls.forEach((el, i) => {
    const textEl = el.querySelector('.todo-text');
    const vl = countVisualLines(textEl);
    const todo = items[i];
    if (!todo) return;
    todo._vl = vl;

    const note = getNote(vl, todo.completed);
    summaryParts.push(note.name);

    // 음표 컨테이너 업데이트
    const container = el.querySelector('.note-container');
    if (!container) return;

    const head = container.querySelector('.note-head');
    const stem = container.querySelector('.note-stem');
    const label = container.querySelector('.note-label');

    if (head) {
      head.style.background = note.color;
      head.style.top = (note.staffY - 5) + 'px';
    }
    if (stem) {
      stem.style.background = note.color;
      stem.style.top = (note.staffY - 5 - 24) + 'px';
    }
    if (label) {
      label.textContent = note.name;
      label.style.color = note.color;
    }
  });

  document.getElementById('summary').textContent =
    `${items.length}개 — ${summaryParts.join(' ')}`;
}

// --- Note float animation ---
function showNoteAnimation(noteName, noteColor) {
  const el = document.createElement('div');
  el.className = 'note-float';
  el.textContent = '\u266A ' + noteName;
  el.style.color = noteColor;

  const inputArea = document.querySelector('.input-area');
  const rect = inputArea.getBoundingClientRect();
  el.style.left = (rect.left + rect.width / 2) + 'px';
  el.style.top = rect.bottom + 'px';

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

// --- Actions ---
function addTodo(text) {
  if (!text.trim()) return;
  const trimmed = text.trim();
  const lines = countLinesByText(trimmed);
  const note = getNote(lines, false);

  todos.push({
    id: crypto.randomUUID(),
    text: trimmed,
    completed: false,
    date: todayStr(),
  });
  save();
  render();

  playNote(note.freq);
  showNoteAnimation(note.name, note.color);
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  save();
  render();

  const items = todayTodos();
  const t = items.find(t => t.id === id);
  if (t) {
    const note = getNote(t._vl || countLinesByText(t.text), t.completed);
    playNote(note.freq);
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

// --- Events ---
document.getElementById('add-btn').addEventListener('click', () => {
  const input = document.getElementById('todo-input');
  addTodo(input.value);
  input.value = '';
  input.style.height = 'auto';
});

// Auto-resize textarea
document.getElementById('todo-input').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 160) + 'px';
});

// Todo list click delegation
document.getElementById('todo-list').addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;
  const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;

  if (action === 'toggle') {
    toggleTodo(id);
  } else if (action === 'delete') {
    deleteTodo(id);
  } else {
    const items = todayTodos();
    const todo = items.find(t => t.id === id);
    if (todo) {
      const note = getNote(todo._vl || countLinesByText(todo.text), todo.completed);
      playNote(note.freq);
      item.classList.add('highlight');
      setTimeout(() => item.classList.remove('highlight'), 400);
    }
  }
});

// Play All
document.getElementById('play-all').addEventListener('click', function () {
  const items = todayTodos();
  if (items.length === 0) return;

  const freqs = items.map(t => getNote(t._vl || countLinesByText(t.text), t.completed).freq);
  const duration = playSequence(freqs);

  this.classList.add('playing');
  this.disabled = true;

  const listItems = document.querySelectorAll('.todo-item');
  listItems.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('highlight');
      setTimeout(() => el.classList.remove('highlight'), 400);
    }, i * 600);
  });

  setTimeout(() => {
    this.classList.remove('playing');
    this.disabled = false;
  }, duration * 1000);
});

// Resize → 줄 수 재계산
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => render(), 200);
});

// Date label
document.getElementById('date-label').textContent = new Date().toLocaleDateString('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short'
});

// Init
load();
render();

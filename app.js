import { getNote, countLines } from './notes.js';
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

// --- Render ---
function render() {
  const list = document.getElementById('todo-list');
  const items = todayTodos();

  if (items.length === 0) {
    list.innerHTML = '<li class="empty">오늘의 할 일을 추가해보세요</li>';
    document.getElementById('summary').textContent = '';
    return;
  }

  list.innerHTML = items.map((todo, i) => {
    const lines = countLines(todo.text);
    const note = getNote(lines, todo.completed);
    return `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="note-badge" style="background:${note.color}" title="${note.name}">${note.name}</div>
        <div class="todo-check" data-action="toggle"></div>
        <div class="todo-text">${escapeHtml(todo.text)}</div>
        <button class="todo-delete" data-action="delete" title="삭제">&times;</button>
      </li>`;
  }).join('');

  // Summary
  const melody = items.map(t => getNote(countLines(t.text), t.completed).name);
  document.getElementById('summary').textContent = `${items.length}개 — ${melody.join(' ')}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

// --- Actions ---
function addTodo(text) {
  if (!text.trim()) return;
  todos.push({
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    date: todayStr(),
  });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  save();
  render();

  // 토글 후 음 재생
  const items = todayTodos();
  const idx = items.findIndex(t => t.id === id);
  if (idx >= 0) {
    const note = getNote(countLines(items[idx].text), items[idx].completed);
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

let isComposing = false;

document.getElementById('todo-input').addEventListener('compositionstart', () => {
  isComposing = true;
});

document.getElementById('todo-input').addEventListener('compositionend', () => {
  isComposing = false;
});

document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isComposing) {
    e.preventDefault();
    document.getElementById('add-btn').click();
  }
});

// Auto-resize textarea
document.getElementById('todo-input').addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

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
    // 아이템 클릭 시 음 재생
    const items = todayTodos();
    const todo = items.find(t => t.id === id);
    if (todo) {
      const note = getNote(countLines(todo.text), todo.completed);
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

  const freqs = items.map(t => getNote(countLines(t.text), t.completed).freq);
  const duration = playSequence(freqs);

  this.classList.add('playing');
  this.disabled = true;

  // 각 아이템 순서대로 하이라이트
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

// Date label
document.getElementById('date-label').textContent = new Date().toLocaleDateString('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short'
});

// Init
load();
render();

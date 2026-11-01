(() => {
  'use strict';

  const LS_KEY = 'todo.items.v1';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    form: $('#todo-form'),
    input: $('#todo-input'),
    list: $('#todo-list'),
    filters: $$('.filter'),
    clearCompleted: $('#clear-completed'),
    toggleAll: $('#toggle-all'),
    itemsLeft: $('#items-left'),
    template: $('#todo-item-template')
  };

  let todos = [];
  let currentFilter = 'all';

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      todos = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(todos)) todos = [];
    } catch (e) {
      todos = [];
    }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(todos));
  }

  function uid() {
    return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  }

  function addTodo(title) {
    const t = title.trim();
    if (!t) return;
    todos.push({ id: uid(), title: t, completed: false, createdAt: Date.now() });
    save();
    render();
  }

  function removeTodo(id) {
    todos = todos.filter(t => t.id !== id);
    save();
    render();
  }

  function toggleTodo(id, completed) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = completed;
      save();
      render();
    }
  }

  function updateTitle(id, newTitle) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const t = (newTitle || '').trim();
    if (!t) {
      // Empty after edit -> delete the todo
      removeTodo(id);
      return;
    }
    todo.title = t;
    save();
    render();
  }

  function clearCompleted() {
    const before = todos.length;
    todos = todos.filter(t => !t.completed);
    if (todos.length !== before) {
      save();
      render();
    }
  }

  function toggleAll() {
    if (todos.length === 0) return;
    const hasActive = todos.some(t => !t.completed);
    todos.forEach(t => { t.completed = hasActive; });
    save();
    render();
  }

  function setFilter(name) {
    currentFilter = name;
    els.filters.forEach(b => {
      const active = b.dataset.filter === name;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    render();
  }

  function getFilteredTodos() {
    switch (currentFilter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }

  function updateCounts() {
    const left = todos.filter(t => !t.completed).length;
    els.itemsLeft.textContent = `${left} ${left === 1 ? 'item' : 'items'} left`;
    els.clearCompleted.disabled = todos.every(t => !t.completed);
  }

  function createItemElement(todo) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = todo.id;
    if (todo.completed) node.classList.add('completed');

    const titleEl = $('.title', node);
    const toggleEl = $('.toggle', node);
    const editBtn = $('.edit', node);
    const deleteBtn = $('.delete', node);

    titleEl.textContent = todo.title;
    toggleEl.checked = todo.completed;

    // Handlers
    toggleEl.addEventListener('change', (e) => {
      toggleTodo(todo.id, e.target.checked);
    });

    deleteBtn.addEventListener('click', () => removeTodo(todo.id));

    function startEdit() {
      if (node.classList.contains('editing')) return;
      node.classList.add('editing');
      titleEl.contentEditable = 'true';
      titleEl.dataset.prev = titleEl.textContent;
      // place caret at end
      const range = document.createRange();
      range.selectNodeContents(titleEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      titleEl.focus();
    }

    function endEdit(commit) {
      if (!node.classList.contains('editing')) return;
      node.classList.remove('editing');
      titleEl.contentEditable = 'false';
      const next = commit ? titleEl.textContent : titleEl.dataset.prev || '';
      if (!commit) titleEl.textContent = next;
      if (commit) updateTitle(todo.id, next);
    }

    editBtn.addEventListener('click', startEdit);
    titleEl.addEventListener('dblclick', startEdit);

    titleEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        endEdit(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        endEdit(false);
      }
    });
    titleEl.addEventListener('blur', () => endEdit(true));

    return node;
  }

  function render() {
    els.list.innerHTML = '';
    const items = getFilteredTodos();
    const frag = document.createDocumentFragment();
    items.forEach(t => frag.appendChild(createItemElement(t)));
    els.list.appendChild(frag);
    updateCounts();
  }

  function bindEvents() {
    els.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = els.input.value;
      addTodo(val);
      els.input.value = '';
      els.input.focus();
    });

    els.filters.forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    els.clearCompleted.addEventListener('click', clearCompleted);
    els.toggleAll.addEventListener('click', toggleAll);
  }

  // Init
  load();
  bindEvents();
  // Ensure initial filter UI matches default
  setFilter('all');
})();

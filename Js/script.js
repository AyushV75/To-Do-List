 let tasks = [];
    let editingId = null;
    let currentFilter = 'all';

    document.addEventListener('DOMContentLoaded', () => {
      loadTasks();
      updateThemeToggle();
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.id === 'task-input') {
          addTask();
        }
        if (e.key === 'Escape' && editingId !== null) {
          cancelEdit();
        }
      });
    });

    function saveTasks() {
      localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
      const stored = localStorage.getItem('taskflow-tasks');
      if (stored) tasks = JSON.parse(stored);
      renderTasks();
      updateStats();
    }

    function addTask() {
      const input = document.getElementById('task-input');
      const text = input.value.trim();
      const category = document.getElementById('category-select').value;
      const priority = document.getElementById('priority-select').value;
      const dueDate = document.getElementById('due-date').value;

      if (!text || tasks.some(t => t.text.toLowerCase() === text.toLowerCase() && t.id !== editingId)) {
        if (!text) {
          input.style.borderColor = '#ef4444';
          setTimeout(() => input.style.borderColor = 'transparent', 2000);
        }
        return;
      }

      if (editingId !== null) {
        const task = tasks.find(t => t.id === editingId);
        if (task) {
          task.text = text;
          task.category = category;
          task.priority = priority;
          task.dueDate = dueDate;
        }
        editingId = null;
        document.querySelector('.btn-primary').textContent = 'Add Task';
      } else {
        tasks.push({
          id: Date.now(),
          text,
          completed: false,
          category,
          priority,
          dueDate
        });
      }

      clearForm();
      saveTasks();
      renderTasks();
      updateStats();
    }

    function clearForm() {
      document.getElementById('task-input').value = '';
      document.getElementById('due-date').value = '';
      document.getElementById('category-select').value = 'General';
      document.getElementById('priority-select').value = 'low';
    }

    function cancelEdit() {
      editingId = null;
      clearForm();
      document.querySelector('.btn-primary').textContent = 'Add Task';
    }

    function deleteTask(id) {
      if (!confirm('Are you sure you want to delete this task? 🗑️')) return;
      tasks = tasks.filter(task => task.id !== id);
      if (editingId === id) cancelEdit();
      saveTasks();
      renderTasks();
      updateStats();
    }

    function editTask(id) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        document.getElementById('task-input').value = task.text;
        document.getElementById('category-select').value = task.category;
        document.getElementById('priority-select').value = task.priority;
        document.getElementById('due-date').value = task.dueDate;
        editingId = id;
        document.querySelector('.btn-primary').textContent = 'Update Task';
        document.getElementById('task-input').focus();
      }
    }

    function toggleComplete(id) {
      const task = tasks.find(t => t.id === id);
      if (task) task.completed = !task.completed;
      saveTasks();
      renderTasks();
      updateStats();
    }

    function renderTasks() {
      const list = document.getElementById('task-list');
      const search = document.getElementById('search-input').value.toLowerCase();
      list.innerHTML = '';

      const filteredTasks = tasks.filter(task => {
        if (search && !task.text.toLowerCase().includes(search)) return false;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
        return true;
      });

      if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
          <div class="empty-state-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Add a new task to get started!</p>
        `;
        list.appendChild(emptyState);
        return;
      }

      filteredTasks.forEach((task, index) => {
        setTimeout(() => {
          const li = document.createElement('li');
          li.className = 'task-item';
          li.draggable = true;
          li.ondragstart = e => {
            e.dataTransfer.setData('id', task.id);
            li.classList.add('drag-preview');
          };
          li.ondragend = e => li.classList.remove('drag-preview');
          li.ondragover = e => e.preventDefault();
          li.ondrop = e => handleDrop(task.id, e);

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'task-checkbox';
          checkbox.checked = task.completed;
          checkbox.onchange = () => toggleComplete(task.id);

          const content = document.createElement('div');
          content.className = 'task-content';

          const textSpan = document.createElement('div');
          textSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
          textSpan.textContent = task.text;

          const meta = document.createElement('div');
          meta.className = 'task-meta';

          const priorityTag = document.createElement('span');
          priorityTag.className = `priority-tag priority-${task.priority}`;
          priorityTag.textContent = task.priority.toUpperCase();

          const categoryTag = document.createElement('span');
          categoryTag.className = 'category-tag';
          const categoryIcons = { Work: '💼', Personal: '🏠', General: '📋' };
          categoryTag.textContent = `${categoryIcons[task.category]} ${task.category}`;

          meta.appendChild(priorityTag);
          meta.appendChild(categoryTag);

          if (task.dueDate) {
            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'due-date';
            const isOverdue = new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0) && !task.completed;
            if (isOverdue) dueDateSpan.classList.add('overdue');
            
            const date = new Date(task.dueDate);
            dueDateSpan.textContent = `📅 ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            meta.appendChild(dueDateSpan);
          }

          content.appendChild(textSpan);
          content.appendChild(meta);

          const controls = document.createElement('div');
          controls.className = 'task-controls';

          const editBtn = document.createElement('button');
          editBtn.className = 'task-btn btn-edit';
          editBtn.innerHTML = '✏️';
          editBtn.onclick = () => editTask(task.id);

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'task-btn btn-delete';
          deleteBtn.innerHTML = '🗑️';
          deleteBtn.onclick = () => deleteTask(task.id);

          controls.appendChild(editBtn);
          controls.appendChild(deleteBtn);

          li.appendChild(checkbox);
          li.appendChild(content);
          li.appendChild(controls);
          list.appendChild(li);
        }, index * 100);
      });
    }

    function handleDrop(targetId, e) {
      e.preventDefault();
      const draggedId = parseInt(e.dataTransfer.getData('id'));
      const draggedIndex = tasks.findIndex(t => t.id === draggedId);
      const targetIndex = tasks.findIndex(t => t.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        const [dragged] = tasks.splice(draggedIndex, 1);
        tasks.splice(targetIndex, 0, dragged);
        saveTasks();
        renderTasks();
      }
    }

    function setFilter(filter) {
      currentFilter = filter;
      renderTasks();
    }

    function updateStats() {
      const total = tasks.length;
      const completed = tasks.filter(t => t.completed).length;
      
      document.getElementById('task-count').textContent = total;
      document.getElementById('completed-count').textContent = completed;
      
      const percent = total ? Math.round((completed / total) * 100) : 0;
      document.getElementById('progress-bar').style.width = `${percent}%`;
      document.getElementById('progress-text').textContent = `${percent}% Complete`;
    }

    function updateThemeToggle() {
      const theme = localStorage.getItem('theme') || '';
      document.body.className = `theme-transition ${theme}`;
    }

    function toggleTheme() {
      const current = document.body.classList.contains('dark');
      const next = current ? '' : 'dark';
      document.body.className = `theme-transition ${next}`;
      localStorage.setItem('theme', next);
      
      // Add a nice transition effect
      document.body.style.transform = 'scale(0.98)';
      setTimeout(() => {
        document.body.style.transform = 'scale(1)';
      }, 200);
    }
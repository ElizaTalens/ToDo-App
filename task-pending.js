class TaskPendingPage {
  constructor() {
    const params = new URLSearchParams(location.search);
    const urlISO = params.get('date');                           
    const storedISO = localStorage.getItem('todoSelectedDate'); 
    const initialISO = urlISO || storedISO || this.toISODate(new Date());

    this.currentDate  = this.fromISODate(initialISO);
    this.selectedDate = new Date(this.currentDate);

    this.init();
  }

  init() {
    this.updateDateDisplay();
    this.renderWeekView();
    this.renderPendingTasks();
    this.bindEvents();
  }

  bindEvents() {
    // Navigasi tanggal
    document.getElementById('prevDate')?.addEventListener('click', () => {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 1);
      this.setDate(d);
    });

    document.getElementById('nextDate')?.addEventListener('click', () => {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 1);
      this.setDate(d);
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'todoTasks') {
        this.renderPendingTasks();
      }
      if (e.key === 'todoSelectedDate') {
        const iso = localStorage.getItem('todoSelectedDate');
        if (iso) this.setDate(this.fromISODate(iso));
      }
    });
  }

  setDate(dateObj) {
    this.currentDate  = new Date(dateObj);
    this.selectedDate = new Date(dateObj);
    localStorage.setItem('todoSelectedDate', this.toISODate(this.selectedDate));
    this.updateDateDisplay();
    this.renderWeekView();
    this.renderPendingTasks();
  }

  updateDateDisplay() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const el = document.getElementById('currentDate');
    if (el) el.textContent = `${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]}`;
  }

  renderWeekView() {
    const weekContainer = document.querySelector('.calendar-week');
    if (!weekContainer) return;
    weekContainer.innerHTML = '';

    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const dayNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'day-item';
      dayElement.setAttribute('role', 'button');
      dayElement.setAttribute('tabindex', '0');

      if (this.isSameDay(date, this.selectedDate)) {
        dayElement.classList.add('active');
      }

      dayElement.innerHTML = `
        <span class="day-name">${dayNames[date.getDay()]}</span>
        <span class="day-number">${date.getDate()}</span>
      `;

      const onPick = () => this.setDate(date);
      dayElement.addEventListener('click', onPick);
      dayElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') onPick();
      });

      weekContainer.appendChild(dayElement);
    }
  }

  renderPendingTasks() {
    const taskList = document.querySelector('.task-list');
    if (!taskList) return;
    taskList.innerHTML = '';

    const tasks = JSON.parse(localStorage.getItem('todoTasks') ?? '[]');
    const selectedISO = this.toISODate(this.selectedDate);

    const pendingTasks = tasks.filter(t => !t.completed && t.date === selectedISO);

    if (pendingTasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.style.padding = '24px';
      empty.style.textAlign = 'center';
      empty.style.opacity = '0.7';
      empty.textContent = 'Tidak ada task pending untuk tanggal ini.';
      taskList.appendChild(empty);
      return;
    }

    pendingTasks.forEach((task) => {
      const priority = (task.priority || 'low').toLowerCase();
      const item = document.createElement('div');
      item.className = 'task-item';
      item.innerHTML = `
        <div class="checkbox" aria-hidden="true"></div>
        <div class="task-content">
          <span class="task-name">${this.escape(task.name)}</span>
          <span class="priority ${priority}">${priority.toUpperCase()}</span>
        </div>
      `;
      taskList.appendChild(item);
    });
  }

  // ===== Utils =====
  isSameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  fromISODate(iso) {
    return new Date(`${iso}T00:00:00`);
  }

  escape(str = '') {
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }
}

document.addEventListener('DOMContentLoaded', () => new TaskPendingPage());

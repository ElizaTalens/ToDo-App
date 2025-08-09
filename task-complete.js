class TaskCompletePage {
  constructor() {
    const params = new URLSearchParams(location.search);
    const urlISO = params.get('date');
    const storedISO = localStorage.getItem('todoSelectedDate');
    const initialISO = urlISO || storedISO || this.toISODate(new Date());

    this.currentDate  = this.fromISODate(initialISO);
    this.selectedDate = new Date(this.currentDate);

    this.init();
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

  setDate(dateObj) {
    this.currentDate  = new Date(dateObj);
    this.selectedDate = new Date(dateObj);

    localStorage.setItem('todoSelectedDate', this.toISODate(this.selectedDate));

    this.updateDateDisplay();
    this.renderWeekView();
    this.renderCompletedTasks();
  }

  init() {
    this.updateDateDisplay();
    this.renderWeekView();
    this.renderCompletedTasks();
    this.bindEvents();
  }

  bindEvents() {
    // Navigasi tanggal kiri/kanan
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
      if (e.key === 'todoSelectedDate') {
        const iso = localStorage.getItem('todoSelectedDate');
        if (iso) this.setDate(this.fromISODate(iso));
      }
      if (e.key === 'todoTasks') {
        this.renderCompletedTasks();
      }
    });
  }

  updateDateDisplay() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]}`;
    const el = document.getElementById('currentDate');
    if (el) el.textContent = dateStr;
  }

  renderWeekView() {
    const weekContainer = document.querySelector('.calendar-week');
    if (!weekContainer) return;

    weekContainer.innerHTML = '';

    const startOfWeek = new Date(this.currentDate);
    const day = startOfWeek.getDay(); 
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'day-item';
      if (this.isSameDay(date, this.selectedDate)) {
        dayElement.classList.add('active');
      }

      dayElement.innerHTML = `
        <span class="day-name">${dayNames[date.getDay()]}</span>
        <span class="day-number">${date.getDate()}</span>
      `;

      dayElement.addEventListener('click', () => {
        this.setDate(date);
      });

      weekContainer.appendChild(dayElement);
    }
  }

  renderCompletedTasks() {
    const taskList = document.querySelector('.task-list');
    if (!taskList) return;

    taskList.innerHTML = '';

    let tasks = [];
    try {
      tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
    } catch (_) {
      tasks = [];
    }

    const selectedDateStr = this.toISODate(this.selectedDate);

    const completedTasks = tasks.filter(
      (task) => task.completed && task.date === selectedDateStr
    );

    if (completedTasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.style.padding = '24px';
      empty.style.textAlign = 'center';
      empty.style.opacity = '0.7';
      empty.textContent = 'Tidak ada task completed untuk tanggal ini.';
      taskList.appendChild(empty);
      return;
    }

    completedTasks.forEach((task) => {
      const item = document.createElement('div');
      item.className = 'task-item completed';
      item.innerHTML = `
        <div class="checkbox checked">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="white"/>
          </svg>
        </div>
        <div class="task-content">
          <span class="task-name">${task.name}</span>
          <span class="priority ${task.priority}">${String(task.priority).toUpperCase()}</span>
        </div>
      `;
      taskList.appendChild(item);
    });
  }


  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TaskCompletePage();
});

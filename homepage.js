// Calendar functionality
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.isFullView = false;
        this.init();
    }

    init() {
        this.updateDisplay();
        this.bindEvents();
        this.updateTime();
        this.renderTasksForSelectedDate();
        setInterval(() => this.updateTime(), 1000);
    }

    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateDisplay();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateDisplay();
        });

        document.getElementById('toggleView').addEventListener('click', () => {
            this.toggleCalendarView();
        });

        document.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function() {
                const taskItem = this.closest('.task-item');
                this.classList.toggle('checked');
                taskItem.classList.toggle('completed');
                calendar.updateTaskCounters();
            });
        });
    }


    updateDisplay() {
        this.updateMonthYear();
        if (this.isFullView) {
            this.renderFullCalendar();
        } else {
            this.renderWeekView();
        }
    }

    updateMonthYear() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('currentMonth').textContent = months[this.currentDate.getMonth()];
        document.getElementById('currentYear').textContent = this.currentDate.getFullYear();
    }

    renderWeekView() {
        const weekView = document.getElementById('weekView');
        weekView.innerHTML = '';

        const startOfWeek = new Date(this.selectedDate);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            const dayElement = document.createElement('div');
            dayElement.className = 'day';

            if (this.isSameDay(date, this.selectedDate)) {
                dayElement.classList.add('active');
            }

            if (this.isSameDay(date, new Date())) {
                dayElement.classList.add('today');
            }

            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            dayElement.innerHTML = `
                <span class="day-name">${dayNames[date.getDay()]}</span>
                <span class="day-number">${date.getDate()}</span>
            `;

            dayElement.addEventListener('click', () => {
                this.selectedDate = new Date(date);
                this.currentDate = new Date(date);
                this.updateDisplay();
                this.renderTasksForSelectedDate();

                localStorage.setItem('todoSelectedDate', toISODate(this.selectedDate));
            });

            weekView.appendChild(dayElement);
        }
    }

    renderFullCalendar() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';

        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dateElement = document.createElement('div');
            dateElement.className = 'calendar-date';
            dateElement.textContent = date.getDate();

            if (date.getMonth() !== this.currentDate.getMonth()) {
                dateElement.classList.add('other-month');
            }

            if (this.isSameDay(date, this.selectedDate)) {
                dateElement.classList.add('selected');
            }

            if (this.isSameDay(date, new Date())) {
                dateElement.classList.add('today');
            }

            dateElement.addEventListener('click', () => {
                this.selectedDate = new Date(date);
                if (date.getMonth() !== this.currentDate.getMonth()) {
                    this.currentDate = new Date(date);
                }
                this.updateDisplay();
                this.renderTasksForSelectedDate();

                // simpan tanggal terpilih untuk sinkron Task Pending
                localStorage.setItem('todoSelectedDate', toISODate(this.selectedDate));
            });

            grid.appendChild(dateElement);
        }
    }

    toggleCalendarView() {
        this.isFullView = !this.isFullView;
        const fullCalendar = document.getElementById('fullCalendar');
        const weekView = document.getElementById('weekView');
        const toggleBtn = document.getElementById('toggleView');

        if (this.isFullView) {
            fullCalendar.style.display = 'block';
            weekView.style.display = 'none';
            toggleBtn.textContent = 'View Week';
            this.renderFullCalendar();
        } else {
            fullCalendar.style.display = 'none';
            weekView.style.display = 'flex';
            toggleBtn.textContent = 'View Full Calendar';
            this.renderWeekView();
        }
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.querySelector('.time').textContent = timeString;

        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).toUpperCase().replace(/,/g, '');
        document.querySelector('.date').textContent = dateString;
    }

    updateTaskCounters() {
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        const pendingTasks = document.querySelectorAll('.task-item:not(.completed)').length;

        document.querySelector('.task-card.complete .task-number').textContent = completedTasks;
        document.querySelector('.task-card.pending .task-number').textContent = pendingTasks;
    }

    renderTasksForSelectedDate() {
        const taskList = document.querySelector('.task-list');
        if (!taskList) return;

        taskList.innerHTML = '';

        const tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];

        // GANTI ke toISODate (anti shift timezone)
        const selectedDateStr = toISODate(this.selectedDate);

        const filteredTasks = tasks.filter(task => task.date === selectedDateStr);

        filteredTasks.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-item';
            if (task.completed) item.classList.add('completed');

            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox';
            if (task.completed) checkbox.classList.add('checked');

            checkbox.addEventListener('click', () => {
                item.classList.toggle('completed');
                checkbox.classList.toggle('checked');
                task.completed = !task.completed;

                localStorage.setItem('todoTasks', JSON.stringify(tasks));
                this.updateTaskCounters();
    

            });

            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'task-name';
            nameSpan.textContent = task.name;

            const prioritySpan = document.createElement('span');
            prioritySpan.className = `priority ${task.priority}`;
            prioritySpan.textContent = task.priority.toUpperCase();

            taskContent.appendChild(nameSpan);
            taskContent.appendChild(prioritySpan);

            const infoIcon = document.createElement('div');
            infoIcon.className = 'info-icon';
            infoIcon.className = 'fa-solid fa-trash';

            infoIcon.addEventListener('click', () => {
            // cari task yang cocok di storage untuk tanggal terpilih
            const all = JSON.parse(localStorage.getItem('todoTasks') || '[]');
            const idx = all.findIndex(t =>
            t.date === selectedDateStr &&
            t.name === task.name &&
            t.priority === task.priority
            );

            if (idx !== -1) {
            all.splice(idx, 1);
            localStorage.setItem('todoTasks', JSON.stringify(all));
            this.renderTasksForSelectedDate();
            this.updateTaskCounters();         
            }
        });
            item.appendChild(checkbox);
            item.appendChild(taskContent);
            item.appendChild(infoIcon);
            taskList.appendChild(item);
        });

        this.updateTaskCounters();
    }
}

let calendar;
document.addEventListener('DOMContentLoaded', function() {
    calendar = new Calendar();
    calendar.renderTasksForSelectedDate();

    document.getElementById('deleteAllButton')?.addEventListener('click', deleteAllTasksForSelectedDate);
});

function deleteAllTasksForSelectedDate() {
    if (!calendar) return;

    const iso = toISODate(calendar.selectedDate); 
    const tasks = JSON.parse(localStorage.getItem('todoTasks') || '[]');

    const ok = confirm(`Hapus semua task untuk ${iso}?`);
    if (!ok) return;

    const remaining = tasks.filter(t => t.date !== iso);

    localStorage.setItem('todoTasks', JSON.stringify(remaining));

    calendar.renderTasksForSelectedDate();
    calendar.updateTaskCounters();
    }

function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function openTaskComplete() {
    window.location.href = 'task-complete.html';
}

function openTaskPending() {
    const iso = localStorage.getItem('todoSelectedDate') || toISODate(new Date());
    window.location.href = `task-pending.html?date=${iso}`;
}

function openCreateTask() {
    window.location.href = 'create-task.html';
}

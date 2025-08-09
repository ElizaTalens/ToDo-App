class CreateTaskPage {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.init();
    }

    init() {
        this.updateDateDisplay();
        this.renderWeekView();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('prevDate')?.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() - 1);
            this.selectedDate = new Date(this.currentDate);
            this.updateDateDisplay();
            this.renderWeekView();
        });

        document.getElementById('nextDate')?.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            this.selectedDate = new Date(this.currentDate);
            this.updateDateDisplay();
            this.renderWeekView();
        });

        document.getElementById('taskForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        document.querySelectorAll('input[name="priority"]').forEach(radio => {
            radio.addEventListener('change', function() {
                document.querySelectorAll('.priority-option').forEach(option => {
                    option.classList.remove('selected');
                });
                this.closest('.priority-option').classList.add('selected');
            });
        });

        document.getElementById('alertToggle')?.addEventListener('change', function() {
            if (this.checked) {
                console.log('Alert enabled for this task');
            } else {
                console.log('Alert disabled for this task');
            }
        });
    }

    updateDateDisplay() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dateStr = `${this.currentDate.getDate()} ${months[this.currentDate.getMonth()]}`;
        document.getElementById('currentDate').textContent = dateStr;
    }

    renderWeekView() {
        const weekContainer = document.getElementById('calendarWeek');
        if (!weekContainer) return;

        weekContainer.innerHTML = '';

        // Get the week containing the current date
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
                this.selectedDate = new Date(date);
                this.currentDate = new Date(date);
                this.updateDateDisplay();
                this.renderWeekView();
            });

            weekContainer.appendChild(dayElement);
        }
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    handleFormSubmit() {
        // Get form data
        const taskName = document.getElementById('taskName').value.trim();
        const taskDescription = document.getElementById('taskDescription').value.trim();
        const priority = document.querySelector('input[name="priority"]:checked')?.value;
        const alertEnabled = document.getElementById('alertToggle').checked;

        if (!taskName) {
            alert('Please enter a task name');
            return;
        }

        if (!priority) {
            alert('Please select a priority level');
            return;
        }

        const newTask = {
            id: Date.now(),
            name: taskName,
            description: taskDescription,
            priority: priority,
            alertEnabled: alertEnabled,
            date: this.selectedDate.toISOString().split('T')[0],
            completed: false,
            createdAt: new Date()
        };

        this.saveTask(newTask);
        this.showSuccessMessage();

        setTimeout(() => {
            window.location.href = 'homepage.html';
        }, 1500);
    }

    saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        
        tasks.push(task);
        
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        
        console.log('Task saved:', task);
    }

    showSuccessMessage() {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="success-icon">✓</div>
                <span>Task created successfully!</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #10B981;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
            z-index: 1000;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .success-icon {
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new CreateTaskPage();
});


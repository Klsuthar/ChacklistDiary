const API_URL = 'https://script.google.com/macros/s/AKfycbzobjZ3YvhkSkYGvXD389MveJ_Y-6cTX1e4diBbAkSabacv19PFACThIRO8Z9ZjhTY7/exec';

let currentDate = new Date();
let tasksData = [];
let selectedDate = null;
let touchStartX = 0;
let touchEndX = 0;

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL, { method: 'GET', redirect: 'follow' });
        const text = await response.text();
        tasksData = JSON.parse(text);
        renderCalendar();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('calendar').innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: white;">Failed to load data</div>';
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    for (let i = firstDay - 1; i >= 0; i--) {
        createDayCell(prevMonthDays - i, month - 1, year, true);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        createDayCell(day, month, year, false);
    }
    
    const totalCells = firstDay + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remainingCells; day++) {
        createDayCell(day, month + 1, year, true);
    }
}

function createDayCell(day, month, year, isOtherMonth) {
    const adjustedMonth = month < 0 ? 11 : month > 11 ? 0 : month;
    const adjustedYear = month < 0 ? year - 1 : month > 11 ? year + 1 : year;
    
    const dateStr = `${adjustedYear}-${String(adjustedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const task = tasksData.find(t => {
        const taskDate = new Date(t.date);
        const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
        return taskDateStr === dateStr;
    });
    
    const dayCell = document.createElement('div');
    dayCell.className = 'day day-cell';
    dayCell.textContent = day;
    
    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }
    
    if (task) {
        if (task.status === 1) {
            dayCell.classList.add('status-1');
        } else if (task.status === 0) {
            dayCell.classList.add('status-0');
        }
        
        if (task.note && task.note.trim()) {
            dayCell.classList.add('has-note');
        }
    }
    
    dayCell.addEventListener('click', () => openEditModal(dateStr, task));
    
    document.getElementById('calendar').appendChild(dayCell);
}

function openEditModal(dateStr, task) {
    selectedDate = dateStr;
    const modal = document.getElementById('editModal');
    
    document.getElementById('modalDate').textContent = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.querySelectorAll('.status-btn').forEach(btn => btn.classList.remove('active'));
    
    if (task) {
        if (task.status === 1) {
            document.querySelector('[data-status="1"]').classList.add('active');
        } else if (task.status === 0) {
            document.querySelector('[data-status="0"]').classList.add('active');
        }
        document.getElementById('noteInput').value = task.note || '';
    } else {
        document.getElementById('noteInput').value = '';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveTask() {
    const status = document.querySelector('.status-btn.active')?.dataset.status || '';
    const note = document.getElementById('noteInput').value.trim();
    
    if (!status) {
        alert('Please select a status (Done or Not Done)');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        const payload = {
            date: selectedDate,
            status: parseInt(status),
            note: note
        };
        
        console.log('Sending to API:', payload);
        
        const url = `${API_URL}?date=${encodeURIComponent(selectedDate)}&status=${status}&note=${encodeURIComponent(note)}`;
        
        await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        const existingTaskIndex = tasksData.findIndex(t => {
            const taskDate = new Date(t.date);
            const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
            return taskDateStr === selectedDate;
        });
        
        if (existingTaskIndex !== -1) {
            tasksData[existingTaskIndex].status = parseInt(status);
            tasksData[existingTaskIndex].note = note;
        } else {
            tasksData.push({
                date: selectedDate + 'T18:30:00.000Z',
                status: parseInt(status),
                note: note
            });
        }
        
        renderCalendar();
        closeModal();
        
        saveBtn.textContent = 'Save';
        saveBtn.disabled = false;
        
        setTimeout(() => fetchTasks(), 500);
        
    } catch (error) {
        console.error('Save error:', error);
        saveBtn.textContent = 'Save';
        saveBtn.disabled = false;
        alert('Error saving. Check console (F12) for details.');
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.querySelector('.close').addEventListener('click', closeModal);

document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.getElementById('saveBtn').addEventListener('click', saveTask);

window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) closeModal();
});

const calendar = document.querySelector('.calendar-wrapper');
calendar.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
calendar.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    } else if (touchEndX - touchStartX > 50) {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }
});

fetchTasks();

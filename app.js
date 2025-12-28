const API_URL = 'https://script.google.com/macros/s/AKfycbwLuhPOVkLIVW3iMSXC78MMeu-fyRyOccDEnR1gQyEKEac4h80yCMqjYFxxnBwzStOS/exec';

let currentDate = new Date();
let tasksData = [];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        tasksData = await response.json();
        console.log('Data fetched:', tasksData);
        renderCalendar();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to load data. Check console for details.');
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
    const task = tasksData.find(t => t.date === dateStr);
    
    const dayCell = document.createElement('div');
    dayCell.className = 'day day-cell';
    dayCell.textContent = day;
    
    if (isOtherMonth) {
        dayCell.classList.add('other-month');
    }
    
    if (task) {
        dayCell.classList.add(`status-${task.status}`);
        if (task.note) {
            dayCell.classList.add('has-note');
            dayCell.addEventListener('click', () => showModal(dateStr, task.note));
        }
    }
    
    document.getElementById('calendar').appendChild(dayCell);
}

function showModal(date, note) {
    document.getElementById('modalDate').textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('modalNote').textContent = note;
    document.getElementById('noteModal').style.display = 'block';
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('noteModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('noteModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

fetchTasks();

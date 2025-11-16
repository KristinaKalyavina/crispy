// Глобальный объект для хранения состояния
let appState = {
    tasks: [],
    mainTasks: [],
    habits: {},
    priorities: [],
    journal: {
        gratitude: '',
        thoughts: ''
    },
    affirmations: [
        'Я нахожусь в правильном месте в правильное время.',
        'Я так благодарна за всё, что у меня есть.',
        'Меня любят такой, какая я есть.',
        'Я заслуживаю просить о помощи.'
    ],
    progress: 50,
    workouts: [],
    workoutFocus: {},
    water: {},
    expenses: [],
    wishlist: [],
    trips: []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeWaterTable();
    loadState();
    bindEvents();
    renderAll();
});

// ==================== СОХРАНЕНИЕ И ЗАГРУЗКА СОСТОЯНИЯ ====================

/**
 * Собирает текущее состояние всех элементов формы в объект
 */
function collectState() {
    const state = {
        tasks: appState.tasks,
        mainTasks: appState.mainTasks,
        habits: appState.habits,
        priorities: appState.priorities,
        journal: {
            gratitude: document.getElementById('gratitude-text')?.value || '',
            thoughts: document.getElementById('thoughts-text')?.value || ''
        },
        affirmations: appState.affirmations,
        progress: parseInt(document.getElementById('progress-range')?.value || 50),
        workouts: appState.workouts,
        workoutFocus: appState.workoutFocus,
        water: appState.water,
        expenses: appState.expenses,
        wishlist: appState.wishlist,
        trips: appState.trips
    };

    // Собираем состояние чекбоксов привычек
    const habitChecks = document.querySelectorAll('.habit-check');
    habitChecks.forEach(check => {
        const habit = check.dataset.habit;
        const day = check.dataset.day;
        if (!state.habits[habit]) {
            state.habits[habit] = {};
        }
        state.habits[habit][day] = check.checked;
    });

    // Собираем состояние фокуса тренировок
    const focusChecks = document.querySelectorAll('.focus-check');
    focusChecks.forEach(check => {
        const focus = check.closest('.focus-card').dataset.focus;
        state.workoutFocus[focus] = check.checked;
    });

    return state;
}

/**
 * Сохраняет состояние в localStorage
 */
function saveState() {
    const state = collectState();
    try {
        localStorage.setItem('that_girl_planner_state', JSON.stringify(state));
        appState = state;
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
    }
}

/**
 * Загружает состояние из localStorage
 */
function loadState() {
    try {
        const saved = localStorage.getItem('that_girl_planner_state');
        if (saved) {
            const state = JSON.parse(saved);
            appState = { ...appState, ...state };
        }
    } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
    }
}

// ==================== ПРИВЯЗКА СОБЫТИЙ ====================

/**
 * Навешивает обработчики событий на все элементы
 */
function bindEvents() {
    // Задачи
    document.getElementById('add-task-btn')?.addEventListener('click', addTask);
    document.getElementById('add-priority-btn')?.addEventListener('click', addPriority);
    
    // Дневник
    document.getElementById('gratitude-text')?.addEventListener('input', saveState);
    document.getElementById('thoughts-text')?.addEventListener('input', saveState);
    
    // Аффирмации
    document.getElementById('add-affirmation-btn')?.addEventListener('click', addAffirmation);
    
    // Прогресс
    const progressRange = document.getElementById('progress-range');
    if (progressRange) {
        progressRange.addEventListener('input', function() {
            updateProgressBar(this.value);
            saveState();
        });
    }
    
    // Привычки
    document.querySelectorAll('.habit-check').forEach(check => {
        check.addEventListener('change', saveState);
    });
    
    // Тренировки
    document.getElementById('add-workout-btn')?.addEventListener('click', addWorkout);
    document.querySelectorAll('.focus-check').forEach(check => {
        check.addEventListener('change', saveState);
    });
    
    // Вода
    document.getElementById('reset-water-btn')?.addEventListener('click', resetWaterTracker);
    
    // Расходы
    document.getElementById('add-expense-btn')?.addEventListener('click', addExpense);
    
    // Wishlist
    document.getElementById('add-wishlist-btn')?.addEventListener('click', addWishlistItem);
    
    // Поездки
    document.getElementById('add-trip-btn')?.addEventListener('click', addTrip);
}

// ==================== РЕНДЕРИНГ ====================

/**
 * Отрисовывает все компоненты на основе текущего состояния
 */
function renderAll() {
    renderTasks();
    renderMainTasks();
    renderPriorities();
    renderJournal();
    renderAffirmations();
    renderProgress();
    renderHabits();
    renderWorkouts();
    renderWorkoutFocus();
    renderWater();
    renderExpenses();
    renderWishlist();
    renderTrips();
}

// ==================== ЗАДАЧИ ====================

function addTask() {
    const name = document.getElementById('task-name').value.trim();
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;
    const category = document.getElementById('task-category').value;
    
    if (!name || !date) {
        alert('Пожалуйста, заполните название задачи и дату');
        return;
    }
    
    const task = {
        id: Date.now(),
        name,
        date,
        time,
        category,
        completed: false
    };
    
    appState.tasks.push(task);
    document.getElementById('task-name').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-time').value = '';
    
    renderTasks();
    saveState();
}

function renderTasks() {
    const tbody = document.getElementById('tasks-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Сортируем задачи по дате
    const sortedTasks = [...appState.tasks].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
    });
    
    sortedTasks.forEach(task => {
        const tr = document.createElement('tr');
        const categoryNames = {
            work: 'Работа',
            personal: 'Личное',
            health: 'Здоровье',
            travel: 'Путешествия',
            birthday: 'День рождения'
        };
        
        tr.innerHTML = `
            <td>
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="toggleTask(${task.id})">
            </td>
            <td>${task.name}</td>
            <td>${formatDate(task.date)}</td>
            <td>${task.time || '-'}</td>
            <td>${categoryNames[task.category] || task.category}</td>
            <td>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Обновляем главные задачи дня
    updateMainTasks();
}

function toggleTask(id) {
    const task = appState.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        saveState();
    }
}

function deleteTask(id) {
    appState.tasks = appState.tasks.filter(t => t.id !== id);
    renderTasks();
    saveState();
}

function updateMainTasks() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = appState.tasks
        .filter(t => t.date === today && !t.completed)
        .slice(0, 5);
    
    appState.mainTasks = todayTasks.map(t => t.id);
    renderMainTasks();
}

function renderMainTasks() {
    const list = document.getElementById('main-tasks-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const todayTasks = appState.tasks.filter(t => appState.mainTasks.includes(t.id));
    
    if (todayTasks.length === 0) {
        list.innerHTML = '<li>Нет задач на сегодня</li>';
        return;
    }
    
    todayTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span>${task.name}</span>
        `;
        list.appendChild(li);
    });
}

// ==================== ПРИОРИТЕТЫ ====================

function addPriority() {
    const name = document.getElementById('priority-name').value.trim();
    const date = document.getElementById('priority-date').value;
    const level = document.getElementById('priority-level').value;
    
    if (!name) {
        alert('Пожалуйста, введите название цели');
        return;
    }
    
    const priority = {
        id: Date.now(),
        name,
        date: date || null,
        level
    };
    
    appState.priorities.push(priority);
    document.getElementById('priority-name').value = '';
    document.getElementById('priority-date').value = '';
    
    renderPriorities();
    saveState();
}

function renderPriorities() {
    const list = document.getElementById('priorities-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    appState.priorities.forEach(priority => {
        const li = document.createElement('li');
        li.className = `priority-${priority.level}`;
        
        const levelNames = {
            high: 'Высокий',
            medium: 'Средний',
            low: 'Низкий'
        };
        
        li.innerHTML = `
            <div>
                <strong>${priority.name}</strong>
                ${priority.date ? `<br><small>Срок: ${formatDate(priority.date)}</small>` : ''}
                <br><small>Приоритет: ${levelNames[priority.level]}</small>
            </div>
            <button class="btn-delete" onclick="deletePriority(${priority.id})">Удалить</button>
        `;
        list.appendChild(li);
    });
}

function deletePriority(id) {
    appState.priorities = appState.priorities.filter(p => p.id !== id);
    renderPriorities();
    saveState();
}

// ==================== ДНЕВНИК ====================

function renderJournal() {
    const gratitude = document.getElementById('gratitude-text');
    const thoughts = document.getElementById('thoughts-text');
    
    if (gratitude && appState.journal.gratitude) {
        gratitude.value = appState.journal.gratitude;
    }
    if (thoughts && appState.journal.thoughts) {
        thoughts.value = appState.journal.thoughts;
    }
}

// ==================== АФФИРМАЦИИ ====================

function addAffirmation() {
    const text = document.getElementById('new-affirmation').value.trim();
    if (!text) {
        alert('Пожалуйста, введите аффирмацию');
        return;
    }
    
    appState.affirmations.push(text);
    document.getElementById('new-affirmation').value = '';
    
    renderAffirmations();
    saveState();
}

function renderAffirmations() {
    const list = document.getElementById('affirmations-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    appState.affirmations.forEach((affirmation, index) => {
        const card = document.createElement('div');
        card.className = 'affirmation-card';
        card.innerHTML = `
            ${affirmation}
            <button class="btn-delete" style="float: right; margin-top: -0.5rem;" 
                    onclick="deleteAffirmation(${index})">×</button>
        `;
        list.appendChild(card);
    });
}

function deleteAffirmation(index) {
    appState.affirmations.splice(index, 1);
    renderAffirmations();
    saveState();
}

// ==================== ПРОГРЕСС ====================

function renderProgress() {
    const range = document.getElementById('progress-range');
    const value = appState.progress || 50;
    
    if (range) {
        range.value = value;
        updateProgressBar(value);
    }
}

function updateProgressBar(value) {
    const bar = document.getElementById('progress-bar');
    const text = document.getElementById('progress-value');
    
    if (bar) {
        bar.style.width = value + '%';
    }
    if (text) {
        text.textContent = value + '%';
    }
}

// ==================== ПРИВЫЧКИ ====================

function renderHabits() {
    if (!appState.habits) return;
    
    Object.keys(appState.habits).forEach(habit => {
        Object.keys(appState.habits[habit]).forEach(day => {
            const check = document.querySelector(`.habit-check[data-habit="${habit}"][data-day="${day}"]`);
            if (check) {
                check.checked = appState.habits[habit][day];
            }
        });
    });
}

// ==================== ТРЕНИРОВКИ ====================

function addWorkout() {
    const type = document.getElementById('workout-type').value;
    const duration = parseInt(document.getElementById('workout-duration').value) || 0;
    const date = document.getElementById('workout-date').value;
    
    if (!date) {
        alert('Пожалуйста, выберите дату');
        return;
    }
    
    const workout = {
        id: Date.now(),
        type,
        duration,
        date,
        completed: false
    };
    
    appState.workouts.push(workout);
    document.getElementById('workout-duration').value = '';
    document.getElementById('workout-date').value = '';
    
    renderWorkouts();
    saveState();
}

function renderWorkouts() {
    const tbody = document.getElementById('workout-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Сортируем по дате (новые сверху)
    const sorted = [...appState.workouts].sort((a, b) => b.date.localeCompare(a.date));
    
    sorted.forEach(workout => {
        const tr = document.createElement('tr');
        const typeNames = {
            upper: 'Верх тела',
            lower: 'Низ тела',
            full: 'Полное тело',
            cardio: 'Кардио',
            yoga: 'Йога',
            pilates: 'Пилатес'
        };
        
        tr.innerHTML = `
            <td>${formatDate(workout.date)}</td>
            <td>${typeNames[workout.type] || workout.type}</td>
            <td>${workout.duration} мин</td>
            <td>
                <input type="checkbox" ${workout.completed ? 'checked' : ''} 
                       onchange="toggleWorkout(${workout.id})">
            </td>
            <td>
                <button class="btn-delete" onclick="deleteWorkout(${workout.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleWorkout(id) {
    const workout = appState.workouts.find(w => w.id === id);
    if (workout) {
        workout.completed = !workout.completed;
        renderWorkouts();
        saveState();
    }
}

function deleteWorkout(id) {
    appState.workouts = appState.workouts.filter(w => w.id !== id);
    renderWorkouts();
    saveState();
}

function renderWorkoutFocus() {
    if (!appState.workoutFocus) return;
    
    Object.keys(appState.workoutFocus).forEach(focus => {
        const check = document.getElementById(`focus-${focus}`);
        if (check) {
            check.checked = appState.workoutFocus[focus];
        }
    });
}

// ==================== ВОДА ====================

function initializeWaterTable() {
    const tbody = document.getElementById('water-tbody');
    if (!tbody) return;
    
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    
    tbody.innerHTML = '';
    
    days.forEach((day, dayIndex) => {
        const tr = document.createElement('tr');
        const dayKey = dayKeys[dayIndex];
        
        let cells = `<td><strong>${day}</strong></td>`;
        for (let i = 0; i < 8; i++) {
            cells += `<td>
                <div class="water-cell" data-day="${dayKey}" data-glass="${i}" onclick="toggleWater('${dayKey}', ${i})"></div>
            </td>`;
        }
        
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    });
    
    renderWater();
}

function toggleWater(day, glass) {
    if (!appState.water[day]) {
        appState.water[day] = [];
    }
    
    const index = appState.water[day].indexOf(glass);
    if (index > -1) {
        appState.water[day].splice(index, 1);
    } else {
        appState.water[day].push(glass);
    }
    
    renderWater();
    saveState();
}

function renderWater() {
    if (!appState.water) return;
    
    Object.keys(appState.water).forEach(day => {
        appState.water[day].forEach(glass => {
            const cell = document.querySelector(`.water-cell[data-day="${day}"][data-glass="${glass}"]`);
            if (cell) {
                cell.classList.add('filled');
            }
        });
    });
    
    // Подсчитываем прогресс
    let totalGlasses = 0;
    const maxGlasses = 7 * 8; // 7 дней × 8 стаканов
    
    Object.keys(appState.water).forEach(day => {
        totalGlasses += appState.water[day].length;
    });
    
    const progress = Math.round((totalGlasses / maxGlasses) * 100);
    const progressBar = document.getElementById('water-progress-bar');
    const progressText = document.getElementById('water-progress-text');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = progress + '%';
    }
}

function resetWaterTracker() {
    if (confirm('Вы уверены, что хотите сбросить трекер воды?')) {
        appState.water = {};
        initializeWaterTable();
        saveState();
    }
}

// ==================== РАСХОДЫ ====================

function addExpense() {
    const date = document.getElementById('expense-date').value;
    const item = document.getElementById('expense-item').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
    const category = document.getElementById('expense-category').value;
    
    if (!date || !item || amount <= 0) {
        alert('Пожалуйста, заполните все поля корректно');
        return;
    }
    
    const expense = {
        id: Date.now(),
        date,
        item,
        amount,
        category
    };
    
    appState.expenses.push(expense);
    document.getElementById('expense-date').value = '';
    document.getElementById('expense-item').value = '';
    document.getElementById('expense-amount').value = '';
    
    renderExpenses();
    saveState();
}

function renderExpenses() {
    const tbody = document.getElementById('expenses-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let total = 0;
    const categoryNames = {
        utilities: 'Коммунальные',
        groceries: 'Продукты',
        transport: 'Транспорт',
        health: 'Здоровье',
        entertainment: 'Развлечения',
        clothing: 'Одежда',
        other: 'Другое'
    };
    
    // Сортируем по дате (новые сверху)
    const sorted = [...appState.expenses].sort((a, b) => b.date.localeCompare(a.date));
    
    sorted.forEach(expense => {
        const tr = document.createElement('tr');
        total += expense.amount;
        
        tr.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.item}</td>
            <td>${categoryNames[expense.category] || expense.category}</td>
            <td>${expense.amount.toFixed(2)} ₽</td>
            <td>
                <button class="btn-delete" onclick="deleteExpense(${expense.id})">Удалить</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    const totalElement = document.getElementById('expenses-total-amount');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

function deleteExpense(id) {
    appState.expenses = appState.expenses.filter(e => e.id !== id);
    renderExpenses();
    saveState();
}

// ==================== WISHLIST ====================

function addWishlistItem() {
    const item = document.getElementById('wishlist-item').value.trim();
    const price = parseFloat(document.getElementById('wishlist-price').value) || 0;
    const priority = document.getElementById('wishlist-priority').value;
    
    if (!item) {
        alert('Пожалуйста, введите название');
        return;
    }
    
    const wishlistItem = {
        id: Date.now(),
        item,
        price,
        priority,
        purchased: false
    };
    
    appState.wishlist.push(wishlistItem);
    document.getElementById('wishlist-item').value = '';
    document.getElementById('wishlist-price').value = '';
    
    renderWishlist();
    saveState();
}

function renderWishlist() {
    const list = document.getElementById('wishlist-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    appState.wishlist.forEach(wishItem => {
        const li = document.createElement('li');
        const levelNames = {
            high: 'Высокий',
            medium: 'Средний',
            low: 'Низкий'
        };
        
        li.innerHTML = `
            <div class="wishlist-item-info">
                <input type="checkbox" ${wishItem.purchased ? 'checked' : ''} 
                       onchange="toggleWishlistItem(${wishItem.id})">
                <strong>${wishItem.item}</strong>
                ${wishItem.price > 0 ? `<br>${wishItem.price.toFixed(2)} ₽` : ''}
                <br><small>Приоритет: ${levelNames[wishItem.priority]}</small>
            </div>
            <button class="btn-delete" onclick="deleteWishlistItem(${wishItem.id})">Удалить</button>
        `;
        
        if (wishItem.purchased) {
            li.style.opacity = '0.6';
            li.style.textDecoration = 'line-through';
        }
        
        list.appendChild(li);
    });
}

function toggleWishlistItem(id) {
    const item = appState.wishlist.find(w => w.id === id);
    if (item) {
        item.purchased = !item.purchased;
        renderWishlist();
        saveState();
    }
}

function deleteWishlistItem(id) {
    appState.wishlist = appState.wishlist.filter(w => w.id !== id);
    renderWishlist();
    saveState();
}

// ==================== ПОЕЗДКИ ====================

function addTrip() {
    const city = document.getElementById('trip-city').value.trim();
    const dateStart = document.getElementById('trip-date-start').value;
    const dateEnd = document.getElementById('trip-date-end').value;
    const notes = document.getElementById('trip-notes').value.trim();
    
    if (!city || !dateStart) {
        alert('Пожалуйста, заполните город и дату начала');
        return;
    }
    
    const trip = {
        id: Date.now(),
        city,
        dateStart,
        dateEnd: dateEnd || null,
        notes
    };
    
    appState.trips.push(trip);
    document.getElementById('trip-city').value = '';
    document.getElementById('trip-date-start').value = '';
    document.getElementById('trip-date-end').value = '';
    document.getElementById('trip-notes').value = '';
    
    renderTrips();
    saveState();
}

function renderTrips() {
    const list = document.getElementById('trips-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    // Сортируем по дате начала
    const sorted = [...appState.trips].sort((a, b) => a.dateStart.localeCompare(b.dateStart));
    
    sorted.forEach(trip => {
        const card = document.createElement('div');
        card.className = 'trip-card';
        
        let dateText = formatDate(trip.dateStart);
        if (trip.dateEnd) {
            dateText += ` - ${formatDate(trip.dateEnd)}`;
        }
        
        card.innerHTML = `
            <h4>${trip.city}</h4>
            <p><strong>Даты:</strong> ${dateText}</p>
            ${trip.notes ? `<p>${trip.notes}</p>` : ''}
            <button class="btn-delete" onclick="deleteTrip(${trip.id})" style="margin-top: 0.5rem;">Удалить</button>
        `;
        list.appendChild(card);
    });
}

function deleteTrip(id) {
    appState.trips = appState.trips.filter(t => t.id !== id);
    renderTrips();
    saveState();
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Делаем функции доступными глобально для обработчиков в HTML
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.deletePriority = deletePriority;
window.deleteAffirmation = deleteAffirmation;
window.toggleWorkout = toggleWorkout;
window.deleteWorkout = deleteWorkout;
window.toggleWater = toggleWater;
window.deleteExpense = deleteExpense;
window.toggleWishlistItem = toggleWishlistItem;
window.deleteWishlistItem = deleteWishlistItem;
window.deleteTrip = deleteTrip;


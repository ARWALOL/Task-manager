document.addEventListener('DOMContentLoaded', function () {
    loadTasks();
    updateProductivityStats();
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
    checkDeadlines();
});

document.getElementById('addTaskForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userEmail = document.getElementById('userEmail').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const date = document.getElementById('taskDeadline').value;
    const time = document.getElementById('taskTime').value;
    const priority = document.getElementById('taskPriority').value;

    // دمج التاريخ والوقت في كائن Date
    const deadline = new Date(`${date}T${time}`);

    const task = {
        id: Date.now(),
        userEmail,
        title,
        description,
        deadline: deadline.toISOString(), // حفظ التاريخ والوقت بتنسيق ISO
        priority,
        completed: false
    };

    saveTask(task);
    addTaskToDOM(task);
    updateProductivityStats();
    document.getElementById('addTaskForm').reset();
});

function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTaskToDOM(task) {
    const taskList = document.getElementById('tasks');
    const li = document.createElement('li');
    const deadlineDate = new Date(task.deadline);
    const formattedDeadline = deadlineDate.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    li.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><strong>الموعد النهائي:</strong> ${formattedDeadline}</p>
        <p><strong>الأولوية:</strong> ${task.priority}</p>
        <button onclick="completeTask(${task.id})">تم الإنجاز</button>
        <button onclick="deleteTask(${task.id})">حذف</button>
    `;
    taskList.appendChild(li);
}

function completeTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            task.completed = true;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    updateProductivityStats();
}

function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    updateProductivityStats();
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks(tasks);
}

function filterTasks(priority) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const filteredTasks = priority === 'all' ? tasks : tasks.filter(task => task.priority === priority);
    renderTasks(filteredTasks);
}

function sortTasksByPriority() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    renderTasks(tasks);
}

function renderTasks(tasks) {
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    tasks.forEach(task => addTaskToDOM(task));
}

function updateProductivityStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;
    const completionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(2) : 0;

    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('pending-tasks').textContent = pendingTasks;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
}

function sendEmailReminder(task) {
    const templateParams = {
        to_email: task.userEmail,
        task_title: task.title,
        task_deadline: new Date(task.deadline).toLocaleString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        task_priority: task.priority
    };

    emailjs.send('service_1nfla2i', 'template_qedncy6', templateParams)
        .then(response => {
            console.log('تم إرسال البريد الإلكتروني بنجاح!', response);
        }, error => {
            console.error('فشل إرسال البريد الإلكتروني:', error);
        });
}

function checkDeadlines() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const now = new Date();

    tasks.forEach(task => {
        const deadline = new Date(task.deadline);
        const timeDiff = deadline - now;

        if (timeDiff > 0 && timeDiff <= 4 * 60 * 60 * 1000) {
            sendEmailReminder(task);
        }
    });
}

// تفعيل التحقق من المواعيد كل ساعة
setInterval(checkDeadlines, 60 * 60 * 1000);



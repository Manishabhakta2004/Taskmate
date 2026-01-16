const API_BASE = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", () => loadTasks("all"));

// Load tasks from API and create cards
function loadTasks(status) {
    const url = status === "all"
        ? `${API_BASE}/tasks`
        : `${API_BASE}/tasks?status=${status}`;

    fetch(url)
        .then(res => res.json())
        .then(tasks => {
            const container = document.getElementById("taskContainer");
            container.innerHTML = "";

            tasks.forEach(task => {
                const card = document.createElement("div");
                card.className = "task-card";
                if (task.completed) card.classList.add("completed");

                // Task title
                const span = document.createElement("span");
                span.textContent = task.title;
                span.contentEditable = false;

                // Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.style.background = "#f39c12"; // orange
                editBtn.style.color = "white";
                editBtn.style.borderRadius = "5px";
                editBtn.style.padding = "5px 10px";
                editBtn.style.cursor = "pointer";
                editBtn.onclick = () => {
                    span.contentEditable = true;
                    span.focus();
                };

                // Done/Revert button
                const doneBtn = document.createElement("button");
                doneBtn.textContent = task.completed ? "Revert" : "Done";
                doneBtn.style.background = task.completed ? "#e67e22" : "#27ae60"; // green for Done, orange for Revert
                doneBtn.style.color = "white";
                doneBtn.style.borderRadius = "5px";
                doneBtn.style.padding = "5px 10px";
                doneBtn.style.cursor = "pointer";
                doneBtn.style.marginLeft = "10px"; // gap between buttons
                doneBtn.onclick = () => {
                    toggleTask(task.id, !task.completed, task.title);
                };

                // Delete button
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.style.background = "#ff4b5c";
                deleteBtn.style.color = "white";
                deleteBtn.style.borderRadius = "5px";
                deleteBtn.style.padding = "5px 10px";
                deleteBtn.style.cursor = "pointer";
                deleteBtn.style.marginLeft = "10px"; // gap
                deleteBtn.onclick = () => {
                    if (confirm("Are you sure you want to delete this task?")) {
                        deleteTask(task.id);
                    }
                };

                // Save changes on blur after editing
                span.onblur = () => {
                    span.contentEditable = false;
                    editTask(task.id, span.textContent, task.completed);
                };

                card.appendChild(span);
                card.appendChild(editBtn);
                card.appendChild(doneBtn);
                card.appendChild(deleteBtn);

                container.appendChild(card);
            });
        })
        .catch(err => console.error("Error loading tasks:", err));
}

// Add a new task
function addTask() {
    const input = document.getElementById("taskInput");
    if (!input.value.trim()) return;

    fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.value })
    })
    .then(() => {
        input.value = "";
        loadTasks("all");
    })
    .catch(err => console.error("Error adding task:", err));
}

// Edit task
function editTask(id, title, completed) {
    fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed })
    })
    .catch(err => console.error("Error editing task:", err));
}

// Toggle Done/Revert
function toggleTask(id, completed, title) {
    fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed })
    })
    .then(() => loadTasks("all"))
    .catch(err => console.error("Error toggling task:", err));
}

// Delete task
function deleteTask(id) {
    fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" })
        .then(() => loadTasks("all"))
        .catch(err => console.error("Error deleting task:", err));
}

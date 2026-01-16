from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, 
    template_folder=os.path.join(os.path.dirname(__file__), '../Frontend/template'),
    static_folder=os.path.join(os.path.dirname(__file__), '../Frontend/static'),
    static_url_path='/static'
)
CORS(app)  # Enable CORS for all routes

def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

# Get tasks (filter by status)
@app.route('/tasks', methods=['GET'])
def get_tasks():
    status = request.args.get('status')  # all, pending, completed
    conn = get_db_connection()

    if status == "pending":
        tasks = conn.execute("SELECT * FROM tasks WHERE completed = 0").fetchall()
    elif status == "completed":
        tasks = conn.execute("SELECT * FROM tasks WHERE completed = 1").fetchall()
    else:
        tasks = conn.execute("SELECT * FROM tasks").fetchall()

    conn.close()
    return jsonify([dict(task) for task in tasks])

# Add task
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json(force=True)
    title = data.get('title')

    if not title:
        return jsonify({"error": "Title missing"}), 400

    conn = get_db_connection()
    conn.execute(
        "INSERT INTO tasks (title, completed) VALUES (?, 0)",
        (title,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Task added"})


# Update task
@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        "UPDATE tasks SET title=?, completed=? WHERE id=?",
        (data['title'], data['completed'], id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Task updated"})

# Delete task
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tasks WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Task deleted"})

if __name__ == "__main__":
    app.run(debug=True)

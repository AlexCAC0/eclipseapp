"""
Eclipse Studio APP - Backend Server (Python Built-in Standard Library)
No third-party dependencies required. Uses SQLite3 and http.server.
"""

import http.server
import socketserver
import json
import sqlite3
import os
import urllib.parse
from datetime import datetime

PORT = 8000
DB_FILE = os.path.join(os.path.dirname(__file__), "eclipse_studio.db")
STATIC_DIR = os.path.dirname(__file__)

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
    )
    """)
    
    # Create Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        assigned_to TEXT NOT NULL,
        priority TEXT DEFAULT 'Media',
        category TEXT DEFAULT 'General',
        status TEXT DEFAULT 'pending',
        due_date TEXT DEFAULT '',
        created_at TEXT NOT NULL,
        completed_at TEXT DEFAULT ''
    )
    """)
    
    # Check if moderator AlexCAC exists
    cursor.execute("SELECT id FROM users WHERE username = 'AlexCAC'")
    if not cursor.fetchone():
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO users (username, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)",
            ('AlexCAC', 'Campeondlsiglo0', 'Alex (Owner)', 'moderator', now)
        )
        print(" -> Moderador inicial 'AlexCAC' creado con éxito.")
        
    conn.commit()
    conn.close()

class EclipseRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _get_db(self):
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        return conn

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        if path == '/api/users':
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, name, role, created_at FROM users ORDER BY id ASC")
            users = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self._send_json({"status": "success", "users": users})
            return

        elif path == '/api/tasks':
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
            tasks = [dict(row) for row in cursor.fetchall()]
            conn.close()
            self._send_json({"status": "success", "tasks": tasks})
            return

        # Serve static files as default
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            body = json.loads(post_data)
        except json.JSONDecodeError:
            body = {}

        if path == '/api/login':
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, name, role FROM users WHERE username = ? AND password = ?", (username, password))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                self._send_json({
                    "status": "success",
                    "user": dict(user)
                })
            else:
                self._send_json({"status": "error", "message": "Usuario o contraseña incorrectos."}, status=401)
            return

        elif path == '/api/users':
            username = body.get('username', '').strip()
            password = body.get('password', '').strip()
            name = body.get('name', '').strip() or username
            role = body.get('role', 'user')
            
            if not username or not password:
                self._send_json({"status": "error", "message": "Usuario y contraseña requeridos."}, status=400)
                return

            conn = self._get_db()
            cursor = conn.cursor()
            try:
                now = datetime.now().isoformat()
                cursor.execute(
                    "INSERT INTO users (username, password, name, role, created_at) VALUES (?, ?, ?, ?, ?)",
                    (username, password, name, role, now)
                )
                user_id = cursor.lastrowid
                conn.commit()
                conn.close()
                self._send_json({"status": "success", "user": {"id": user_id, "username": username, "name": name, "role": role}})
            except sqlite3.IntegrityError:
                conn.close()
                self._send_json({"status": "error", "message": "El nombre de usuario ya existe."}, status=400)
            return

        elif path == '/api/tasks':
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            assigned_to = body.get('assigned_to', '').strip()
            priority = body.get('priority', 'Media')
            category = body.get('category', 'General')
            due_date = body.get('due_date', '')
            
            if not title or not assigned_to:
                self._send_json({"status": "error", "message": "Título y usuario asignado son obligatorios."}, status=400)
                return

            now = datetime.now().isoformat()
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO tasks (title, description, assigned_to, priority, category, status, due_date, created_at, completed_at)
                   VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, '')""",
                (title, description, assigned_to, priority, category, due_date, now)
            )
            task_id = cursor.lastrowid
            conn.commit()
            
            cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            task = dict(cursor.fetchone())
            conn.close()
            
            self._send_json({"status": "success", "task": task})
            return

        elif path == '/api/tasks/toggle':
            task_id = body.get('id')
            new_status = body.get('status') # 'pending' or 'completed'
            completed_at = datetime.now().isoformat() if new_status == 'completed' else ''
            
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?", (new_status, completed_at, task_id))
            conn.commit()
            conn.close()
            
            self._send_json({"status": "success", "id": task_id, "status_value": new_status})
            return

        elif path == '/api/users/delete':
            user_id = body.get('id')
            username = body.get('username')
            if username == 'AlexCAC':
                self._send_json({"status": "error", "message": "No se puede eliminar al moderador principal."}, status=400)
                return

            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM users WHERE id = ? AND username != 'AlexCAC'", (user_id,))
            conn.commit()
            conn.close()
            self._send_json({"status": "success"})
            return

        elif path == '/api/tasks/delete':
            task_id = body.get('id')
            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            conn.commit()
            conn.close()
            self._send_json({"status": "success"})
            return

        elif path == '/api/tasks/update':
            task_id = body.get('id')
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            assigned_to = body.get('assigned_to', '').strip()
            priority = body.get('priority', 'Media')
            category = body.get('category', 'General')
            due_date = body.get('due_date', '')
            status = body.get('status', 'pending')

            conn = self._get_db()
            cursor = conn.cursor()
            cursor.execute(
                """UPDATE tasks SET title = ?, description = ?, assigned_to = ?, priority = ?, category = ?, due_date = ?, status = ?
                   WHERE id = ?""",
                (title, description, assigned_to, priority, category, due_date, status, task_id)
            )
            conn.commit()
            conn.close()
            self._send_json({"status": "success"})
            return

        self._send_json({"status": "error", "message": "Endpoint no encontrado"}, status=404)

def run_server():
    init_db()
    with socketserver.TCPServer(("", PORT), EclipseRequestHandler) as httpd:
        print(f"==================================================")
        print(f"  ECLIPSE STUDIO APP - Servidor iniciado con éxito")
        print(f"  URL: http://localhost:{PORT}")
        print(f"  Usuario Mod: AlexCAC")
        print(f"  Presiona Ctrl+C para detener el servidor")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")

if __name__ == '__main__':
    run_server()

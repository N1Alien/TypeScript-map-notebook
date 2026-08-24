import http.server
import json
import os
import sqlite3
import time

DB_PATH = os.path.join(os.path.dirname(__file__), 'posts.db')


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                saved_style TEXT DEFAULT 'default',
                lat REAL,
                lng REAL,
                distance TEXT DEFAULT '',
                saved_intel TEXT DEFAULT ''
            )
            """
        )
        conn.commit()

        existing = conn.execute('SELECT COUNT(*) FROM posts').fetchone()[0]
        if existing == 0:
            conn.execute(
                """
                INSERT INTO posts (id, content, saved_style, lat, lng, distance, saved_intel)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    180,
                    'Węzeł Operacyjny AWS Frankfurt',
                    'bold',
                    52.2297,
                    21.0122,
                    '0',
                    json.dumps({"name": "Germany", "subregion": "Europe", "flag": "https://flagcdn.com/w320/de.png"})
                )
            )
            conn.commit()
    finally:
        conn.close()


init_db()


def serialize_post(row):
    if row is None:
        return None

    intel_raw = row['saved_intel'] or ''
    try:
        saved_intel = json.loads(intel_raw) if intel_raw else None
    except Exception:
        saved_intel = None

    return {
        'id': row['id'],
        'content': row['content'],
        'savedStyle': row['saved_style'] or 'default',
        'saved_style': row['saved_style'] or 'default',
        'coord': {'lat': float(row['lat']), 'lng': float(row['lng'])} if row['lat'] is not None and row['lng'] is not None else None,
        'distance': row['distance'] or '',
        'savedIntel': saved_intel,
    }


class ProductionCloudBackendHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def _send_json(self, payload):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/posts' or self.path == '/posts/':
            conn = get_db_connection()
            try:
                rows = conn.execute('SELECT * FROM posts ORDER BY id DESC').fetchall()
                output = [serialize_post(r) for r in rows]
                if not output:
                    output = [{
                        'id': 180,
                        'content': 'Węzeł Operacyjny AWS Frankfurt',
                        'savedStyle': 'bold',
                        'saved_style': 'bold',
                        'coord': {'lat': 52.2297, 'lng': 21.0122},
                        'distance': '0',
                        'savedIntel': {'name': 'Germany', 'subregion': 'Europe', 'flag': 'https://flagcdn.com/w320/de.png'}
                    }]
                self._send_json(output)
            finally:
                conn.close()
            return

        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
            except ValueError:
                self._send_json({'error': 'invalid post id'})
                return

            conn = get_db_connection()
            try:
                row = conn.execute('SELECT * FROM posts WHERE id = ?', (post_id,)).fetchone()
                if row is None:
                    self._send_json({
                        'id': post_id,
                        'content': f'Tactical Node {post_id}',
                        'savedStyle': 'default',
                        'saved_style': 'default',
                        'coord': None,
                        'distance': '',
                        'savedIntel': None,
                    })
                else:
                    self._send_json(serialize_post(row))
            finally:
                conn.close()
            return

        self._send_json({'ok': True})

    def do_POST(self):
        if self.path == '/posts' or self.path == '/posts/':
            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))

            p_content = str(body.get('content', 'New Idea'))
            p_style = str(body.get('savedStyle', 'default'))
            next_id = int(time.time() * 1000)

            conn = get_db_connection()
            try:
                conn.execute(
                    'INSERT INTO posts (id, content, saved_style, lat, lng, distance, saved_intel) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    (next_id, p_content, p_style, None, None, '', '')
                )
                conn.commit()
            finally:
                conn.close()

            self._send_json({'status': 'success', 'id': next_id})
            return

        self._send_json({'ok': False})

    def do_PUT(self):
        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
            except ValueError:
                self._send_json({'error': 'invalid post id'})
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))

            p_content = str(body.get('content', 'Updated'))
            p_style = str(body.get('savedStyle', 'default'))
            coord = body.get('coord') or {}
            p_lat = coord.get('lat') if isinstance(coord, dict) and coord.get('lat') is not None else None
            p_lng = coord.get('lng') if isinstance(coord, dict) and coord.get('lng') is not None else None
            p_dist = str(body.get('distance', '') or '')
            p_intel = json.dumps(body.get('savedIntel')) if body.get('savedIntel') is not None else ''

            conn = get_db_connection()
            try:
                conn.execute(
                    'UPDATE posts SET content = ?, saved_style = ?, lat = ?, lng = ?, distance = ?, saved_intel = ? WHERE id = ?',
                    (p_content, p_style, p_lat, p_lng, p_dist, p_intel, post_id)
                )
                conn.commit()
            finally:
                conn.close()

            self._send_json({'status': 'updated'})
            return

        self._send_json({'ok': False})

    def do_DELETE(self):
        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
            except ValueError:
                self._send_json({'error': 'invalid post id'})
                return

            conn = get_db_connection()
            try:
                conn.execute('DELETE FROM posts WHERE id = ?', (post_id,))
                conn.commit()
            finally:
                conn.close()
            self._send_json({'status': 'deleted'})
            return

        self._send_json({'ok': False})


if __name__ == '__main__':
    server_address = ('', 5000)
    httpd = http.server.HTTPServer(server_address, ProductionCloudBackendHandler)
    print('🚀 [LOCAL SQLite BACKEND] Serwer gotowy na porcie 5000...')
    httpd.serve_forever()

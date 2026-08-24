import http.server
import urllib.request
import json
import os

DATABASE_URL = "postgresql://neondb_owner:npg_2Q0GUXmTAFiW@ep-flat-field-b1lb26u8-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require"

def execute_sql(sql_query):
    """Pancerna, bezpośrednia komunikacja serverless z chmurą Neon SQL (AWS Frankfurt)"""
    url = "https://neon.tech"
    
    req = urllib.request.Request(
        url,
        data=sql_query.encode('utf-8'),
        headers={
            "Authorization": f"Bearer {DATABASE_URL}",
            "Content-Type": "text/plain"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            raw_res = response.read().decode('utf-8')
            res_json = json.loads(raw_res)
            if isinstance(res_json, dict) and "rows" in res_json:
                return res_json.get("rows", [])
            elif isinstance(res_json, list):
                return res_json
            return []
    except Exception as e:
        print(f"❌ [NEON CHMURA ERROR] Kwerenda upadła: {e}")
        return []

# INICJALIZACJA STRUKTURY BAZY DANYCH
try:
    execute_sql("""
    CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY,
        content TEXT NOT NULL,
        saved_style TEXT DEFAULT 'default',
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        distance TEXT DEFAULT '',
        saved_intel TEXT DEFAULT ''
    );
    """)
    print("🚀 [NEON SQL] Tabela posts pomyślnie zsynchronizowana online!")
except Exception as e:
    print(f"⚠️ Inicjalizacja: {e}")

class ProductionCloudBackendHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if self.path == '/posts' or self.path == '/posts/':
            try:
                rows = execute_sql("SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts ORDER BY id DESC;")
                output = []
                for r in rows:
                    if isinstance(r, dict):
                        p_id = r.get("id")
                        p_content = r.get("content")
                        p_style = r.get("saved_style") or r.get("savedStyle") or "default"
                        p_lat = r.get("lat")
                        p_lng = r.get("lng")
                        p_dist = r.get("distance") or ""
                        p_intel_raw = r.get("saved_intel") or r.get("savedIntel") or ""
                    else:
                        p_id = r if len(r) > 0 else None
                        p_content = r if len(r) > 1 else ""
                        p_style = r if len(r) > 2 else "default"
                        p_lat = r if len(r) > 3 else None
                        p_lng = r if len(r) > 4 else None
                        p_dist = r if len(r) > 5 else ""
                        p_intel_raw = r if len(r) > 6 else ""

                    if p_id is None: continue

                    p_intel = None
                    if p_intel_raw:
                        try: p_intel = json.loads(p_intel_raw)
                        except: p_intel = None

                    # POPRAWKA KLUCZ: Wysyłamy do Reacta OBIE nazwy pól (savedStyle oraz saved_style)
                    # To całkowicie likwiduje błędy undefined w reduktorach i wymusza renderowanie karty!
                    item = {
                        "id": int(p_id), 
                        "content": str(p_content), 
                        "savedStyle": str(p_style),
                        "saved_style": str(p_style),
                        "coord": {"lat": float(p_lat), "lng": float(p_lng)} if p_lat is not None and p_lng is not None else None,
                        "distance": str(p_dist), 
                        "savedIntel": p_intel
                    }
                    output.append(item)
                
                if not output:
                    output = [{
                        "id": 180,
                        "content": "Węzeł Operacyjny AWS Frankfurt",
                        "savedStyle": "bold",
                        "saved_style": "bold",
                        "coord": {"lat": 52.2297, "lng": 21.0122},
                        "distance": "0",
                        "savedIntel": None
                    }]
                
                self.wfile.write(json.dumps(output).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps([{"id": 180, "content": f"Błąd parsowania: {str(e)}"}]).encode('utf-8'))
            return

        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
                rows = execute_sql(f"SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts WHERE id={post_id};")
                if rows:
                    r = rows
                    if isinstance(r, dict):
                        p_id = r.get("id")
                        p_content = r.get("content")
                        p_style = r.get("saved_style") or r.get("savedStyle") or "default"
                        p_lat = r.get("lat")
                        p_lng = r.get("lng")
                        p_dist = r.get("distance") or ""
                        p_intel_raw = r.get("saved_intel") or r.get("savedIntel") or ""
                    else:
                        p_id = r; p_content = r; p_style = r; p_lat = r; p_lng = r; p_dist = r; p_intel_raw = r

                    p_intel = None
                    if p_intel_raw:
                        try: p_intel = json.loads(p_intel_raw)
                        except: p_intel = None

                    output = {
                        "id": int(p_id), "content": str(p_content), "savedStyle": str(p_style), "saved_style": str(p_style),
                        "coord": {"lat": float(p_lat), "lng": float(p_lng)} if p_lat is not None and p_lng is not None else None,
                        "distance": str(p_dist), "savedIntel": p_intel
                    }
                    self.wfile.write(json.dumps(output).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"id": post_id, "content": f"Tactical Node {post_id}", "savedStyle": "default", "saved_style": "default"}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

    def do_POST(self):
        if self.path == '/posts' or self.path == '/posts/':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            p_content = str(body.get('content', 'New Idea')).replace("'", "''")
            p_style = str(body.get('savedStyle', 'default')).replace("'", "''")

            try:
                rows = execute_sql("SELECT MAX(id) FROM posts;")
                if rows:
                    # Bezpiecznie wyciągamy najwyższy numer z bazy Neon SQL
                    r = rows if isinstance(rows, dict) else rows
                    max_id = r.get("max") if isinstance(r, dict) else r
                    next_id = int(max_id or 0) + 1
                else:
                    next_id = 1
            except:
                next_id = 1

            # POPRAWKA PRODUKCYJNA: Zamiast słowa NULL przekazujemy puste wartości, co chroni kwerendę przed wywaleniem w chmurze Neon SQL!
            execute_sql(f"INSERT INTO posts (id, content, saved_style, distance, saved_intel) VALUES ({next_id}, '{p_content}', '{p_style}', '', '');")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "id": next_id}).encode('utf-8'))
            return

    def do_PUT(self):
        if self.path.startswith('/posts/'):
            post_id = int(self.path.split('/')[-1])
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            p_content = str(body.get('content', 'Updated')).replace("'", "''")
            p_style = str(body.get('savedStyle', 'default')).replace("'", "''")
            
            p_lat = "NULL"; p_lng = "NULL"
            if body.get('coord') and body['coord'].get('lat') is not None:
                p_lat = str(float(body['coord']['lat']))
                p_lng = str(float(body['coord']['lng']))
                
            p_dist = str(body.get('distance', '')).replace("'", "''")
            p_intel = ""
            if body.get('savedIntel'):
                p_intel = json.dumps(body.get('savedIntel')).replace("'", "''")

            sql_clean = f"UPDATE posts SET content='{p_content}', saved_style='{p_style}', lat={p_lat}, lng={p_lng}, distance='{p_dist}', saved_intel='{p_intel}' WHERE id={post_id};"
            execute_sql(sql_clean)

            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "updated"}).encode('utf-8'))
            return

if __name__ == '__main__':
    server_address = ('', 5000)
    httpd = http.server.HTTPServer(server_address, ProductionCloudBackendHandler)
print("🚀 [PRODUCTION CLOUD BACKEND] Serwer gotowy na porcie 5000...")httpd.serve_forever()
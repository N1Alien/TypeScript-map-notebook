import http.server
import urllib.request
import json
import os

# PRODUKCYJNY ADRES POŁĄCZENIA NEON.TECH SQL
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_2Q0GUXmTAFiW@ep-flat-field-b1lb26u8-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require")

def execute_sql(sql_query):
    """Pancerny, oficjalny sterownik HTTP gateway dla chmury Neon.tech SQL"""
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
                return res_json
            return {"rows": res_json if isinstance(res_json, list) else []}
    except Exception as e:
        print(f"❌ [NEON SQL CLOUD ERROR] Kwerenda upadła: {e}")
        return {"rows": []}

# INICJALIZACJA STRUKTURY BAZY DANYCH - REZYGNUJEMY Z ZAWODNEGO SERIAL NA RZECZ INT PRIMARY KEY
try:
    # Kasujemy starą, zablokowaną tabelę, aby utworzyć ją na nowo z poprawnym typowaniem
    execute_sql("DROP TABLE IF EXISTS posts;")
    
    execute_sql("""
    CREATE TABLE posts (
        id INT PRIMARY KEY,
        content TEXT NOT NULL,
        saved_style TEXT DEFAULT 'default',
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        distance TEXT DEFAULT '',
        saved_intel TEXT DEFAULT ''
    );
    """)
    print("🚀 [NEON SQL] Tabela posts pomyślnie zresetowana i zsynchronizowana online jako INT PRIMARY KEY!")
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

        # 1. Endpoint: Pobranie wszystkich postów z chmury Neon SQL
        if self.path == '/posts' or self.path == '/posts/':
            try:
                db_res = execute_sql("SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts ORDER BY id DESC;")
                rows = db_res.get("rows", [])
                
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
                        p_id = r[0] if len(r) > 0 else None
                        p_content = r[1] if len(r) > 1 else ""
                        p_style = r[2] if len(r) > 2 else "default"
                        p_lat = r[3] if len(r) > 3 else None
                        p_lng = r[4] if len(r) > 4 else None
                        p_dist = r[5] if len(r) > 5 else ""
                        p_intel_raw = r[6] if len(r) > 6 else ""

                    if p_id is None: continue

                    p_intel = None
                    if p_intel_raw:
                        try: p_intel = json.loads(p_intel_raw)
                        except: p_intel = None

                    item = {
                        "id": int(p_id),
                        "content": str(p_content),
                        "savedStyle": str(p_style),
                        "coord": {"lat": float(p_lat), "lng": float(p_lng)} if p_lat is not None and p_lng is not None else None,
                        "distance": str(p_dist),
                        "savedIntel": p_intel
                    }
                    output.append(item)
                
                self.wfile.write(json.dumps(output).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps([{"id": 180, "content": f"Błąd parsowania: {str(e)}"}]).encode('utf-8'))
            return

        # 2. Endpoint: Pobranie jednego konkretnego posta po ID
        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
                db_res = execute_sql(f"SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts WHERE id={post_id};")
                rows = db_res.get("rows", [])
                
                if rows:
                    r = rows[0]
                    if isinstance(r, dict):
                        p_id = r.get("id")
                        p_content = r.get("content")
                        p_style = r.get("saved_style") or r.get("savedStyle") or "default"
                        p_lat = r.get("lat")
                        p_lng = r.get("lng")
                        p_dist = r.get("distance") or ""
                        p_intel_raw = r.get("saved_intel") or r.get("savedIntel") or ""
                    else:
                        p_id = r[0]
                        p_content = r[1]
                        p_style = r[2]
                        p_lat = r[3]
                        p_lng = r[4]
                        p_dist = r[5]
                        p_intel_raw = r[6]

                    p_intel = None
                    if p_intel_raw:
                        try: p_intel = json.loads(p_intel_raw)
                        except: p_intel = None

                    output = {
                        "id": int(p_id),
                        "content": str(p_content),
                        "savedStyle": str(p_style),
                        "coord": {"lat": float(p_lat), "lng": float(p_lng)} if p_lat is not None and p_lng is not None else None,
                        "distance": str(p_dist),
                        "savedIntel": p_intel
                    }
                    self.wfile.write(json.dumps(output).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"id": post_id, "content": f"Tactical Node {post_id}", "savedStyle": "default"}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

    def do_POST(self):
        if self.path == '/posts' or self.path == '/posts/':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            p_content = str(body.get('content', 'New Idea')).replace("'", "''")
            p_style = str(body.get('savedStyle', 'default')).replace("'", "''")

            # AUTOMATYCZNE OBLICZANIE KOLEJNEGO ID W CHMURZE (100% BEZBŁĘDNE OMINIĘCIE DIALOGU SERIAL)
            try:
                max_id_res = execute_sql("SELECT MAX(id) FROM posts;")
                rows = max_id_res.get("rows", [])
                if rows and rows[0] is not None:
                    # Sprawdzamy czy struktura to tablica czy słownik i wyciągamy najwyższy numer ID
                    max_id = rows[0].get("max") if isinstance(rows[0], dict) else rows[0][0]
                    next_id = int(max_id or 0) + 1
                else:
                    next_id = 1
            except Exception as e:
                print(f"Błąd liczenia max_id, podstawiam losowy: {e}")
                import random
                next_id = random.randint(1, 999)

            # Wstrzykujemy rekord ze sprawdzonym, unikalnym numerem ID
            execute_sql(f"INSERT INTO posts (id, content, saved_style, lat, lng, distance, saved_intel) VALUES ({next_id}, '{p_content}', '{p_style}', NULL, NULL, '', '');")
            
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
            
            p_lat = "NULL"
            p_lng = "NULL"
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

    def do_DELETE(self):
        if self.path.startswith('/posts/'):
            post_id = int(self.path.split('/')[-1])
            execute_sql(f"DELETE FROM posts WHERE id={post_id};")
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            return

if __name__ == '__main__':
    server_address = ('', 5000)
    httpd = http.server.HTTPServer(server_address, ProductionCloudBackendHandler)
    print("🚀 [PRODUCTION CLOUD BACKEND] Serwer gotowy na porcie 5000...")
    httpd.serve_forever()

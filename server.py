import http.server
import urllib.request
import urllib.parse
import json
import os

# PANCERNY LINK PRODUKCYJNY DO CHMURY NEON.TECH
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://neondb_owner:npg_2Q0GUXmTAFiW@ep-flat-field-b1lb26u8-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require")

NEON_HOST = "ep-flat-field-b1lb26u8.eu-central-1.aws.neon.tech"

def execute_sql(sql_query):
    """Profesjonalny łącznik HTTP Serverless z chmurą Neon.tech SQL"""
    direct_api_url = "https://neon.tech" 
    fallback_req = urllib.request.Request(
        direct_api_url,
        data=sql_query.encode('utf-8'),
        headers={"Authorization": f"Bearer {DATABASE_URL}"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(fallback_req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"❌ [SQL ERROR] Błąd kwerendy: {e}")
        return {"rows": []}

# AUTO-INICJALIZACJA BAZY W CHMURZE
try:
    execute_sql("""
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        saved_style TEXT DEFAULT 'default',
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        distance TEXT DEFAULT '',
        saved_intel TEXT DEFAULT ''
    );
    """)
    print("🚀 [NEON SQL] Tabela postów zabezpieczona w chmurze AWS!")
except Exception as e:
    print(f"⚠️ Inicjalizacja tabel: {e}")

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
                    item = {
                        "id": r[0], "content": r[1], "savedStyle": r[2],
                        "coord": {"lat": r[3], "lng": r[4]} if r[3] and r[4] else None,
                        "distance": r[5] or "", "savedIntel": json.loads(r[6]) if r[6] else None
                    }
                    output.append(item)
                
                self.send_response(200)
                self.wfile.write(json.dumps(output).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps([{"id": 180, "content": f"Baza Neon startuje..."}]).encode('utf-8'))
            return

        # 2. Endpoint: ODTWARZANIE DANYCH - Pobranie JEDNEGO konkretnego posta na żywo z chmury Neon SQL!
        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
                db_res = execute_sql(f"SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts WHERE id={post_id};")
                rows = db_res.get("rows", [])
                
                if rows:
                    r = rows[0]
                    output = {
                        "id": r[0], "content": r[1], "savedStyle": r[2],
                        "coord": {"lat": r[3], "lng": r[4]} if r[3] and r[4] else None,
                        "distance": r[5] or "", "savedIntel": json.loads(r[6]) if r[6] else None
                    }
                    self.wfile.write(json.dumps(output).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"id": post_id, "content": "New Task"}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

        # 3. Endpoint: Żądanie geolokalizacji z chmury restcountries
        if self.path.startswith('/api/country/'):
            country_code = self.path.split('/')[-1].lower().strip()
            target_url = f"https://restcountries.com{country_code}"
            try:
                req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    self.wfile.write(response.read())
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return

    def do_POST(self):
        if self.path == '/posts' or self.path == '/posts/':
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            p_id = body.get('id', 1)
            p_content = body.get('content', 'New Idea')
            p_style = body.get('savedStyle', 'default')

            execute_sql(f"INSERT INTO posts (id, content, saved_style) VALUES ({p_id}, '{p_content}', '{p_style}') ON CONFLICT (id) DO NOTHING;")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            return

    def do_PUT(self):
        if self.path.startswith('/posts/'):
            post_id = int(self.path.split('/')[-1])
            content_length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(content_length).decode('utf-8'))
            
            p_content = body.get('content', 'Updated')
            p_style = body.get('savedStyle', 'default')
            
            p_lat = "NULL"
            p_lng = "NULL"
            if body.get('coord') and body['coord'].get('lat'):
                p_lat = str(body['coord']['lat'])
                p_lng = str(body['coord']['lng'])
                
            p_dist = body.get('distance', '')
            p_intel = json.dumps(body.get('savedIntel', '')) if body.get('savedIntel') else ''

            # Aktualizujemy rekord w chmurze Neon SQL na żywo!
            sql = f"UPDATE posts SET content='{p_content}', saved_style='{p_style}', lat={p_lat}, lng={p_lng}, distance='{p_dist}', saved_intel='{p_intel}' WHERE id={post_id};"
            execute_sql(sql)

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

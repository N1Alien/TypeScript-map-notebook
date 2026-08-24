import http.server
import urllib.request
import urllib.error
import json
import os

DATABASE_URL = "postgresql://neondb_owner:npg_2Q0GUXmTAFiW@ep-flat-field-b1lb26u8-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require"

DEBUG_LOGS = []

def log_debug(msg):
    print(f"🕵️‍♂️ [DEBUG] {msg}")
    DEBUG_LOGS.append(msg)

def execute_sql(sql_query):
    """Pancerna bramka wykonawcza HTTP Neon SQL z poprawnym, pełnym adresem instancji AWS"""
    
    # POPRAWKA OSTATECZNA: Zamiast ślepego neon.tech wklejamy pełny, autoryzowany endpoint HTTP dla Twojego regionu!
    # Ta linijka jest odporna na skracanie i uderza bezpośrednio w serwer SQL Twojego projektu!
    url = "https://neon.tech"
    
    log_debug(f"Inicjalizacja kwerendy: {sql_query.strip()}")
    log_debug(f"Adres docelowy: {url}")
    
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
            log_debug(f"Pomyślna odpowiedź z bramki chmurowej: {raw_res[:200]}")
            res_json = json.loads(raw_res)
            
            if isinstance(res_json, dict) and "rows" in res_json:
                return {"success": True, "rows": res_json.get("rows", []), "raw": res_json}
            elif isinstance(res_json, list):
                return {"success": True, "rows": res_json, "raw": res_json}
            return {"success": True, "rows": [], "raw": res_json}
            
    except urllib.error.HTTPError as http_err:
        err_body = http_err.read().decode('utf-8')
        err_msg = f"HTTP Error {http_err.code}: {http_err.reason} -> Body: {err_body}"
        log_debug(f"❌ KRACH BRAMKI NEON: {err_msg}")
        return {"success": False, "error": err_msg, "rows": []}
    except Exception as e:
        log_debug(f"❌ SYSTEM EXCEPTION: {str(e)}")
        return {"success": False, "error": str(e), "rows": []}


# AUTO-INICJALIZACJA BAZY W CHMURZE AWS
init_res = execute_sql("SELECT 1;")
log_debug(f"Wynik testu startowego bazy: {json.dumps(init_res)}")

class ProductionCloudBackendHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        global DEBUG_LOGS
        
        # SZYBKI ENDPOINT PODGLĄDU LOGÓW DIAGNOSTYCZNYCH DLA CIEBIE
        if self.path == '/debug' or self.path == '/debug/':
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "DATABASE_URL_DETECTED": DATABASE_URL[:30] + "...",
                "TOTAL_LOGS": len(DEBUG_LOGS),
                "HISTORY": DEBUG_LOGS
            }, indent=2).encode('utf-8'))
            return

        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        if self.path == '/posts' or self.path == '/posts/':
            log_debug("📥 ŻĄDANIE GET /posts - Rozpoczynam odczyt z chmury...")
            try:
                db_res = execute_sql("SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts ORDER BY id DESC;")
                
                # Jeśli bramka HTTP zgłosiła błąd, przesyłamy go na ekran zamiast pustego []!
                if not db_res.get("success", False):
                    error_payload = {
                        "DIAGNOSTIC_ALERT": "Baza danych odrzuciła połączenie!",
                        "NEON_ERROR_MESSAGE": db_res.get("error", "Unknown serverless error")
                    }
                    self.wfile.write(json.dumps(error_payload).encode('utf-8'))
                    return

                rows = db_res.get("rows", [])
                log_debug(f"Pobrana liczba wierszy z tabeli: {len(rows)}")
                
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

                    item = {
                        "id": int(p_id),
                        "content": str(p_content),
                        "savedStyle": str(p_style),
                        "coord": {"lat": float(p_lat), "lng": float(p_lng)} if p_lat is not None and p_lng is not None else None,
                        "distance": str(p_dist),
                        "savedIntel": p_intel
                    }
                    output.append(item)
                
                # Zwracamy pełne wiersze lub surową odpowiedź diagnostyczną, jeśli tablica była pusta
                if not output:
                    self.wfile.write(json.dumps({
                        "INFO": "Tabela istnieje, ale fizycznie nie ma w niej wierszy.",
                        "RAW_NEON_RESPONSE": db_res.get("raw")
                    }).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps(output).encode('utf-8'))
            except Exception as e:
                log_debug(f"Crash w sekcji GET: {str(e)}")
                self.wfile.write(json.dumps({"CRASH_GET_EXCEPTION": str(e)}).encode('utf-8'))
            return

        if self.path.startswith('/posts/'):
            try:
                post_id = int(self.path.split('/')[-1])
                db_res = execute_sql(f"SELECT id, content, saved_style, lat, lng, distance, saved_intel FROM posts WHERE id={post_id};")
                rows = db_res.get("rows", [])
                
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
                        p_id = r
                        p_content = r
                        p_style = r
                        p_lat = r
                        p_lng = r
                        p_dist = r
                        p_intel_raw = r

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

            try:
                db_res = execute_sql("SELECT MAX(id) FROM posts;")
                rows = db_res.get("rows", [])
                if rows:
                    r = rows
                    max_id = r.get("max") if isinstance(r, dict) else r
                    next_id = int(max_id or 0) + 1
                else:
                    next_id = 1
            except:
                next_id = 1

            insert_res = execute_sql(f"INSERT INTO posts (id, content, saved_style, lat, lng, distance, saved_intel) VALUES ({next_id}, '{p_content}', '{p_style}', NULL, NULL, '', '');")
            
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "id": next_id, "db_response": insert_res}).encode('utf-8'))
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
            update_res = execute_sql(sql_clean)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "updated", "db_response": update_res}).encode('utf-8'))
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
    print("🚀 [PRODUCTION CLOUD BACKEND] Serwer debugowania gotowy...")
    httpd.serve_forever()
import http.server
import urllib.request
import json

class CountryProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/country/'):
            country_code = self.path.split('/')[-1].lower().strip()
            
            # POPRAWKA ENDPOINTU: Używamy oficjalnej ścieżki filtrującej codes=
            target_url = f"https://restcountries.com{country_code}"
            
            try:
                req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    raw_data = response.read().decode('utf-8')
                    json_data = json.loads(raw_data)
                    
                    # API restcountries zwraca tablicę jednoelementową. 
                    # Wyciągamy pierwszy obiekt, aby React dostał płaski słownik!
                    if isinstance(json_data, list) and len(json_data) > 0:
                        country_obj = json_data[0]
                    else:
                        country_obj = json_data
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(country_obj).encode('utf-8'))
                    return
            except Exception as e:
                print(f"❌ [PYTHON ERROR] Wyjątek sieciowy dla kodu {country_code}: {str(e)}")
                self.send_response(404)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                return
                
        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    server_address = ('', 5000)
    http = http.server.HTTPServer(server_address, CountryProxyHandler)
    print("🚀 [PYTHON BACKEND] Mikroserwis geopolityczny działa na http://localhost:5000")
    http.serve_forever()

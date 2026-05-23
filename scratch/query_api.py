import urllib.request
import json

# Try to call the /api/employees endpoint to find Vellore Ashok
# First check if there's a running server or check the backend directly

# Try common local ports
ports = [5000, 8000, 8080, 3000, 5001]

for port in ports:
    try:
        url = f"http://localhost:{port}/api/employees"
        req = urllib.request.Request(url, headers={"ngrok-skip-browser-warning": "true"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
            print(f"SUCCESS on port {port}!")
            print(json.dumps(data, indent=2)[:3000])
            break
    except Exception as e:
        print(f"Port {port}: {e}")

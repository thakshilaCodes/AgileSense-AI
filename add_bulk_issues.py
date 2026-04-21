import urllib.request
import json
import random

API_BASE = "http://localhost:8000"

# List of awesome developers from your database for variety
dev_list = [
    {"email": "alex@gmail.com", "name": "Expert Alex"},
    {"email": "sarah@gmail.com", "name": "Ready Sarah"},
    {"email": "elena@gmail.com", "name": "Busy Elena"},
    {"email": "william@tech.com", "name": "William"},
    {"email": "alice@example.com", "name": "Alice Perera"},
    {"email": "bob@example.com", "name": "Bob Smith"},
    {"email": "natty@gmail.com", "name": "Project Manager Natty"}
]

# Random sample data for your system to categorize
sample_issues = [
    {"title": "Upgrade Webpack Config", "desc": "We need to optimize the web bundling pipeline for faster site load speeds."},
    {"title": "Docker Setup Crash", "desc": "The container fails to start when configuring the environment variables."},
    {"title": "Missing JWT Token", "desc": "Users are randomly being logged out because the browser loses the cookie token."},
    {"title": "Slow SQL Query", "desc": "The left outer join on the users table is causing timeouts in production."},
    {"title": "Redesign Settings Panel", "desc": "The settings UI looks outdated and is not responsive on mobile screens."},
    {"title": "API Documentation Outdated", "desc": "The Swagger UI is missing the new authentication endpoints."},
    {"title": "Refactor React Context", "desc": "State management is getting messy, we should implement Zustand or Redux."},
    {"title": "Implement WebSockets", "desc": "We need real-time chat updates on the notification banner."}
]

def make_post_request(url, payload, headers=None):
    if headers is None: headers = {}
    headers['Content-Type'] = 'application/json'
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.read(), response.code
    except urllib.error.HTTPError as e:
        return e.read(), e.code
    except Exception as e:
        return str(e).encode('utf-8'), 500

def add_bulk_issues():
    print("Logging in to authorize new issues...")
    
    # Login
    resp_data, resp_code = make_post_request(
        f"{API_BASE}/api/auth/login", 
        {"email": "alex@gmail.com", "password": "password"}
    )
    
    if resp_code != 200:
        print("Login failed:", resp_data.decode('utf-8'))
        return
        
    token = json.loads(resp_data.decode('utf-8'))["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Generating 8 new intelligent tickets...")
    for idx, sample in enumerate(sample_issues):
        submitter = random.choice(dev_list)
        
        issue_data = {
            "title": sample["title"],
            "description": sample["desc"],
            "submittedBy": submitter["email"],
            "submittedByName": submitter["name"],
            "priority": random.choice(["low", "medium", "high", "critical"])
        }
        
        resp_data, resp_code = make_post_request(
            f"{API_BASE}/api/expertise/issues", 
            issue_data, 
            headers
        )
        
        if resp_code == 200:
            print(f"[{idx+1}/8] SUCCESS: Issue '{sample['title']}' created reliably (Submitter: {submitter['name']})")
        else:
            print(f"FAILED to add '{sample['title']}'. Error: {resp_data.decode('utf-8')}")

if __name__ == "__main__":
    add_bulk_issues()

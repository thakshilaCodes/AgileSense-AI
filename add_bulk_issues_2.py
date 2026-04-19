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
    {"title": "Implement OAuth2 with Google", "desc": "We need to allow users to sign in using their Google accounts to streamline onboarding."},
    {"title": "Memory Leak in Node Service", "desc": "The memory consumption of the rendering microservice spikes and crashes the pod every 4 hours."},
    {"title": "Migrate to PostgreSQL 16", "desc": "Our database instances are running an outdated version. We must upgrade for performance and security."},
    {"title": "Fix Dark Mode Flicker", "desc": "When the page loads, the screen flickers white before applying the dark mode CSS variables."},
    {"title": "Update PCI Compliance Docs", "desc": "The payment gateway documentation needs a thorough review for the upcoming PCI compliance audit."},
    {"title": "Optimize CloudFront CDN Routing", "desc": "Assets are loading slowly in the EU region because CloudFront edges are misrouted."},
    {"title": "Unit Tests for Redux Reducers", "desc": "The user session slice in Redux is completely missing unit test coverage. Add Jest tests."},
    {"title": "Refactor Button Components", "desc": "The primary and secondary buttons are not adhering to the new Figma design system tokens."},
    {"title": "Automate Database Backups", "desc": "Write a bash script to dump the MongoDB collections and upload them to AWS S3 nightly."},
    {"title": "Role-Based Access Control Setup", "desc": "Admins should be able to restrict resources based on dynamic permissions, currently it's hardcoded."},
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
    
    print("Generating 10 new intelligent tickets...")
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
            print(f"[{idx+1}/10] SUCCESS: Issue '{sample['title']}' created reliably (Submitter: {submitter['name']})")
        else:
            print(f"FAILED to add '{sample['title']}'. Error: {resp_data.decode('utf-8')}")

if __name__ == "__main__":
    add_bulk_issues()

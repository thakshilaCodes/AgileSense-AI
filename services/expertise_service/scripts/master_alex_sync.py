
from pymongo import MongoClient
import uuid
from datetime import datetime

client = MongoClient('mongodb://localhost:27017')
db = client['agilesense_ai']

alex_email = "alex@gmail.com"
alex_name = "Alex"

print(f"Starting Master Sync for {alex_email}...")

# 1. Sync User Collection
db.users.update_one(
    {"email": alex_email},
    {"$set": {"name": alex_name}}
)
print(f"Updated user collection name to {alex_name}")

# 2. Sync Profile Collection
db.developer_profiles.update_one(
    {"email": alex_email},
    {"$set": {"name": alex_name, "status": "Busy"}}
)
print(f"Updated profile collection name to {alex_name} and status to Busy")

# 3. Create Overload State (3 Critical Issues)
critical_issues = [
    {
        "id": "ISSUE-DB-99",
        "title": "Critical: Core Database Deadlock",
        "description": "System is experiencing deadlocks in the main transaction log.",
        "category": "Database",
        "priority": "critical",
        "status": "assigned",
        "submittedBy": "manager@gmail.com",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "ISSUE-SEC-99",
        "title": "Critical: SQL Injection Security Hole",
        "description": "Exposed endpoint found in the user search module.",
        "category": "Database",
        "priority": "critical",
        "status": "assigned",
        "submittedBy": "manager@gmail.com",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "ISSUE-MIG-99",
        "title": "Critical: Data Corruption in Migration",
        "description": "Previous migration script left 5,000 records in a corrupted state.",
        "category": "Database",
        "priority": "critical",
        "status": "assigned",
        "submittedBy": "manager@gmail.com",
        "createdAt": datetime.now().isoformat()
    }
]

# Update profile issues
db.developer_profiles.update_one(
    {"email": alex_email},
    {"$set": {"pendingIssues.Database": critical_issues}}
)
print("Added 3 critical issues to profile.")

# 4. Sync Notifications (Clear and Reweight)
db.notifications.delete_many({"userEmail": alex_email})
print("Cleared old notifications.")

for issue in critical_issues:
    # Official Issue Doc
    db.issues.delete_many({"id": issue["id"]}) # Clear if exists
    db.issues.insert_one({
        **issue,
        "assignedTo": alex_email,
        "assignedToName": alex_name,
        "assignedAt": datetime.now().isoformat()
    })
    
    # Notification Doc
    notification = {
        "id": str(uuid.uuid4()),
        "userEmail": alex_email,
        "title": "New Critical Assignment",
        "message": f"Critical task assigned: {issue['title']}",
        "type": "assignment",
        "relatedIssueId": issue['id'],
        "createdAt": datetime.now().isoformat(),
        "read": False
    }
    db.notifications.insert_one(notification)

print("Added 3 fresh notifications.")
print("MASTER SYNC COMPLETE. Alex is now perfectly consistent.")

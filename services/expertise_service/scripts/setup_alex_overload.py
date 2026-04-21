
import os
import sys
from pymongo import MongoClient
from datetime import datetime
import uuid

# Configuration
MONGODB_URI = "mongodb://localhost:27017"
DB_NAME = "agilesense_ai"

def setup_alex_overload():
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    
    alex_email = "alex@gmail.com"
    print(f"Setting up overload scenario for {alex_email}...")

    # 1. Clear existing notifications for Alex
    db.notifications.delete_many({"userEmail": alex_email})
    print("Cleared old notifications.")

    # 2. Reset Alex's pending issues in profile
    # We want 3 critical issues.
    issues_list = []
    category = "Database" # Let's use Database for these 3 issues
    
    critical_issues = [
        {
            "id": f"ISSUE-{uuid.uuid4().hex[:6].upper()}",
            "title": "Critical: Core Database Deadlock",
            "description": "System is experiencing deadlocks in the main transaction log.",
            "category": category,
            "priority": "critical",
            "status": "assigned",
            "submittedBy": "manager@gmail.com",
            "createdAt": datetime.now().isoformat()
        },
        {
            "id": f"ISSUE-{uuid.uuid4().hex[:6].upper()}",
            "title": "Critical: SQL Injection Security Hole",
            "description": "Exposed endpoint found in the user search module.",
            "category": category,
            "priority": "critical",
            "status": "assigned",
            "submittedBy": "manager@gmail.com",
            "createdAt": datetime.now().isoformat()
        },
        {
            "id": f"ISSUE-{uuid.uuid4().hex[:6].upper()}",
            "title": "Critical: Data Corruption in Migration",
            "description": "Previous migration script left 5,000 records in a corrupted state.",
            "category": category,
            "priority": "critical",
            "status": "assigned",
            "submittedBy": "manager@gmail.com",
            "createdAt": datetime.now().isoformat()
        }
    ]

    # Update Alex's profile with these pending issues
    db.developer_profiles.update_one(
        {"email": alex_email},
        {"$set": {
            f"pendingIssues.{category}": critical_issues,
            "status": "Busy"
        }}
    )
    print(f"Updated Alex's profile with 3 critical {category} issues.")

    # 3. Insert into 'issues' collection so they can be viewed/resolved via UI
    for issue in critical_issues:
        full_issue = {
            **issue,
            "assignedTo": alex_email,
            "assignedToName": "Alex",
            "assignedAt": datetime.now().isoformat()
        }
        db.issues.insert_one(full_issue)
        
        # 4. Create Notification
        notification = {
            "id": f"NOTIF-{uuid.uuid4().hex[:6].upper()}",
            "userEmail": alex_email,
            "title": "New Critical Mission Assigned",
            "message": f"You have been assigned to: {issue['title']}",
            "type": "assignment",
            "relatedIssueId": issue['id'],
            "createdAt": datetime.now().isoformat(),
            "read": False
        }
        db.notifications.insert_one(notification)

    print("Created 3 official issues and 3 notifications.")
    print("DEMO READY: Alex is now officially OVERLOADED.")

if __name__ == "__main__":
    setup_alex_overload()

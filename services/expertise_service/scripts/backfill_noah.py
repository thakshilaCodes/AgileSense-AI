
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('services/expertise_service/.env')
db = MongoClient(os.environ.get('MONGODB_URI')).get_database('expertise')

email = 'noah@tech.com'
# We identified 3 issues that were resolved but not counted:
# 1. Update PCI Compliance Docs (Documentation)
# 2. ui stucks (UI)
# 3. login screen freezes (Authentication)

updates = {
    'Documentation': 1,
    'UI': 1,
    'Authentication': 1
}

print(f"--- Backfilling Solved Counts for {email} ---")

for cat, count in updates.items():
    result = db['developer_profiles'].update_one(
        {'email': email},
        {'$inc': {f'jiraIssuesSolved.{cat}': count}}
    )
    if result.modified_count > 0:
        print(f"Incremented {cat} by {count}: Success")
    else:
        print(f"Incremented {cat} by {count}: Failed (User not found or no change)")

print("--- Backfill Complete ---")

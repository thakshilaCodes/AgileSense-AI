
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['agilesense_ai']

print("--- USERS ---")
for u in db.users.find({}, {"email": 1, "name": 1, "role": 1}):
    print(f"Email: {u['email']} | Name: {u.get('name')} | Role: {u.get('role')}")

print("\n--- DEVELOPER PROFILES ---")
for p in db.developer_profiles.find({}, {"email": 1, "name": 1}):
    print(f"Email: {p['email']} | Name: {p.get('name')}")

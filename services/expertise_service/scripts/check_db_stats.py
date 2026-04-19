
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017')
db = client['agilesense_ai']
print(f"Profiles for alex@gmail.com: {db.developer_profiles.count_documents({'email': 'alex@gmail.com'})}")
print(f"Notifications for alex@gmail.com: {db.notifications.count_documents({'userEmail': 'alex@gmail.com'})}")
print(f"Issues assigned to alex@gmail.com: {db.issues.count_documents({'assignedTo': 'alex@gmail.com'})}")

# Check all users
print("\n--- All Users ---")
for u in db.users.find({}, {"email": 1, "role": 1}):
    print(u)

# Check all collections
print("\n--- Collections ---")
print(db.list_collection_names())

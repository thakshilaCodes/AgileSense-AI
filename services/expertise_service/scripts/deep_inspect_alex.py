
from pymongo import MongoClient
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

client = MongoClient('mongodb://localhost:27017')
db = client['agilesense_ai']

print("--- USER DOC (alex@gmail.com) ---")
user = db.users.find_one({"email": "alex@gmail.com"})
print(json.dumps(user, indent=2, cls=JSONEncoder))

print("\n--- PROFILE DOC (alex@gmail.com) ---")
profile = db.developer_profiles.find_one({"email": "alex@gmail.com"})
print(json.dumps(profile, indent=2, cls=JSONEncoder))

print("\n--- ONE NOTIFICATION (alex@gmail.com) ---")
notif = db.notifications.find_one({"userEmail": "alex@gmail.com"})
print(json.dumps(notif, indent=2, cls=JSONEncoder))


import os
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env
dotenv_path = os.path.join(os.getcwd(), 'services', 'expertise_service', '.env')
load_dotenv(dotenv_path)

uri = os.environ.get('MONGODB_URI')
db_name = os.environ.get('MONGODB_DB_NAME', 'expertise')

client = MongoClient(uri)
db = client[db_name]

test_users = ["alex@gmail.com", "natty@gmail.com", "sarah@gmail.com", "elena@gmail.com"]
password = "password"

print(f"--- Synchronizing Test Users in {db_name} ---")

for email in test_users:
    user = db['users'].find_one({"email": email})
    if user:
        new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db['users'].update_one({"email": email}, {"$set": {"passwordHash": new_hash}})
        print(f"Updated {email}: Success")
    else:
        print(f"Skipped {email}: Not found in DB")

print("--- Sync Complete ---")

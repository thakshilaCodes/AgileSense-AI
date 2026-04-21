
import os
import sys
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env from the correct path
dotenv_path = os.path.join(os.getcwd(), 'services', 'expertise_service', '.env')
load_dotenv(dotenv_path)

uri = os.environ.get('MONGODB_URI')
db_name = os.environ.get('MONGODB_DB_NAME', 'expertise')

client = MongoClient(uri)
db = client[db_name]

email = "alex@gmail.com"
password = "password"

user = db['users'].find_one({"email": email})

if not user:
    print(f"Error: User {email} not found")
    sys.exit(1)

stored_hash = user.get("passwordHash")
print(f"User: {email}")
print(f"Stored Hash: {stored_hash}")

# Test verification
try:
    match = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
    print(f"Verification with 'password': {'SUCCESS' if match else 'FAILED'}")
except Exception as e:
    print(f"Error during verification: {e}")

# If failed, propose a fix: reset the password to 'password'
if not match:
    print("Fixing: Resetting password to 'password'...")
    new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db['users'].update_one({"email": email}, {"$set": {"passwordHash": new_hash}})
    print(f"New Hash: {new_hash}")
    print("Password reset successful.")

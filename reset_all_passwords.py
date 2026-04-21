import sys
import os
sys.path.append(os.getcwd())
from dotenv import load_dotenv

env_path = r"services\expertise_service\.env"
load_dotenv(env_path)

from services.expertise_service.core.auth import hash_password
from pymongo import MongoClient

uri = os.environ.get("MONGODB_URI")
db_name = os.environ.get("MONGODB_DB_NAME", "expertise")

print("URI:", uri)

client = MongoClient(uri)
db = client[db_name]

new_hash = hash_password("password")
# Use update_many with an empty filter {} to update all users
result = db["users"].update_many(
    {}, 
    {"$set": {"passwordHash": new_hash}}
)

print("UPDATED RECORDS:", result.modified_count)

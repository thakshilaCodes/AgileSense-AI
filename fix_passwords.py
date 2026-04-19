import os
import sys
import bcrypt
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.append(os.getcwd())
load_dotenv('services/expertise_service/.env')

uri = os.environ.get('MONGODB_URI')
print('Connected to Mongo.')
db = MongoClient(uri).get_database('expertise')

pwd_bytes = b'password'
hash_str = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')
print('Valid BCrypt format:', hash_str.startswith('$2'))

res = db['users'].update_many({}, {'$set': {'passwordHash': hash_str}})
print('Updated', res.modified_count, 'users with new hash.', hash_str)

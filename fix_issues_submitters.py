import os
import sys
import random
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.append(os.getcwd())
load_dotenv('services/expertise_service/.env')

uri = os.environ.get('MONGODB_URI')
db = MongoClient(uri).get_database('expertise')

devs = list(db['users'].find({'role': 'developer'}))
devs = [d for d in devs if d['email'] != 'natty@gmail.com'] # Make sure it's not Natty

if not devs:
    print('No developers found.')
    sys.exit()

issues = list(db['issues'].find({}))
print('Updating', len(issues), 'issues')

for i in issues:
    d = random.choice(devs)
    db['issues'].update_one({'_id': i['_id']}, {'$set': {'submittedBy': d['email'], 'submittedByName': d.get('name', 'Developer')}})

print('Successfully redistributed submitters.')

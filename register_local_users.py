import sys
import os
sys.path.append(os.getcwd())

from services.expertise_service.core.schemas import RegisterRequest
from services.expertise_service.core.service import register_user

register_user(RegisterRequest(email='alex@gmail.com', name='Alex', password='password', role='developer'))
register_user(RegisterRequest(email='elena@gmail.com', name='Elena', password='password', role='developer'))
print("USERS CREATED SUCCESSFULLY")

import sys
import os
sys.path.append(os.path.dirname(__file__))

from services.expertise_service.core.schemas import IssueCreateRequest
from services.expertise_service.core.service import create_and_predict_issue

try:
    req = IssueCreateRequest(
        title="memory leak in database",
        description="memory leak in database",
        priority="medium",
        submittedBy="user@example.com",
        submittedByName="User"
    )
    result = create_and_predict_issue(req)
    print("SUCCESS", result)
except Exception as e:
    import traceback
    traceback.print_exc()

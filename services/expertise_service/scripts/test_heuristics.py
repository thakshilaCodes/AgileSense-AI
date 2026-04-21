
import sys
import os

# Add service directory to path
sys.path.append(os.path.join(os.getcwd(), 'services', 'expertise_service'))

from inference.model import predict_issue_category

test_cases = [
    "login screen freezes",
    "ui stuck on loading",
    "button alignment is wrong",
    "wrong credentials",
    "database connection lost"
]

print("--- Testing Hybrid Classification ---")
for text in test_cases:
    category = predict_issue_category(text)
    print(f"TEXT: '{text}' -> CATEGORY: {category}")
print("--- Test Complete ---")

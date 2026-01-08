"""
Repository for managing issues in MongoDB.
Issues are stored separately from developer profiles.
"""
from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection

from .config import config
from .schemas import Issue


def _get_issues_collection() -> Collection:
    """Get MongoDB collection for issues."""
    client = MongoClient(config.MONGODB_URI)
    db = client[config.MONGODB_DB_NAME]
    return db["issues"]


def create_issue(issue: Issue) -> Issue:
    """Create a new issue."""
    col = _get_issues_collection()
    doc = issue.model_dump()
    result = col.insert_one(doc)
    stored = col.find_one({"_id": result.inserted_id})
    return Issue(**stored)


def get_issue_by_id(issue_id: str) -> Optional[Issue]:
    """Get issue by ID."""
    col = _get_issues_collection()
    doc = col.find_one({"id": issue_id})
    if not doc:
        return None
    return Issue(**doc)


def list_all_issues(status: Optional[str] = None) -> List[Issue]:
    """List all issues, optionally filtered by status."""
    col = _get_issues_collection()
    query = {} if not status else {"status": status}
    issues = []
    for doc in col.find(query).sort("createdAt", -1):
        issues.append(Issue(**doc))
    return issues


def update_issue_status(issue_id: str, status: str, assigned_to: Optional[str] = None, assigned_to_name: Optional[str] = None) -> Issue:
    """Update issue status."""
    col = _get_issues_collection()
    update_data = {"status": status}
    
    if status == "assigned" and assigned_to:
        update_data["assignedTo"] = assigned_to
        update_data["assignedToName"] = assigned_to_name
        update_data["assignedAt"] = datetime.now().isoformat()
    elif status == "resolved":
        update_data["resolvedAt"] = datetime.now().isoformat()
    
    col.update_one({"id": issue_id}, {"$set": update_data})
    doc = col.find_one({"id": issue_id})
    return Issue(**doc)


def assign_issue_to_developer(issue_id: str, developer_email: str, developer_name: str) -> Issue:
    """Assign issue to a developer."""
    return update_issue_status(issue_id, "assigned", developer_email, developer_name)


def mark_issue_as_done(issue_id: str) -> Issue:
    """Mark issue as done (expert completed work)."""
    return update_issue_status(issue_id, "done")


def mark_issue_as_resolved(issue_id: str) -> Issue:
    """Mark issue as resolved (final status)."""
    return update_issue_status(issue_id, "resolved")


def get_issues_by_developer(developer_email: str) -> List[Issue]:
    """Get all issues assigned to a developer."""
    col = _get_issues_collection()
    issues = []
    for doc in col.find({"assignedTo": developer_email}).sort("createdAt", -1):
        issues.append(Issue(**doc))
    return issues


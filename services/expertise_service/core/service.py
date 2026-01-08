from typing import Dict, List
from datetime import datetime

from .repository import (
    add_pending_issue,
    get_developer_by_email,
    get_pending_issues_by_category,
    get_resolved_issues_by_category,
    list_developers,
    remove_pending_issue,
    resolve_issue,
    upsert_developer,
)
from .issue_repository import (
    create_issue,
    get_issue_by_id,
    list_all_issues,
    assign_issue_to_developer as assign_issue_to_dev,
    mark_issue_as_done,
    mark_issue_as_resolved,
    get_issues_by_developer,
)
from .schemas import (
    AssignIssueRequest,
    DeveloperProfile,
    DeveloperProfileDetailResponse,
    DeveloperProfileIn,
    Issue,
    IssueAssignRequest,
    IssueCreateRequest,
    IssueListResponse,
    IssuePredictionRequest,
    IssuePredictionResponse,
    PendingIssue,
    RecommendationResponse,
    ResolveIssueRequest,
    ResolvedIssue,
)
from ..inference.model import predict_issue_category


def save_developer_profile(profile_in: DeveloperProfileIn) -> DeveloperProfile:
    return upsert_developer(profile_in)


def fetch_developer_profile(email: str) -> DeveloperProfile | None:
    return get_developer_by_email(email)


def get_developer_profile_detail(email: str) -> DeveloperProfileDetailResponse | None:
    """Get developer profile with pending and resolved issues organized by category."""
    profile = get_developer_by_email(email)
    if not profile:
        return None
    
    # Organize pending issues by category
    pending_issues_by_category: Dict[str, List[PendingIssue]] = {}
    if profile.pendingIssues:
        for category, issues in profile.pendingIssues.items():
            pending_issues_by_category[category] = [
                PendingIssue(**issue) if isinstance(issue, dict) else issue
                for issue in issues
            ]
    
    # Organize resolved issues by category
    resolved_issues_by_category: Dict[str, List[ResolvedIssue]] = {}
    if profile.resolvedIssues:
        for category, issues in profile.resolvedIssues.items():
            resolved_issues_by_category[category] = [
                ResolvedIssue(**issue) if isinstance(issue, dict) else issue
                for issue in issues
            ]
    
    return DeveloperProfileDetailResponse(
        profile=profile,
        pendingIssuesByCategory=pending_issues_by_category,
        resolvedIssuesByCategory=resolved_issues_by_category
    )


def assign_issue_to_developer(req: AssignIssueRequest) -> DeveloperProfile:
    """Assign a pending issue to a developer."""
    return add_pending_issue(req.developerEmail, req.issue)


def unassign_issue_from_developer(developer_email: str, category: str, issue_id: str) -> DeveloperProfile:
    """Remove a pending issue from a developer."""
    return remove_pending_issue(developer_email, category, issue_id)


def get_pending_issues_for_category(developer_email: str, category: str) -> List[PendingIssue]:
    """Get pending issues for a developer in a specific category."""
    return get_pending_issues_by_category(developer_email, category)


def get_resolved_issues_for_category(developer_email: str, category: str) -> List[ResolvedIssue]:
    """Get resolved issues for a developer in a specific category."""
    return get_resolved_issues_by_category(developer_email, category)


def resolve_issue_for_developer(req: ResolveIssueRequest) -> DeveloperProfile:
    """Move a pending issue to resolved."""
    return resolve_issue(req.developerEmail, req.category, req.issueId, req.resolvedAt)


def predict_issue(req: IssuePredictionRequest) -> IssuePredictionResponse:
    text = f"{req.title or ''}\n{req.description}".strip()
    category = predict_issue_category(text)
    return IssuePredictionResponse(category=category)


def recommend_developers_for_category(category: str, top_n: int = 3) -> RecommendationResponse:
    category_field = category
    devs: List[DeveloperProfile] = list_developers()

    # Score developers based on expertise score and activity in that category
    def score_dev(dev: DeveloperProfile) -> float:
        expertise_score = getattr(dev.expertise, category_field, 0.0)
        jira_count = getattr(dev.jiraIssuesSolved, category_field, 0)
        gh_count = getattr(dev.githubCommits, category_field, 0)
        # Simple heuristic: expertise + log activity
        activity = jira_count + gh_count
        return expertise_score * 0.7 + (activity / 100.0) * 0.3

    scored = sorted(devs, key=score_dev, reverse=True)
    top_devs = scored[:top_n]
    return RecommendationResponse(category=category, developers=top_devs)


# Issue Management Functions
def create_and_predict_issue(req: IssueCreateRequest) -> Issue:
    """Create a new issue and predict its category."""
    # Predict category
    text = f"{req.title}\n{req.description}".strip()
    category = predict_issue_category(text)
    
    # Get top 3 experts for this category
    rec_response = recommend_developers_for_category(category, top_n=3)
    top_experts = [
        {
            "email": dev.email,
            "name": dev.name,
            "expertiseScore": getattr(dev.expertise, category, 0.0),
            "jiraIssuesSolved": getattr(dev.jiraIssuesSolved, category, 0),
            "githubCommits": getattr(dev.githubCommits, category, 0),
        }
        for dev in rec_response.developers
    ]
    
    # Create issue
    issue_id = f"ISSUE-{datetime.now().strftime('%Y%m%d')}-{datetime.now().timestamp()}"
    issue = Issue(
        id=issue_id,
        title=req.title,
        description=req.description,
        category=category,
        status="pending",
        priority=req.priority,
        submittedBy=req.submittedBy,
        submittedByName=req.submittedByName,
        createdAt=datetime.now().isoformat(),
        topExperts=top_experts,
    )
    
    return create_issue(issue)


def get_all_issues(status: str = None) -> IssueListResponse:
    """Get all issues for Project Manager dashboard."""
    issues = list_all_issues(status)
    return IssueListResponse(issues=issues, total=len(issues))


def assign_issue_from_dashboard(req: IssueAssignRequest) -> Issue:
    """Assign issue to developer from Project Manager dashboard."""
    # Update main issue
    issue = assign_issue_to_dev(req.issueId, req.developerEmail, req.developerName)
    
    # Also add to developer's pending issues
    dev = get_developer_by_email(req.developerEmail)
    if dev:
        pending_issue = PendingIssue(
            id=issue.id,
            title=issue.title,
            description=issue.description,
            category=issue.category,
            status="assigned",
            priority=issue.priority,
            createdAt=issue.createdAt,
            submittedBy=issue.submittedBy,
        )
        add_pending_issue(req.developerEmail, pending_issue)
    
    return issue


def mark_issue_complete(issue_id: str, developer_email: str) -> Issue:
    """Mark issue as done by expert, then resolve it."""
    # Mark as done
    issue = mark_issue_as_done(issue_id)
    
    # Also update in developer profile (move to resolved)
    if issue.assignedTo:
        dev = get_developer_by_email(developer_email)
        if dev and dev.pendingIssues and issue.category in dev.pendingIssues:
            # Remove from pending and add to resolved
            resolve_issue(developer_email, issue.category, issue_id)
    
    # Mark as resolved in main issue
    issue = mark_issue_as_resolved(issue_id)
    return issue


def get_developer_issues(developer_email: str) -> List[Issue]:
    """Get all issues assigned to a developer."""
    return get_issues_by_developer(developer_email)



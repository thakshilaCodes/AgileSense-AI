import os
from pathlib import Path
from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Load .env file if it exists (for local development)
try:
    from dotenv import load_dotenv
    # Try to load .env from service directory
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    # python-dotenv not installed, skip
    pass

from ..core.schemas import (
    AssignIssueRequest,
    DeveloperProfile,
    DeveloperProfileDetailResponse,
    DeveloperProfileIn,
    ExpertiseScores,
    CategoryCounts,
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
from ..core import service
from ..core.config import config

# Validate configuration on startup
config.validate()

app = FastAPI(
    title="Expertise Recommendation Service",
    version=config.SERVICE_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/expertise/predict", response_model=IssuePredictionResponse)
def predict_issue_category_endpoint(payload: IssuePredictionRequest) -> IssuePredictionResponse:
    return service.predict_issue(payload)


@app.post("/api/expertise/issues", response_model=Issue)
def create_issue_endpoint(payload: IssueCreateRequest) -> Issue:
    """Create a new issue with category prediction and expert recommendations."""
    return service.create_and_predict_issue(payload)


@app.get("/api/expertise/issues", response_model=IssueListResponse)
def list_issues_endpoint(
    status: str = Query(None, description="Filter by status: pending, assigned, in_progress, done, resolved")
) -> IssueListResponse:
    """Get all issues for Project Manager dashboard."""
    return service.get_all_issues(status)


@app.get("/api/expertise/issues/{issue_id}", response_model=Issue)
def get_issue_endpoint(issue_id: str) -> Issue:
    """Get issue by ID."""
    from ..core.issue_repository import get_issue_by_id
    issue = get_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@app.post("/api/expertise/issues/assign", response_model=Issue)
def assign_issue_from_dashboard_endpoint(payload: IssueAssignRequest) -> Issue:
    """Assign issue to developer from Project Manager dashboard."""
    return service.assign_issue_from_dashboard(payload)


@app.post("/api/expertise/issues/{issue_id}/complete", response_model=Issue)
def complete_issue_endpoint(
    issue_id: str,
    developerEmail: str = Query(..., description="Email of developer completing the issue")
) -> Issue:
    """Mark issue as done/resolved by expert."""
    return service.mark_issue_complete(issue_id, developerEmail)


@app.get("/api/expertise/developers/{email}/issues", response_model=List[Issue])
def get_developer_issues_endpoint(email: str) -> List[Issue]:
    """Get all issues assigned to a developer."""
    return service.get_developer_issues(email)


@app.post("/api/expertise/developers", response_model=DeveloperProfile)
def upsert_developer_profile_endpoint(payload: DeveloperProfileIn) -> DeveloperProfile:
    return service.save_developer_profile(payload)


@app.get("/api/expertise/developers/{email}", response_model=DeveloperProfile)
def get_developer_profile_endpoint(email: str) -> DeveloperProfile:
    dev = service.fetch_developer_profile(email)
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    return dev


@app.get("/api/expertise/developers/{email}/detail", response_model=DeveloperProfileDetailResponse)
def get_developer_profile_detail_endpoint(email: str) -> DeveloperProfileDetailResponse:
    """Get developer profile with pending issues organized by category."""
    detail = service.get_developer_profile_detail(email)
    if not detail:
        raise HTTPException(status_code=404, detail="Developer not found")
    return detail


@app.get("/api/expertise/developers/{email}/pending-issues/{category}", response_model=list[PendingIssue])
def get_pending_issues_by_category_endpoint(
    email: str,
    category: str,
) -> list[PendingIssue]:
    """Get pending issues for a developer in a specific category."""
    dev = service.fetch_developer_profile(email)
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    return service.get_pending_issues_for_category(email, category)


@app.get("/api/expertise/developers/{email}/resolved-issues/{category}", response_model=list[ResolvedIssue])
def get_resolved_issues_by_category_endpoint(
    email: str,
    category: str,
) -> list[ResolvedIssue]:
    """Get resolved issues for a developer in a specific category."""
    dev = service.fetch_developer_profile(email)
    if not dev:
        raise HTTPException(status_code=404, detail="Developer not found")
    return service.get_resolved_issues_for_category(email, category)


@app.post("/api/expertise/assign-issue", response_model=DeveloperProfile)
def assign_issue_endpoint(payload: AssignIssueRequest) -> DeveloperProfile:
    """Assign a pending issue to a developer."""
    try:
        return service.assign_issue_to_developer(payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.delete("/api/expertise/developers/{email}/pending-issues/{category}/{issue_id}", response_model=DeveloperProfile)
def unassign_issue_endpoint(
    email: str,
    category: str,
    issue_id: str,
) -> DeveloperProfile:
    """Remove a pending issue from a developer."""
    try:
        return service.unassign_issue_from_developer(email, category, issue_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/expertise/resolve-issue", response_model=DeveloperProfile)
def resolve_issue_endpoint(payload: ResolveIssueRequest) -> DeveloperProfile:
    """Mark a pending issue as resolved."""
    try:
        return service.resolve_issue_for_developer(payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/expertise/create-submitter-profile", response_model=DeveloperProfile)
def create_submitter_profile_endpoint(
    email: str = Query(..., description="Email of the issue submitter"),
    name: str = Query(..., description="Name of the issue submitter"),
) -> DeveloperProfile:
    """Create or get a developer profile for the issue submitter."""
    # Check if profile exists
    existing = service.fetch_developer_profile(email)
    if existing:
        return existing
    
    # Create a new profile with default values
    new_profile = DeveloperProfileIn(
        email=email,
        name=name,
        expertise=ExpertiseScores(),  # All zeros initially
        jiraIssuesSolved=CategoryCounts(),  # All zeros initially
        githubCommits=CategoryCounts(),  # All zeros initially
    )
    return service.save_developer_profile(new_profile)


@app.get("/api/expertise/recommend", response_model=RecommendationResponse)
def recommend_developers_endpoint(
    category: str = Query(..., description="Issue category predicted by the model"),
    top_n: int = Query(3, ge=1, le=20),
) -> RecommendationResponse:
    return service.recommend_developers_for_category(category, top_n)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# To run locally:
# uvicorn services.expertise_service.api.main:app --reload



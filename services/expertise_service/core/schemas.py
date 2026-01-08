from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, EmailStr


class ExpertiseScores(BaseModel):
    API: float = Field(0.0, ge=0.0, le=1.0)
    Authentication: float = Field(0.0, ge=0.0, le=1.0)
    Database: float = Field(0.0, ge=0.0, le=1.0)
    DevOps: float = Field(0.0, ge=0.0, le=1.0)
    Documentation: float = Field(0.0, ge=0.0, le=1.0)
    Performance: float = Field(0.0, ge=0.0, le=1.0)
    Security: float = Field(0.0, ge=0.0, le=1.0)
    Testing: float = Field(0.0, ge=0.0, le=1.0)
    UI: float = Field(0.0, ge=0.0, le=1.0)


class CategoryCounts(BaseModel):
    API: int = 0
    Authentication: int = 0
    Database: int = 0
    DevOps: int = 0
    Documentation: int = 0
    Performance: int = 0
    Security: int = 0
    Testing: int = 0
    UI: int = 0


class PendingIssue(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: str = "pending"  # pending, in_progress, blocked
    priority: str = "medium"  # low, medium, high, critical
    createdAt: Optional[str] = None
    dueDate: Optional[str] = None
    submittedBy: Optional[str] = None  # Email of person who raised the issue


class ResolvedIssue(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str = "medium"
    createdAt: Optional[str] = None
    resolvedAt: Optional[str] = None
    submittedBy: Optional[str] = None


class DeveloperProfileIn(BaseModel):
    email: EmailStr
    name: str
    expertise: ExpertiseScores
    jiraIssuesSolved: CategoryCounts
    githubCommits: CategoryCounts
    pendingIssues: Optional[Dict[str, List[PendingIssue]]] = None
    resolvedIssues: Optional[Dict[str, List[ResolvedIssue]]] = None


class DeveloperProfile(DeveloperProfileIn):
    id: Optional[str] = None


class IssuePredictionRequest(BaseModel):
    title: Optional[str] = None
    description: str
    submittedBy: Optional[EmailStr] = None  # Email of person who raised the issue
    submittedByName: Optional[str] = None  # Name of person who raised the issue


class IssuePredictionResponse(BaseModel):
    category: str
    probabilities: Optional[Dict[str, float]] = None


class RecommendationResponse(BaseModel):
    category: str
    developers: list[DeveloperProfile]


class DeveloperProfileDetailResponse(BaseModel):
    profile: DeveloperProfile
    pendingIssuesByCategory: Dict[str, List[PendingIssue]]
    resolvedIssuesByCategory: Dict[str, List[ResolvedIssue]]


class AssignIssueRequest(BaseModel):
    developerEmail: EmailStr
    issue: PendingIssue


class ResolveIssueRequest(BaseModel):
    developerEmail: EmailStr
    category: str
    issueId: str
    resolvedAt: Optional[str] = None


class Issue(BaseModel):
    """Main issue model stored in issues collection."""
    id: str
    title: str
    description: str
    category: str
    status: str = "pending"  # pending, assigned, in_progress, done, resolved
    priority: str = "medium"
    submittedBy: EmailStr
    submittedByName: Optional[str] = None
    assignedTo: Optional[EmailStr] = None  # Expert assigned to fix
    assignedToName: Optional[str] = None
    createdAt: str
    assignedAt: Optional[str] = None
    resolvedAt: Optional[str] = None
    topExperts: Optional[List[Dict]] = None  # Top 3 recommended experts


class IssueCreateRequest(BaseModel):
    title: str
    description: str
    submittedBy: EmailStr
    submittedByName: Optional[str] = None
    priority: str = "medium"


class IssueListResponse(BaseModel):
    issues: List[Issue]
    total: int


class IssueAssignRequest(BaseModel):
    issueId: str
    developerEmail: EmailStr
    developerName: str



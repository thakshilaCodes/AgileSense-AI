# AgileSense-AI – System Architecture

## 1. Overview

AgileSense-AI is a microservices-based, AI-driven system designed to enhance agile team performance by analyzing emotions, recommending expertise, predicting sprint impact, and promoting inclusive communication.

The system follows a **modular microservices architecture**, allowing each component to be developed, deployed, and scaled independently.

---

## 2. Architectural Style

- **Microservices Architecture**
- **Service-Oriented Design**
- **AI/ML-Centric Processing**
- **Loose Coupling & High Cohesion**

Each core functionality is implemented as a separate service communicating via well-defined APIs.

---

## 3. High-Level Architecture Diagram

```mermaid
flowchart LR
    User[User / Team Member]
    Frontend[Frontend Dashboard]

    subgraph Microservices
        EmotionService[Emotion Service]
        ExpertiseService[Expertise Service]
        SprintService[Sprint Impact Service]
        CommunicationService[Communication Service]
    end

    subgraph Shared
        Utils[Shared Utils]
        Embeddings[Shared Embeddings]
        Schemas[Shared Schemas]
        Auth[Auth Module]
    end

    subgraph DataLayer
        RawData[Raw Data]
        ProcessedData[Processed Data]
        Annotations[Annotations]
    end

    subgraph Models
        EmotionModel[Emotion Detection Model]
        ExpertiseModel[Expertise Recommendation Model]
        SprintModel[Sprint Impact Model]
        CommunicationModel[Inclusive Communication Model]
    end

    User --> Frontend
    Frontend --> EmotionService
    Frontend --> ExpertiseService
    Frontend --> SprintService
    Frontend --> CommunicationService

    EmotionService --> EmotionModel
    ExpertiseService --> ExpertiseModel
    SprintService --> SprintModel
    CommunicationService --> CommunicationModel

    EmotionService --> DataLayer
    ExpertiseService --> DataLayer
    SprintService --> DataLayer
    CommunicationService --> DataLayer

    EmotionService --> Shared
    ExpertiseService --> Shared
    SprintService --> Shared
    CommunicationService --> Shared

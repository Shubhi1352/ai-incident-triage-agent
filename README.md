# AI Incident Triage Agent

An AI-powered full-stack application that automatically triages production incidents. Engineering teams submit incident details (title, description, error logs) and the system leverages Hugging Face LLMs to analyze each incident — determining severity, identifying root cause, and suggesting fixes.

## Features

- **AI-Powered Triage** — Submit an incident and get automatic severity classification (LOW / MEDIUM / HIGH / CRITICAL), root cause analysis, and a suggested fix using Hugging Face inference APIs.
- **Per-Incident AI Chat** — Ask follow-up debugging questions to an AI assistant that is context-aware of the specific incident.
- **Real-Time Updates** — Incidents transition through OPEN → PROCESSING → TRIAGED / FAILED with live WebSocket (STOMP over SockJS) updates reflected in the UI.
- **Full CRUD** — Create, read, update, and delete incidents. Editing an incident retriggers AI analysis.
- **Retry Mechanism** — Failed AI analyses can be retried up to 3 times.
- **Search & Pagination** — Filter incidents by title and severity with server-side pagination.
- **Visual Background** — Animated Three.js tube cursor effect for a polished experience.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.3.4, Maven |
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Message Queue | RabbitMQ 3 |
| AI / LLM | Hugging Face Inference API (Qwen2.5-7B-Instruct) |
| Real-Time | STOMP over WebSocket (SockJS) |
| Containerization | Docker, Docker Compose |
| 3D Graphics | Three.js |

## Architecture

```
User → Next.js Frontend → Spring Boot REST API → PostgreSQL
                              ↕ (RabbitMQ)
                        Async Consumer → Hugging Face API
                              ↕ (WebSocket)
                        Real-Time Updates to Frontend
```

Incidents flow asynchronously: the API saves the incident, publishes a message to RabbitMQ, and a consumer calls the Hugging Face API. Status updates are broadcast to the frontend via WebSocket in real time.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- A Hugging Face API token ([get one here](https://huggingface.co/settings/tokens))

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-incident-triage-agent.git
   cd ai-incident-triage-agent
   ```

2. Create a `.env` file at the project root:
   ```env
   HF_TOKEN=hf_your_token_here
   HF_MODEL=Qwen/Qwen2.5-7B-Instruct:fastest
   ```

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - **Frontend** — [http://localhost:3000](http://localhost:3000)
   - **Backend API** — [http://localhost:8080/api](http://localhost:8080/api)
   - **Swagger UI** — [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - **RabbitMQ Management** — [http://localhost:15672](http://localhost:15672) (guest/guest)

### Running Locally (without Docker)

**Backend:**
```bash
cd ai-incident-triage-agent
./mvnw clean install
./mvnw spring-boot:run
```
Requires PostgreSQL, Redis, and RabbitMQ running locally.

**Frontend:**
```bash
cd ai-incident-triage-frontend
npm install
npm run dev
```

The frontend runs on port 3000 and expects the backend at `http://localhost:8080`.

## API Endpoints

### Incidents (`/api/incidents`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/incidents/create` | Create a new incident and trigger AI analysis |
| GET | `/api/incidents/getall` | Get all incidents |
| GET | `/api/incidents/getbyid/{id}` | Get incident by ID |
| PUT | `/api/incidents/update/{id}` | Update incident (re-triggers AI analysis) |
| DELETE | `/api/incidents/delete/{id}` | Delete an incident |
| GET | `/api/incidents/getincidents` | Paginated search with severity/title filters |
| POST | `/api/incidents/retry/{id}` | Retry AI analysis for a failed incident |

### AI Chat (`/api/ai/chat`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat/{incidentId}` | Send a follow-up question to the AI |
| GET | `/api/ai/chat/{incidentId}/history` | Get chat history for an incident |

### WebSocket
- **Endpoint:** `/ws` (STOMP over SockJS)
- **Topic:** `/topic/incidents/{id}` — per-incident updates
- **Topic:** `/topic/incidents` — global incident list updates

## Project Structure

```
ai-incident-triage-agent/
├── docker-compose.yml
├── .env
├── ai-incident-triage-agent/       # Spring Boot backend
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/shubham/aitriage/
│       ├── config/                  # CORS, RabbitMQ, Redis, WebSocket config
│       ├── controller/              # REST controllers
│       ├── service/                 # Business logic & AI integration
│       ├── repository/              # JPA repositories
│       ├── entity/                  # JPA entities
│       ├── enums/                   # Status, Severity, ChatRole
│       ├── dto/                     # Request/Response DTOs
│       └── exception/               # Error handling
└── ai-incident-triage-frontend/    # Next.js frontend
    ├── package.json
    ├── Dockerfile
    └── src/
        ├── app/                     # Pages & layout
        ├── components/              # UI components
        ├── contexts/                # React contexts
        ├── hooks/                   # Custom hooks (WebSocket)
        └── service/                 # API client
```

## Environment Variables

### Root `.env` (Docker Compose)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HF_TOKEN` | Yes | — | Hugging Face API token |
| `HF_MODEL` | No | `Qwen/Qwen2.5-7B-Instruct:fastest` | Hugging Face model ID |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Backend API base URL |

## License

MIT

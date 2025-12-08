# ShepThon — Python Compiler Target

## Overview

**ShepThon is the Python backend compiler target for ShepLang.**

When you compile a ShepLang program, the ShepThon compiler generates:
- FastAPI application with routes
- Pydantic models for data validation
- SQLAlchemy ORM integration (planned)
- Authentication system (JWT)
- Admin dashboard

## Status

| Feature | Status |
|---------|--------|
| Pydantic models | ✅ Complete |
| FastAPI routes | ✅ Complete |
| CRUD operations | ✅ Complete |
| Auth generation | ✅ Complete |
| Admin dashboard | ✅ Complete |
| AI field generation | 🚧 Partial |
| Background tasks | 📋 Planned |
| Database migrations | 📋 Planned |

---

## What ShepThon Generates

### From `data` → Pydantic Models

```shep
data User {
  email: email (required, unique)
  name: text (required)
  role: enum(admin, user)
}
```

Generates:

```python
from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class User(BaseModel):
    email: EmailStr
    name: str
    role: UserRole
```

### From `view` → FastAPI Routes

```shep
view UserList {
  show: [email, name, role]
  filter: role
}
```

Generates:

```python
@router.get("/users")
async def list_users(role: Optional[UserRole] = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.all()
```

### From `action` → Business Logic

```shep
action CreateUser {
  validate email is unique
  save User
  notify admin
}
```

Generates validation, database operations, and side effects.

### From `ai` → LLM Integration

```shep
data Ticket {
  message: text
  sentiment: ai("classify as positive, neutral, negative")
}
```

Generates:

```python
async def compute_sentiment(message: str) -> str:
    return await call_ai(
        prompt="Classify as positive, neutral, negative",
        context=message,
        cache_key="ticket_sentiment"
    )
```

---

## Generated File Structure

```
generated/
├── main.py           # FastAPI entry point
├── models.py         # Pydantic models
├── routes.py         # API endpoints
├── auth.py           # JWT authentication
├── admin.html        # Admin dashboard
├── ai_client.py      # LLM integration (if using ai)
├── requirements.txt  # Python dependencies
└── schema.sql        # PostgreSQL schema
```

---

## Running Generated Code

```bash
cd generated
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

- API docs: http://localhost:3001/docs
- Admin: http://localhost:3001/admin

---

## Configuration

Environment variables:

```bash
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=sk-...  # If using ai
```

---

## Roadmap

### Immediate
- [ ] Complete `ai` field integration
- [ ] SQLAlchemy ORM support
- [ ] Database migrations

### Planned
- [ ] Background task generation
- [ ] WebSocket support
- [ ] Caching layer

---

*ShepThon: The Python backend for ShepLang programs.*

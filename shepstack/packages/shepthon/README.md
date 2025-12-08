# @goldensheepai/shep-shepthon

**Python code generator for ShepLang — compile specs to FastAPI + Pydantic.**

[![npm](https://img.shields.io/npm/v/@goldensheepai/shep-shepthon?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shep-shepthon)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is shep-shepthon?

`shep-shepthon` generates Python backend code from ShepLang specifications:

- **Pydantic Models** — Data models with validation
- **FastAPI Routes** — CRUD endpoints for all entities
- **SQLAlchemy Models** — Database ORM models
- **AI Integration** — Stubs for `ai()` primitive calls

---

## Installation

```bash
npm install @goldensheepai/shep-shepthon
```

---

## Usage

```typescript
import { parse } from '@goldensheepai/shep-core';
import { generatePython } from '@goldensheepai/shep-shepthon';

const source = `
app "MyApp"

data User {
  email: text (required)
  name: text
  role: enum(admin, user)
}

action CreateUser {
  validate email
  save User
  notify welcome-email
}
`;

const ast = parse(source);
const output = generatePython(ast);

// output.models - Pydantic models
// output.routes - FastAPI routes
// output.database - SQLAlchemy models
```

---

## Generated Output

### Models (`models.py`)

```python
from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime
from typing import Optional

class UserRole(str, Enum):
    admin = "admin"
    user = "user"

class User(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    role: UserRole
    created_at: datetime
    updated_at: datetime
```

### Routes (`routes.py`)

```python
from fastapi import APIRouter, HTTPException
from .models import User, UserCreate, UserUpdate
from .database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def list_users(db = Depends(get_db)):
    return db.query(UserModel).all()

@router.post("/")
async def create_user(user: UserCreate, db = Depends(get_db)):
    db_user = UserModel(**user.dict())
    db.add(db_user)
    db.commit()
    return db_user

@router.get("/{user_id}")
async def get_user(user_id: str, db = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Database (`database.py`)

```python
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

---

## Configuration

```typescript
import { generatePython, PythonConfig } from '@goldensheepai/shep-shepthon';

const config: PythonConfig = {
  outputDir: './backend',
  database: 'postgresql',
  useAlembic: true,
  generateTests: true
};

generatePython(ast, config);
```

---

## Related Packages

- [@goldensheepai/shep-core](https://www.npmjs.com/package/@goldensheepai/shep-core) — Parser & verifier
- [@goldensheepai/shep-cli](https://www.npmjs.com/package/@goldensheepai/shep-cli) — CLI tool
- [@goldensheepai/shep-sheplang](https://www.npmjs.com/package/@goldensheepai/shep-sheplang) — TypeScript codegen
- [@goldensheepai/shep-lsp](https://www.npmjs.com/package/@goldensheepai/shep-lsp) — Language Server

---

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)

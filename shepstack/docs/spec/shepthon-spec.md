# Shepthon Specification

## Overview

Shepthon is a Python-targeting compiler layer for the Shep language. It enables developers to write backend services, APIs, and data processing applications using Shep syntax, which compiles to idiomatic Python.

## Status

**Phase 1 (Current)**: Language design and core infrastructure
**Phase 2**: Parser and type system implementation
**Phase 3**: Full compiler and tooling

## Planned Features

### Entities

- Data structure definitions
- Type annotations
- Validation rules
- Relationships and foreign keys

### Endpoints

- HTTP API definitions
- Path and query parameters
- Request/response types
- Status codes and error handling

### Services

- Grouping related entities and endpoints
- Dependency injection
- Middleware support

### Database Integration

- ORM support (SQLAlchemy, etc.)
- Migration generation
- Query builders
- Transaction management

### Advanced Features (Future)

- Async/await
- Background jobs
- Caching strategies
- Authentication/authorization
- Testing utilities

## Example Syntax

```shepthon
entity User {
  id: string
  name: string
  email: string
  created_at: datetime
  updated_at: datetime
}

entity Post {
  id: string
  title: string
  content: string
  author_id: string
  created_at: datetime
}

endpoint GET /api/users {
  query limit?: number
  query offset?: number
  return User[]
}

endpoint GET /api/users/:id {
  params id: string
  return User | null
}

endpoint POST /api/users {
  body user: CreateUserInput
  return User
}

endpoint GET /api/users/:id/posts {
  params id: string
  return Post[]
}

model CreateUserInput {
  name: string
  email: string
}
```

## Compilation Target

Shepthon compiles to Python, which can be used with any Python web framework (FastAPI, Django, Flask, etc.).

## Next Steps

See the roadmap for implementation priorities.

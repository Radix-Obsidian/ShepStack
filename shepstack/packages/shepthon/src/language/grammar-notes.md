# Shepthon Grammar Notes

## Overview

Shepthon is a Python-targeting compiler layer for the Shep language, designed for building backend services and data processing applications.

## Syntax Overview

### Basic Structure

```python
# Entity definition
entity User {
  id: string
  name: string
  email: string
}

# Endpoint definition
endpoint GET /api/users {
  # Handler logic
  return []
}

# Service definition
service UserService {
  entities: [User]
  endpoints: [GET /api/users]
}
```

## Entities

Entities define data structures with validation and serialization support.

### Example

```python
entity User {
  id: string
  name: string
  email: string
  created_at: datetime
  is_active?: boolean
}
```

## Endpoints

Endpoints define HTTP API handlers with request/response types.

### Example

```python
endpoint GET /api/users/:id {
  params id: string
  query include_posts?: boolean

  return User | null
}

endpoint POST /api/users {
  body user: CreateUserInput

  return User
}
```

## Services

Services bundle related entities and endpoints into cohesive units.

### Example

```python
service UserService {
  entities: [User, Profile]
  endpoints: [
    GET /api/users,
    GET /api/users/:id,
    POST /api/users,
    PUT /api/users/:id,
    DELETE /api/users/:id
  ]
}
```

## Type System

Shepthon supports:

- Primitive types: `string`, `number`, `boolean`, `datetime`
- Optional types: `string?`
- Array types: `User[]`
- Union types: `string | number`
- Custom types: User-defined entities

## Database Integration

Shepthon provides first-class support for database operations:

- ORM integration (SQLAlchemy, etc.)
- Migration support
- Query builders
- Transaction management

## Future Enhancements

- [ ] Async/await support
- [ ] Middleware system
- [ ] Authentication/authorization
- [ ] Caching strategies
- [ ] Background jobs
- [ ] WebSocket support

# Sheplang Grammar Notes

## Overview

Sheplang is a TypeScript-targeting DSL designed for building full-stack applications with a focus on vertical slices.

## Syntax Overview

### Basic Structure

```
// Component definition
component MyComponent {
  // JSX-like syntax
  render() {
    return <div>Hello</div>
  }
}

// Route definition
route GET /api/users {
  // Handler logic
  return { users: [] }
}

// Model definition
model User {
  id: string
  name: string
  email: string
}

// Vertical slice
vertical_slice UserManagement {
  components: [UserList, UserDetail]
  routes: [GET /api/users, POST /api/users]
  models: [User]
}
```

## Components

Components are reusable UI building blocks. They support:

- Props with type annotations
- Lifecycle hooks (onMount, onDestroy, etc.)
- State management
- Event handlers

### Example

```
component UserCard(user: User) {
  state count = 0

  onMount() {
    // Initialization
  }

  render() {
    return <div>
      <h1>{user.name}</h1>
      <button onClick={() => count++}>
        Clicked {count} times
      </button>
    </div>
  }
}
```

## Routes

Routes define HTTP endpoints. They support:

- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Path parameters
- Query parameters
- Request/response types

### Example

```
route GET /api/users/:id {
  params id: string
  query detailed?: boolean

  return User | null
}

route POST /api/users {
  body user: CreateUserInput

  return User
}
```

## Data Models

Models define the structure of data. They support:

- Type annotations
- Optional fields
- Nested models
- Validation rules

### Example

```
model User {
  id: string
  name: string
  email: string
  createdAt: Date
  posts?: Post[]
}

model Post {
  id: string
  title: string
  content: string
  authorId: string
}
```

## Vertical Slices

Vertical slices bundle related components, routes, and models into self-contained features.

### Example

```
vertical_slice BlogManagement {
  components: [PostList, PostDetail, PostEditor]
  routes: [
    GET /api/posts,
    GET /api/posts/:id,
    POST /api/posts,
    PUT /api/posts/:id,
    DELETE /api/posts/:id
  ]
  models: [Post, CreatePostInput, UpdatePostInput]
}
```

## Type System

Sheplang supports:

- Primitive types: `string`, `number`, `boolean`, `Date`
- Union types: `string | number`
- Optional types: `string?`
- Array types: `User[]`
- Generic types: `Promise<User>`
- Custom types: User-defined models and interfaces

## Future Enhancements

- [ ] Async/await support
- [ ] Error handling (try/catch)
- [ ] Middleware support
- [ ] Database integration
- [ ] Authentication/authorization
- [ ] Testing utilities

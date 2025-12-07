# Budget Dashboard Example

A reference implementation of a full-stack application using the Shep language stack.

## Overview

This example demonstrates:

- **Frontend (Sheplang)**: A React-like component-based UI for managing budgets
- **Backend (Shepthon)**: Python-based REST API endpoints for budget operations
- **Data Models**: Shared type definitions for budgets and budget items

## Structure

```text
src/
├── app.sheplang.shep      # Frontend components and UI logic
└── api.shepthon.shep      # Backend API endpoints and entities
```

## Features

- View budgets by month
- Create, update, and delete budgets
- Track budget items and spending
- Real-time budget status

## Building

```bash
# Compile Sheplang to TypeScript
pnpm -C packages/shep-cli exec shep compile --lang sheplang --input examples/budget-dashboard/src/app.sheplang.shep --output examples/budget-dashboard/dist/app.ts

# Compile Shepthon to Python
pnpm -C packages/shep-cli exec shep compile --lang shepthon --input examples/budget-dashboard/src/api.shepthon.shep --output examples/budget-dashboard/dist/api.py
```

## Running

Development server coming in Phase 3.

## Future Enhancements

- [ ] Database integration
- [ ] Authentication
- [ ] Real-time updates
- [ ] Advanced analytics
- [ ] Mobile support

# Budget Dashboard — Example ShepLang Program

A reference ShepLang program for a budget tracking application.

## What This Demonstrates

- **`data`** — Budget and BudgetItem data models
- **`view`** — Dashboard and list views
- **`action`** — CRUD operations

## Program Structure

```
src/
├── app.shep      # Complete ShepLang program
```

## Compiling

```bash
shep compile --input examples/budget-dashboard/src/app.shep --output examples/budget-dashboard/dist
```

## Generated Output

- Python backend (FastAPI + Pydantic)
- TypeScript frontend (React + types)
- PostgreSQL schema

## Running

```bash
cd dist
pip install -r requirements.txt
uvicorn main:app --reload
```

---

*ShepLang: A programming language for the AI era.*

# @goldensheepai/shep-sheplang

**TypeScript code generator for ShepLang — compile specs to React + TypeScript.**

[![npm](https://img.shields.io/npm/v/@goldensheepai/shep-sheplang?style=flat-square)](https://www.npmjs.com/package/@goldensheepai/shep-sheplang)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## What is shep-sheplang?

`shep-sheplang` generates TypeScript/React code from ShepLang specifications:

- **Type Interfaces** — TypeScript interfaces for all entities
- **API Client** — Typed fetch wrappers for backend endpoints
- **React Components** — Screen stubs with form handling
- **Validation** — Zod schemas from field constraints

---

## Installation

```bash
npm install @goldensheepai/shep-sheplang
```

---

## Usage

```typescript
import { parse } from '@goldensheepai/shep-core';
import { generateTypeScript } from '@goldensheepai/shep-sheplang';

const source = `
app "MyApp"

data User {
  email: text (required)
  name: text
  role: enum(admin, user)
}

view UserList {
  show: [email, name, role]
}
`;

const ast = parse(source);
const output = generateTypeScript(ast);

// output.types - TypeScript interfaces
// output.api - API client code
// output.components - React components
```

---

## Generated Output

### Types (`types.ts`)

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

### API Client (`api.ts`)

```typescript
export const userApi = {
  list: () => fetch('/api/users').then(r => r.json()),
  get: (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
  create: (data: CreateUserInput) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ...
};
```

### Components (`UserList.tsx`)

```tsx
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    userApi.list().then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## Configuration

```typescript
import { generateTypeScript, TypeScriptConfig } from '@goldensheepai/shep-sheplang';

const config: TypeScriptConfig = {
  outputDir: './src/generated',
  apiBaseUrl: '/api',
  useZod: true,
  useTailwind: true
};

generateTypeScript(ast, config);
```

---

## Related Packages

- [@goldensheepai/shep-core](https://www.npmjs.com/package/@goldensheepai/shep-core) — Parser & verifier
- [@goldensheepai/shep-cli](https://www.npmjs.com/package/@goldensheepai/shep-cli) — CLI tool
- [@goldensheepai/shep-shepthon](https://www.npmjs.com/package/@goldensheepai/shep-shepthon) — Python codegen
- [@goldensheepai/shep-lsp](https://www.npmjs.com/package/@goldensheepai/shep-lsp) — Language Server

---

## License

MIT © [Golden Sheep AI](https://github.com/Radix-Obsidian)

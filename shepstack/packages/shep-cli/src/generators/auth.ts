/**
 * Authentication Generator
 * Generates JWT-based authentication for non-technical founders.
 */

import { writeFileSync } from "node:fs";
import { ShepSpec } from "@goldensheepai/shep-core";

export function generateAuthentication(spec: ShepSpec, outputDir: string): void {
  generateAuthPython(spec, outputDir);
  generateAuthTypeScript(spec, outputDir);
}

function generateAuthPython(spec: ShepSpec, outputDir: string): void {
  const authPython = `# Generated Authentication for ${spec.app}
# DO NOT EDIT - regenerate from .shep file
#
# JWT-based authentication with login, signup, and user management.

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# =============================================================================
# Models
# =============================================================================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AuthUser(BaseModel):
    id: str
    email: str
    name: str

# =============================================================================
# In-Memory User Storage (replace with database in production)
# =============================================================================

users_db: dict[str, dict] = {}

# =============================================================================
# Helper Functions
# =============================================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: str) -> str:
    expires = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "exp": expires,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AuthUser:
    """Dependency to get the current authenticated user."""
    user_id = decode_token(credentials.credentials)
    if not user_id or user_id not in users_db:
        raise HTTPException(status_code=401, detail="User not found")
    user = users_db[user_id]
    return AuthUser(id=user_id, email=user["email"], name=user["name"])

# =============================================================================
# Routes
# =============================================================================

@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserRegister):
    """Register a new user."""
    for user in users_db.values():
        if user["email"] == data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = secrets.token_hex(16)
    users_db[user_id] = {
        "email": data.email,
        "password_hash": hash_password(data.password),
        "name": data.name,
        "created_at": datetime.utcnow(),
    }
    
    token = create_access_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=data.email,
            name=data.name,
            created_at=users_db[user_id]["created_at"],
        )
    )

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    """Login with email and password."""
    user_id = None
    for uid, user in users_db.items():
        if user["email"] == data.email:
            user_id = uid
            break
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users_db[user_id]
    
    if not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user["email"],
            name=user["name"],
            created_at=user["created_at"],
        )
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: AuthUser = Depends(get_current_user)):
    """Get current user info."""
    user = users_db[current_user.id]
    return UserResponse(
        id=current_user.id,
        email=user["email"],
        name=user["name"],
        created_at=user["created_at"],
    )

@router.post("/logout")
async def logout(current_user: AuthUser = Depends(get_current_user)):
    """Logout (client should discard token)."""
    return {"message": "Logged out successfully"}
`;

  writeFileSync(`${outputDir}/auth.py`, authPython);
  console.log(`  ✓ ${outputDir}/auth.py`);
}

function generateAuthTypeScript(spec: ShepSpec, outputDir: string): void {
  const tokenKey = spec.app.toLowerCase().replace(/\s/g, '_') + "_auth_token";
  
  const authTS = `// Generated Authentication Client for ${spec.app}
// DO NOT EDIT - regenerate from .shep file

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// =============================================================================
// Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// =============================================================================
// Token Storage
// =============================================================================

const TOKEN_KEY = "${tokenKey}";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// =============================================================================
// Auth Functions
// =============================================================================

export async function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  const res = await fetch(\`\${API_BASE}/auth/signup\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Signup failed");
  }
  
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(\`\${API_BASE}/auth/login\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Login failed");
  }
  
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    await fetch(\`\${API_BASE}/auth/logout\`, {
      method: "POST",
      headers: { Authorization: \`Bearer \${token}\` },
    });
  }
  clearToken();
}

export async function getMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  
  const res = await fetch(\`\${API_BASE}/auth/me\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  
  if (!res.ok) {
    clearToken();
    return null;
  }
  
  return res.json();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// =============================================================================
// Auth Fetch Helper
// =============================================================================

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", \`Bearer \${token}\`);
  }
  
  return fetch(url, { ...options, headers });
}
`;

  writeFileSync(`${outputDir}/auth.ts`, authTS);
  console.log(`  ✓ ${outputDir}/auth.ts`);
}

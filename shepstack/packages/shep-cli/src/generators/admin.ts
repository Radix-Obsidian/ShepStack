/**
 * Admin Dashboard Generator
 * Generates a ready-to-use admin panel for non-technical founders.
 */

import { writeFileSync } from "node:fs";
import { ShepSpec, Field } from "@goldensheepai/shep-core";

export function generateAdminDashboard(spec: ShepSpec, outputDir: string): void {
  generateAdminHTML(spec, outputDir);
  generateMainPython(spec, outputDir);
}

function generateAdminHTML(spec: ShepSpec, outputDir: string): void {
  const entityTabs = spec.entities.map(e => 
    `<button class="tab-btn" onclick="showEntity('${e.name}')">${e.name}</button>`
  ).join('\n            ');
  
  const entityTables = spec.entities.map(e => {
    const headers = e.fields.map((f: Field) => `<th>${f.name}</th>`).join('');
    return `
      <div id="entity-${e.name}" class="entity-section" style="display: none;">
        <h2>${e.name}</h2>
        <button class="btn btn-primary" onclick="openCreateModal('${e.name}')">+ Add ${e.name}</button>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              ${headers}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="${e.name.toLowerCase()}-table-body">
          </tbody>
        </table>
      </div>
    `;
  }).join('\n');

  const entityForms = spec.entities.map(e => {
    const fields = e.fields.map((f: Field) => {
      let inputType = 'text';
      let inputHtml = '';
      
      if (f.fieldType === 'email') inputType = 'email';
      else if (f.fieldType === 'number' || f.fieldType === 'money') inputType = 'number';
      else if (f.fieldType === 'date') inputType = 'date';
      else if (f.fieldType === 'datetime') inputType = 'datetime-local';
      else if (f.fieldType === 'boolean') inputType = 'checkbox';
      
      if (f.fieldType === 'enum' && f.enumValues) {
        const options = f.enumValues.map((v: string) => `<option value="${v}">${v}</option>`).join('');
        inputHtml = `<select name="${f.name}" ${f.required ? 'required' : ''}>${options}</select>`;
      } else if (f.fieldType === 'boolean') {
        inputHtml = `<input type="checkbox" name="${f.name}">`;
      } else {
        inputHtml = `<input type="${inputType}" name="${f.name}" ${f.required ? 'required' : ''}>`;
      }
      
      return `
        <div class="form-group">
          <label>${f.name}${f.required ? ' *' : ''}</label>
          ${inputHtml}
        </div>
      `;
    }).join('');
    
    return `
      <div id="form-${e.name}" class="modal" style="display: none;">
        <div class="modal-content">
          <h3>Add ${e.name}</h3>
          <form onsubmit="createEntity('${e.name}', event)">
            ${fields}
            <div class="form-actions">
              <button type="button" onclick="closeModal('${e.name}')">Cancel</button>
              <button type="submit" class="btn-primary">Create</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }).join('\n');

  const entitiesJson = JSON.stringify(spec.entities.map(e => ({ 
    name: e.name, 
    fields: e.fields.map((f: Field) => f.name) 
  })));

  const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.app} - Admin Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 40px; }
    .header h1 { font-size: 24px; }
    .header p { opacity: 0.8; margin-top: 4px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .tab-btn { padding: 10px 20px; border: none; background: white; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
    .tab-btn:hover { background: #667eea; color: white; }
    .tab-btn.active { background: #667eea; color: white; }
    .entity-section { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .entity-section h2 { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    tr:hover { background: #f8f9fa; }
    .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-primary { background: #667eea; color: white; }
    .btn-danger { background: #e53e3e; color: white; }
    .btn-sm { padding: 4px 8px; font-size: 12px; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 24px; border-radius: 12px; width: 100%; max-width: 500px; }
    .modal-content h3 { margin-bottom: 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    .form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-card h3 { font-size: 32px; color: #667eea; }
    .stat-card p { color: #666; margin-top: 4px; }
    .empty { text-align: center; padding: 40px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐑 ${spec.app} Admin</h1>
    <p>Manage your application data</p>
  </div>
  
  <div class="container">
    <div class="stats" id="stats"></div>
    
    <div class="tabs">
      ${entityTabs}
    </div>
    
    ${entityTables}
    ${entityForms}
  </div>

  <script>
    const API_BASE = '/api';
    const entities = ${entitiesJson};
    
    // Show first entity by default
    if (entities.length > 0) {
      document.addEventListener('DOMContentLoaded', () => {
        const firstBtn = document.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
      });
    }
    
    loadStats();
    
    function showEntity(name) {
      document.querySelectorAll('.entity-section').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      
      document.getElementById('entity-' + name).style.display = 'block';
      event.target.classList.add('active');
      
      loadEntityData(name);
    }
    
    async function loadStats() {
      const statsHtml = await Promise.all(entities.map(async (e) => {
        try {
          const res = await fetch(API_BASE + '/' + e.name.toLowerCase() + 's');
          const data = await res.json();
          return '<div class="stat-card"><h3>' + data.length + '</h3><p>' + e.name + 's</p></div>';
        } catch {
          return '<div class="stat-card"><h3>0</h3><p>' + e.name + 's</p></div>';
        }
      }));
      document.getElementById('stats').innerHTML = statsHtml.join('');
    }
    
    async function loadEntityData(name) {
      const entity = entities.find(e => e.name === name);
      const tbody = document.getElementById(name.toLowerCase() + '-table-body');
      
      try {
        const res = await fetch(API_BASE + '/' + name.toLowerCase() + 's');
        const data = await res.json();
        
        if (data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="' + (entity.fields.length + 2) + '" class="empty">No ' + name.toLowerCase() + 's yet. Click + Add to create one.</td></tr>';
          return;
        }
        
        tbody.innerHTML = data.map((item, idx) => {
          const cells = entity.fields.map(f => '<td>' + (item[f] ?? '-') + '</td>').join('');
          const id = item.id || idx;
          return '<tr><td>' + id + '</td>' + cells + '<td><button class="btn btn-danger btn-sm" onclick="deleteEntity(\\'' + name + '\\', \\'' + id + '\\')">Delete</button></td></tr>';
        }).join('');
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="' + (entity.fields.length + 2) + '" class="empty">Error loading data</td></tr>';
      }
    }
    
    function openCreateModal(name) {
      document.getElementById('form-' + name).style.display = 'flex';
    }
    
    function closeModal(name) {
      document.getElementById('form-' + name).style.display = 'none';
    }
    
    async function createEntity(name, event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        data[cb.name] = cb.checked;
      });
      
      try {
        const res = await fetch(API_BASE + '/' + name.toLowerCase() + 's', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!res.ok) throw new Error('Failed to create');
        
        closeModal(name);
        loadEntityData(name);
        loadStats();
        form.reset();
      } catch (err) {
        alert('Error creating ' + name + ': ' + err.message);
      }
    }
    
    async function deleteEntity(name, id) {
      if (!confirm('Are you sure you want to delete this ' + name + '?')) return;
      
      try {
        const res = await fetch(API_BASE + '/' + name.toLowerCase() + 's/' + id, {
          method: 'DELETE',
        });
        
        if (!res.ok) throw new Error('Failed to delete');
        
        loadEntityData(name);
        loadStats();
      } catch (err) {
        alert('Error deleting ' + name + ': ' + err.message);
      }
    }
  </script>
</body>
</html>
`;

  writeFileSync(`${outputDir}/admin.html`, adminHtml);
  console.log(`  ✓ ${outputDir}/admin.html`);
}

function generateMainPython(spec: ShepSpec, outputDir: string): void {
  const mainPy = `# Generated FastAPI Application for ${spec.app}
# DO NOT EDIT - regenerate from .shep file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from .routes import router
from .auth import router as auth_router
import os

app = FastAPI(
    title="${spec.app}",
    description="Generated by Shep - AI-powered code generation",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api")
app.include_router(auth_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "app": "${spec.app}",
        "message": "Welcome to ${spec.app} API",
        "docs": "/docs",
        "admin": "/admin",
    }

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy"}

# Admin dashboard
@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard():
    admin_path = os.path.join(os.path.dirname(__file__), "admin.html")
    with open(admin_path, "r") as f:
        return f.read()
`;

  writeFileSync(`${outputDir}/main.py`, mainPy);
  console.log(`  ✓ ${outputDir}/main.py`);
}

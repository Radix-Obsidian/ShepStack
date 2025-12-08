/**
 * ShepLang Language Server Protocol Implementation
 *
 * Provides IDE support for ShepLang:
 * - Diagnostics (parse errors, verification warnings)
 * - Go to Definition
 * - Find References  
 * - Hover Information
 * - Code Completion
 *
 * "Tooling IS the product" — Anders Hejlsberg mindset
 */

import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  Definition,
  Location,
  Range,
  Position,
  Hover,
  MarkupContent,
  MarkupKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { parseSpec, verifySpec, ShepSpec } from "@shep/core";

// =============================================================================
// Server Setup
// =============================================================================

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Cache of parsed specs per document
const specCache: Map<string, { spec: ShepSpec; version: number } | null> = new Map();

// =============================================================================
// Initialization
// =============================================================================

connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [":", ".", "(", " "],
      },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
    },
  };
});

// =============================================================================
// Document Management
// =============================================================================

documents.onDidChangeContent((change) => {
  validateDocument(change.document);
});

documents.onDidClose((event) => {
  specCache.delete(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// =============================================================================
// Diagnostics
// =============================================================================

async function validateDocument(document: TextDocument): Promise<void> {
  const text = document.getText();
  const diagnostics: Diagnostic[] = [];

  try {
    // Parse the document
    const parseResult = parseSpec(text, document.uri);

    if (!parseResult.success || !parseResult.spec) {
      // Convert parse errors to diagnostics
      for (const error of parseResult.errors) {
        const line = error.location?.line ? error.location.line - 1 : 0;
        const column = error.location?.column ? error.location.column - 1 : 0;

        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line, character: column },
            end: { line, character: column + 10 },
          },
          message: error.message,
          source: "sheplang",
        });

        // Add suggestion if available
        if (error.suggestion) {
          diagnostics.push({
            severity: DiagnosticSeverity.Hint,
            range: {
              start: { line, character: column },
              end: { line, character: column + 10 },
            },
            message: `💡 ${error.suggestion}`,
            source: "sheplang",
          });
        }
      }
      specCache.set(document.uri, null);
    } else {
      // Parse succeeded, now verify
      const verification = verifySpec(parseResult.spec);
      specCache.set(document.uri, { spec: parseResult.spec, version: document.version });

      // Convert verification issues to diagnostics
      for (const issue of verification.issues) {
        const line = issue.location?.line ? issue.location.line - 1 : 0;
        const column = issue.location?.column ? issue.location.column - 1 : 0;

        let severity: DiagnosticSeverity;
        switch (issue.severity) {
          case "error":
            severity = DiagnosticSeverity.Error;
            break;
          case "warning":
            severity = DiagnosticSeverity.Warning;
            break;
          default:
            severity = DiagnosticSeverity.Information;
        }

        diagnostics.push({
          severity,
          range: {
            start: { line, character: column },
            end: { line, character: column + 10 },
          },
          message: `[${issue.code}] ${issue.message}`,
          source: "sheplang",
        });

        // Add suggestion if available
        if (issue.suggestion) {
          diagnostics.push({
            severity: DiagnosticSeverity.Hint,
            range: {
              start: { line, character: column },
              end: { line, character: column + 10 },
            },
            message: `💡 ${issue.suggestion}`,
            source: "sheplang",
          });
        }
      }
    }
  } catch (error) {
    // Catch unexpected errors
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 },
      },
      message: `Internal error: ${(error as Error).message}`,
      source: "sheplang",
    });
  }

  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

// =============================================================================
// Go to Definition
// =============================================================================

connection.onDefinition((params: TextDocumentPositionParams): Definition | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const cached = specCache.get(params.textDocument.uri);
  if (!cached?.spec) return null;

  const spec = cached.spec;
  const text = document.getText();
  const offset = document.offsetAt(params.position);

  // Find the word at cursor
  const word = getWordAtOffset(text, offset);
  if (!word) return null;

  // Search for definition in entities
  for (const entity of spec.entities) {
    if (entity.name === word && entity.location) {
      return Location.create(params.textDocument.uri, {
        start: { line: entity.location.line - 1, character: 0 },
        end: { line: entity.location.line - 1, character: entity.name.length + 10 },
      });
    }
  }

  // Search for definition in screens
  for (const screen of spec.screens) {
    if (screen.name === word && screen.location) {
      return Location.create(params.textDocument.uri, {
        start: { line: screen.location.line - 1, character: 0 },
        end: { line: screen.location.line - 1, character: screen.name.length + 10 },
      });
    }
  }

  // Search for definition in flows
  for (const flow of spec.flows) {
    if (flow.name === word && flow.location) {
      return Location.create(params.textDocument.uri, {
        start: { line: flow.location.line - 1, character: 0 },
        end: { line: flow.location.line - 1, character: flow.name.length + 10 },
      });
    }
  }

  return null;
});

// =============================================================================
// Find References
// =============================================================================

connection.onReferences((params): Location[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const cached = specCache.get(params.textDocument.uri);
  if (!cached?.spec) return [];

  const spec = cached.spec;
  const text = document.getText();
  const offset = document.offsetAt(params.position);

  // Find the word at cursor
  const word = getWordAtOffset(text, offset);
  if (!word) return [];

  const references: Location[] = [];

  // Find all references to this name in the document
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let searchStart = 0;
    while (true) {
      const index = line.indexOf(word, searchStart);
      if (index === -1) break;

      // Check word boundaries
      const before = index > 0 ? line[index - 1] : " ";
      const after = index + word.length < line.length ? line[index + word.length] : " ";
      
      if (!/\w/.test(before) && !/\w/.test(after)) {
        references.push(
          Location.create(params.textDocument.uri, {
            start: { line: i, character: index },
            end: { line: i, character: index + word.length },
          })
        );
      }

      searchStart = index + 1;
    }
  }

  return references;
});

// =============================================================================
// Hover Information
// =============================================================================

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const cached = specCache.get(params.textDocument.uri);
  if (!cached?.spec) return null;

  const spec = cached.spec;
  const text = document.getText();
  const offset = document.offsetAt(params.position);

  // Find the word at cursor
  const word = getWordAtOffset(text, offset);
  if (!word) return null;

  // Check if it's a keyword
  const keywordDocs: Record<string, string> = {
    app: "**app** - Declares the program name\n\n```shep\napp \"MyApp\"\n```",
    data: "**data** - Defines a data model\n\nCompiles to:\n- Python: Pydantic model\n- TypeScript: interface\n- SQL: table",
    view: "**view** - Defines a UI component\n\nCompiles to React components",
    action: "**action** - Defines business logic\n\nCompiles to API endpoints",
    task: "**task** - Defines background processes\n\nCompiles to async jobs",
    ai: "**ai()** - AI as a language primitive\n\nThe key differentiator of ShepLang.\n\n```shep\nsentiment: ai(\"classify as positive, neutral, negative\")\n```",
    entity: "**entity** - Defines a data model (legacy, prefer `data`)",
    screen: "**screen** - Defines a UI (legacy, prefer `view`)",
    flow: "**flow** - Defines a user journey (legacy, prefer `action` or `task`)",
    rule: "**rule** - Defines a business constraint",
  };

  if (keywordDocs[word]) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: keywordDocs[word],
      },
    };
  }

  // Check if it's a type
  const typeDocs: Record<string, string> = {
    text: "**text** - String type\n\nPython: `str`\nTypeScript: `string`\nSQL: `TEXT`",
    number: "**number** - Numeric type\n\nPython: `int | float`\nTypeScript: `number`\nSQL: `NUMERIC`",
    money: "**money** - Decimal currency\n\nPython: `Decimal`\nTypeScript: `number`\nSQL: `DECIMAL(10,2)`",
    email: "**email** - Email address\n\nValidated format. Python: `EmailStr`",
    date: "**date** - Date only\n\nPython: `date`\nTypeScript: `string`\nSQL: `DATE`",
    datetime: "**datetime** - Date and time\n\nPython: `datetime`\nTypeScript: `string`\nSQL: `TIMESTAMP`",
    boolean: "**boolean** - True/false\n\nPython: `bool`\nTypeScript: `boolean`\nSQL: `BOOLEAN`",
    uuid: "**uuid** - Unique identifier\n\nPython: `UUID`\nTypeScript: `string`\nSQL: `UUID`",
    required: "**required** - Field must have a value",
    unique: "**unique** - Value must be unique across all records",
    computed: "**computed** - Field is derived from other fields",
  };

  if (typeDocs[word]) {
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: typeDocs[word],
      },
    };
  }

  // Check if it's an entity name
  for (const entity of spec.entities) {
    if (entity.name === word) {
      const fields = entity.fields.map((f) => `- **${f.name}**: ${f.fieldType}${f.required ? " (required)" : ""}`).join("\n");
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**data ${entity.name}**\n\nFields:\n${fields}`,
        },
      };
    }
  }

  return null;
});

// =============================================================================
// Code Completion
// =============================================================================

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const lines = text.split("\n");
  const line = lines[params.position.line] || "";
  const prefix = line.substring(0, params.position.character);

  const completions: CompletionItem[] = [];

  // Top-level keywords
  if (prefix.trim() === "" || /^\s*$/.test(prefix)) {
    completions.push(
      { label: "app", kind: CompletionItemKind.Keyword, detail: "Declare program name" },
      { label: "data", kind: CompletionItemKind.Keyword, detail: "Define a data model" },
      { label: "view", kind: CompletionItemKind.Keyword, detail: "Define a UI component" },
      { label: "action", kind: CompletionItemKind.Keyword, detail: "Define business logic" },
      { label: "task", kind: CompletionItemKind.Keyword, detail: "Define a background process" },
      { label: "rule", kind: CompletionItemKind.Keyword, detail: "Define a business constraint" },
      { label: "integration", kind: CompletionItemKind.Keyword, detail: "Declare external service" }
    );
  }

  // After colon (type position)
  if (prefix.endsWith(":") || prefix.match(/:\s*$/)) {
    completions.push(
      { label: "text", kind: CompletionItemKind.TypeParameter, detail: "String type" },
      { label: "number", kind: CompletionItemKind.TypeParameter, detail: "Numeric type" },
      { label: "money", kind: CompletionItemKind.TypeParameter, detail: "Decimal currency" },
      { label: "email", kind: CompletionItemKind.TypeParameter, detail: "Email address" },
      { label: "date", kind: CompletionItemKind.TypeParameter, detail: "Date only" },
      { label: "datetime", kind: CompletionItemKind.TypeParameter, detail: "Date and time" },
      { label: "boolean", kind: CompletionItemKind.TypeParameter, detail: "True/false" },
      { label: "uuid", kind: CompletionItemKind.TypeParameter, detail: "Unique identifier" },
      { label: "enum()", kind: CompletionItemKind.TypeParameter, detail: "Fixed set of values" },
      { label: "ai(\"\")", kind: CompletionItemKind.Function, detail: "AI-computed field" }
    );
  }

  // Inside parentheses (modifiers)
  if (prefix.includes("(") && !prefix.includes(")")) {
    completions.push(
      { label: "required", kind: CompletionItemKind.Keyword, detail: "Field must have value" },
      { label: "unique", kind: CompletionItemKind.Keyword, detail: "Value must be unique" },
      { label: "computed", kind: CompletionItemKind.Keyword, detail: "Derived field" },
      { label: "min=", kind: CompletionItemKind.Property, detail: "Minimum value" },
      { label: "max=", kind: CompletionItemKind.Property, detail: "Maximum value" },
      { label: "default=", kind: CompletionItemKind.Property, detail: "Default value" }
    );
  }

  // Add entity names from spec for relationships
  const cached = specCache.get(params.textDocument.uri);
  if (cached?.spec) {
    for (const entity of cached.spec.entities) {
      completions.push({
        label: entity.name,
        kind: CompletionItemKind.Class,
        detail: `Relationship to ${entity.name}`,
      });
    }
  }

  return completions;
});

connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  return item;
});

// =============================================================================
// Utility Functions
// =============================================================================

function getWordAtOffset(text: string, offset: number): string | null {
  // Find word boundaries
  let start = offset;
  let end = offset;

  while (start > 0 && /\w/.test(text[start - 1])) {
    start--;
  }

  while (end < text.length && /\w/.test(text[end])) {
    end++;
  }

  if (start === end) return null;
  return text.substring(start, end);
}

// =============================================================================
// Start Server
// =============================================================================

documents.listen(connection);
connection.listen();

// Export for testing
export { connection, documents, validateDocument };

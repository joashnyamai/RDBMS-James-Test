# James Nyamai RDBMS Implementation

A fully functional in-memory relational database management system (RDBMS) built from scratch in TypeScript, with SQL-like query language support and an interactive REPL interface.

## Features

### Core Functionality
- **Table Management**: CREATE TABLE and DROP TABLE operations
- **Data Types**: Support for string, number, and boolean column types
- **Constraints**: Primary keys and unique constraints with automatic indexing
- **CRUD Operations**: Full support for INSERT, SELECT, UPDATE, and DELETE
- **Query Filtering**: WHERE clause with comparison operators (=, !=, >, <, >=, <=)
- **Joins**: INNER JOIN and LEFT JOIN support
- **Indexing**: Hash-based indexing for primary keys and unique constraints
- **Schema Validation**: Type checking and constraint enforcement
- **Interactive REPL**: Console interface for executing SQL queries

### SQL-like Syntax

The RDBMS supports a SQL-like query language:

```sql
-- Table Management
CREATE TABLE users (id number PRIMARY KEY, name string NOT NULL, age number)
DROP TABLE users
SHOW TABLES
DESCRIBE users

-- Data Manipulation
INSERT INTO users (id, name, age) VALUES (1, 'Alice', 30)
SELECT * FROM users
SELECT name, age FROM users WHERE age > 25
UPDATE users SET age = 31 WHERE id = 1
DELETE FROM users WHERE age < 18

-- Joins
SELECT * FROM books INNER JOIN authors ON books.author_id = authors.id
SELECT * FROM books LEFT JOIN authors ON books.author_id = authors.id
```

## Architecture

### Core Components

#### 1. **Database** (`src/rdbms/Database.ts`)
- Manages multiple tables
- Validates table schemas
- Enforces primary key constraints

#### 2. **Table** (`src/rdbms/Table.ts`)
- Stores rows with schema validation
- Maintains indexes for primary keys and unique constraints
- Implements CRUD operations with type checking
- Handles constraint validation

#### 3. **Index** (`src/rdbms/Index.ts`)
- Hash-based indexing structure
- Fast lookups for primary keys and unique constraints
- Maintains referential integrity

#### 4. **QueryParser** (`src/rdbms/QueryParser.ts`)
- Parses SQL-like query strings
- Supports DDL (CREATE, DROP) and DML (INSERT, SELECT, UPDATE, DELETE)
- Handles WHERE clauses and JOIN operations
- Validates query syntax

#### 5. **QueryExecutor** (`src/rdbms/QueryExecutor.ts`)
- Executes parsed queries
- Implements join algorithms (nested loop join)
- Performs predicate evaluation for WHERE clauses
- Returns structured results

#### 6. **REPL** (`src/rdbms/REPL.ts`)
- Interactive console interface
- Query history tracking
- Formatted table output
- Error reporting

### Data Flow

```
SQL Query String
    ↓
QueryParser (parses syntax)
    ↓
ParsedQuery (AST-like structure)
    ↓
QueryExecutor (executes operation)
    ↓
Database/Table (data storage)
    ↓
QueryResult (formatted response)
    ↓
REPL (display output)
```

## Implementation Details

### Indexing Strategy

The RDBMS uses hash-based indexing for:
- Primary key columns (enforces uniqueness and enables fast lookups)
- UNIQUE constraint columns (enforces uniqueness)

Indexes map values to row positions for O(1) average-case lookup performance.

### Join Implementation

Joins are implemented using a nested loop algorithm:
1. Iterate through left table rows
2. For each left row, scan right table for matching join condition
3. Combine matching rows with qualified column names (table.column)
4. For LEFT JOIN, include unmatched left rows with null right values

### Type System

Three primitive types are supported:
- `string`: Text data
- `number`: Numeric data (integers and floats)
- `boolean`: True/false values

Type validation occurs at:
- Table creation (schema definition)
- Row insertion (value validation)
- Row update (value validation)

### Constraint Enforcement

**Primary Keys:**
- Enforced as unique and not null
- Automatically indexed
- One primary key per table

**Unique Constraints:**
- Enforced through indexing
- Allows null values
- Multiple unique constraints per table

**NOT NULL:**
- Validated on insert and update
- Prevents null value assignment

## Demo Application

The demo web application showcases the RDBMS with a library management system:

### Features
- **Authors Management**: Add, view, and delete authors
- **Books Management**: Add, view, update availability, and delete books
- **SQL Console**: Interactive REPL for executing custom queries
- **Live Updates**: Changes via UI or SQL console sync in real-time

### Example Queries

```sql
-- View all books with their authors (JOIN)
SELECT * FROM books INNER JOIN authors ON books.author_id = authors.id

-- Find available books
SELECT title, year FROM books WHERE available = true

-- Update book availability
UPDATE books SET available = false WHERE id = 1

-- Find books by a specific author
SELECT title FROM books WHERE author_id = 2

-- Delete an author (will fail if they have books)
DELETE FROM authors WHERE id = 3
```

## Technical Specifications

### Limitations
- **In-memory storage**: Data is not persisted to disk
- **Single-threaded**: No concurrent transaction support
- **Simple indexing**: Hash-based only (no B-tree or composite indexes)
- **Basic joins**: Nested loop algorithm (not optimized for large datasets)
- **No transactions**: No ACID guarantees or rollback support
- **Limited aggregations**: No GROUP BY, COUNT, SUM, etc.
- **Single table joins**: No multi-table join support

### Strengths
- **Type safety**: Full TypeScript implementation
- **Schema validation**: Strict type and constraint checking
- **Clean architecture**: Well-separated concerns
- **Extensible design**: Easy to add new features
- **Educational value**: Clear implementation for learning

## Code Organization

```
src/rdbms/
├── types.ts           # TypeScript type definitions
├── Index.ts           # Hash-based indexing structure
├── Table.ts           # Table storage and operations
├── Database.ts        # Database container
├── QueryParser.ts     # SQL parser
├── QueryExecutor.ts   # Query execution engine
├── REPL.ts           # Interactive console
├── RDBMS.ts          # Main API facade
└── index.ts          # Public exports

src/components/
├── SQLConsole.tsx    # REPL UI component
└── BookManager.tsx   # Demo CRUD interface

src/
└── App.tsx           # Main application
```

## Credits

This RDBMS implementation was created from scratch as a demonstration of:
- Database fundamentals (tables, indexes, constraints)
- Query parsing and execution
- TypeScript design patterns
- React integration

All code is original and built specifically for this project to showcase understanding of relational database concepts and implementation techniques.

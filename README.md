# Dolfin

## Getting Started

### Prerequisites

- [mise](https://github.com/jdx/mise): Manage dev environment.

Or

- [Node.js](https://nodejs.org/en/download/): JavaScript runtime. Version 24.
- [pnpm](https://pnpm.io/installation): Fast, disk space efficient package manager. Version 10.

### Installation

Setup the dev environment:

```bash
mise install
```

Install dependencies:

```bash
pnpm install
```

Run the frontend:

```bash
pnpm --filter frontend dev
```

Run the backend:

```bash
pnpm --filter backend dev
```

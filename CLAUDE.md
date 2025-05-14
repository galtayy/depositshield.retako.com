# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- **Backend Development**: `cd backend && npm run dev`
- **Frontend Development**: `cd frontend && npm run dev`
- **Backend Production**: `cd backend && npm start`
- **Frontend Production**: `cd frontend && npm run build && npm start`
- **Frontend Lint**: `cd frontend && npm run lint`

## Code Style Guidelines
- **Imports**: Group imports by type (React, third-party, local) and alphabetically within groups
- **Formatting**: Use 2-space indentation for both JavaScript and JSX
- **Error Handling**: Use try/catch blocks with specific error logging; use publicApi for anonymous endpoints
- **State Management**: Use React hooks (useState, useEffect) for component state
- **API Calls**: Use the api.js service with appropriate interceptors
- **React Components**: Use functional components with hooks
- **Naming**: Use camelCase for variables/functions, PascalCase for components/classes
- **File Structure**: Follow the existing project organization (components/, lib/, pages/)
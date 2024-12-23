# BrainPower

An AI-powered blockchain agent that can interact with the Solana blockchain. Built with OpenAI's Assistant API and solana-agent-kit.

## Project Structure

This is a monorepo using Turborepo and PNPM workspaces containing:

- `apps/frontend`: Next.js web interface
- `apps/backend`: Express.js API server with AI capabilities

## Features

- AI Assistant powered by OpenAI's Assistant API
- Interactive web interface for natural language interactions
- Core Solana blockchain capabilities:
  - Balance checking for SOL and SPL tokens
  - Transaction execution and monitoring
  - Tool-based architecture for easy extensibility
- Autonomous decision making with:
  - Proactive transaction execution
  - Smart defaults and assumptions
  - Contextual memory of past transactions
  - Technical error explanations

## Prerequisites

- Node.js (v18 or higher)
- PNPM package manager
- TypeScript
- An OpenAI API key
- A wallet private key for the agent

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/aryan877/brainpower
cd brainpower
```

2. Install dependencies:

```bash
pnpm install
```

3. Create `.env` files in respective app directories:

For backend (`apps/backend/.env`):

```
OPENAI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_wallet_private_key
PORT=3001
```

For frontend (`apps/frontend/.env`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run the development environment:

```bash
pnpm dev
```

This will start both the backend (on port 3001) and frontend (on port 3000) in development mode.

## Development Commands

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications

## Acknowledgments

Initial project structure inspired by jarrodwatts/onchain-agent. Built for the Solana AI Hackathon.

## License

MIT License

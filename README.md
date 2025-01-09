# BrainPower

An AI-powered blockchain agent that can interact with the Solana blockchain. Built with OpenAI's Assistant API and solana-agent-kit.

## Features

- 🤖 AI Assistant powered by OpenAI's Assistant API
- 🌐 Interactive web interface for natural language interactions
- ⛓️ Core Solana blockchain capabilities:
  - Balance checking for SOL and SPL tokens
  - Transaction execution and monitoring
  - Tool-based architecture for easy extensibility
- 🧠 Autonomous decision making with:
  - Proactive transaction execution
  - Smart defaults and assumptions
  - Contextual memory of past transactions
  - Technical error explanations
- ⚡ Enhanced RPC capabilities via Helius:
  - High-performance RPC endpoints
  - Advanced transaction indexing
  - Rich NFT metadata
  - WebSocket support
  - DAS (Digital Asset Standard) compliance

## Project Structure

This is a monorepo using Turborepo and Yarn workspaces containing:

- `apps/frontend`: Next.js web interface
- `apps/backend`: Express.js API server with AI capabilities

## Prerequisites

- Node.js (v23.1.0 or higher)
- Yarn package manager
- TypeScript
- An OpenAI API key
- A Helius API key (required for RPC access)
- A wallet private key for the agent

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/aryan877/brainpower
cd brainpower
```

2. Install dependencies:

```bash
yarn install
```

3. Create `.env` files in respective app directories:

For backend (`apps/backend/.env`):

```
OPENAI_API_KEY=your_openai_api_key
PRIVATE_KEY_BASE58=your_wallet_private_key
HELIUS_API_KEY=your_helius_api_key  # Required for RPC access
PORT=5000
```

For frontend (`apps/frontend/.env`):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## RPC Configuration

This project uses Helius RPC for enhanced Solana network capabilities. The RPC endpoint is automatically configured using your Helius API key:

```typescript
const heliusRpcUrl = `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
```

To get a Helius API key:

1. Visit [dev.helius.xyz](https://dev.helius.xyz)
2. Create an account and generate an API key
3. Add the API key to your backend `.env` file as `HELIUS_API_KEY`

### Why Helius?

- 🚀 Superior performance compared to public RPC endpoints
- 📊 Advanced indexing for faster queries
- 🖼️ Rich NFT metadata support
- 🔌 WebSocket capabilities for real-time updates
- 📜 DAS compliance for standardized asset handling
- 💪 Production-ready infrastructure

## Development

Start the development environment:

```bash
yarn dev
```

This will start both the backend (port 5000) and frontend (port 3000) in development mode.

### Available Commands

- `yarn dev` - Start all applications in development mode
- `yarn build` - Build all applications
- `yarn lint` - Lint all applications
- `yarn test` - Run test suites (if configured)

## Architecture

```
brainpower/
├── apps/
│   ├── frontend/    # Next.js web interface
│   └── backend/     # Express.js + AI server
├── packages/        # Shared packages
└── turbo.json      # Turborepo configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Initial project structure inspired by jarrodwatts/onchain-agent
- Built for the Solana AI Hackathon
- Powered by OpenAI's Assistant API
- Enhanced by Helius RPC services

## License

MIT License

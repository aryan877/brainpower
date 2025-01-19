# BrainPower

An AI-powered blockchain agent that can interact with the Solana blockchain. Built with OpenAI's Assistant API and solana-agent-kit.

## Features

- AI Assistant powered by [OpenAI's Assistant API](https://platform.openai.com/docs/assistants/overview) with a based, technically-focused personality
- Interactive CLI chat interface for natural language interactions
- Core Solana blockchain capabilities through [solana-agent-kit](https://www.npmjs.com/package/solana-agent-kit):
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
npm install
```

3. Create the `.env` file and add your OpenAI API key and wallet private key:

```bash
OPENAI_API_KEY=your_openai_api_key
PRIVATE_KEY=your_wallet_private_key
```

4. Run the agent:

```bash
npm start
```

## Acknowledgments

Initial project structure inspired by [jarrodwatts/onchain-agent](https://github.com/jarrodwatts/onchain-agent). Built for the Solana AI Hackathon.

## License

MIT License

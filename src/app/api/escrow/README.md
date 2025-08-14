# SafeRelay Escrow API Endpoints

## Core Endpoints

### POST /api/escrow/create
Creates a new escrow (pending or with smart contract deployment).

**Request Body:**
- `amountUsd` (number, required): Amount in USD
- `payerEmail` (string, required): Payer's email
- `recipientEmail` (string, required): Recipient's email
- `initiatorRole` (string, required): 'payer' or 'recipient'
- `initiatorWallet` (string, optional): Initiator's wallet address
- `description` (string, optional): Escrow description
- `recipientWallet` (string, optional): Recipient's wallet address
- `deployContract` (boolean, optional): Whether to deploy smart contract immediately
- `contractType` (string, optional): 'saferelay' | 'factoryV2' | 'none'
- `testMode` (boolean, optional): Force test mode

### POST /api/escrow/approve
Approves fund release for an escrow.

**Request Body:**
- `escrowId` (string, required): Escrow ID
- `userEmail` (string, required): User's email

### POST /api/escrow/cancel
Handles cancellation requests.

**Request Body:**
- `escrowId` (string, required): Escrow ID
- `userEmail` (string, required): User's email
- `action` (string, required): 'request' or 'withdraw'

### POST /api/escrow/prepare-funding
Prepares parameters for Transak funding widget.

**Request Body:**
- `escrowId` (string, required): Escrow ID

## Archived Endpoints
All legacy endpoints have been moved to `_archived/` directory for reference.

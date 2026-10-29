# Privacy Policy

## Introduction

Windmill Exchange (**"the Interface"**) is a permissionless, non-custodial web interface for the Windmill auction-based matching protocol. It is committed to protecting your privacy and providing a transparent, user-friendly, and decentralized experience.

This Privacy Policy explains how Windmill Exchange handles information when you use the Interface at windmill-evm-web.vercel.app.

Windmill Exchange follows a privacy-conscious and local-first approach. We do **not** operate accounts, do **not** collect personal information, and do **not** process information on remote servers we control. Where possible, information is processed locally in your browser, and all protocol operations happen directly against public blockchains.

## Information and Permissions

Windmill Exchange is a static, client-rendered dapp. It does not require registration, login, or an account.

Depending on the features you use, the Interface may access the following information through your own Web3 wallet (MetaMask, Rabby, Coinbase Wallet, or another injected provider):

- **Wallet public address** — read from your browser's connected wallet extension to display your address in the Interface and to sign/send on-chain transactions.
- **Selected network / chain state** — the currently active chain and UI preferences (for example, the displayed target network and recent history filter states).
- **Blockchain and public RPC data** — token pairs, prices, and curve state, queried from public RPC endpoints and public explorers.

The Interface does **not** attempt to access device permissions such as location, camera, microphone, contacts, or health data.

Information accessed by the Interface is used only to provide the functionality described in this Privacy Policy. You can disconnect your wallet at any time from the Interface; disconnecting does not affect the public state of the blockchain.

## Data Storage

Windmill Exchange is designed to minimize the storage and transmission of personal information.

- The Interface stores browser `localStorage` data **only** to remember UI preferences, such as the selected target network and recent transaction history filter states. No private keys, seed phrases, or wallet credentials are ever handled, stored, or transmitted by Windmill Exchange.
- The project is deployed as a static frontend on Vercel; Vercel's standard hosting (including any standard access/error logs) is governed by Vercel's own privacy policy.
- The optional keepers page exposes a development-only API route (`/api/keeper`) that may spawn a local keeper process. Its status and logs are held **in-memory only**, are never persisted to disk, and are not sent to any third party.
- There are no user accounts, no authentication service, no user-generated-content database, and no cloud storage controlled by Windmill Exchange.

## Data Sharing

Windmill Exchange does not sell your personal information.

We do not use personal information for targeted advertising, and we do not maintain any advertising or analytics infrastructure.

- No tracking cookies or cross-site analytics scripts are used.
- Where information is held locally in your browser, it is not shared with third parties by the Interface.
- RPC and subgraph queries are sent directly from your browser to public RPC provider endpoints and public explorer APIs. Any information transmitted is limited to what is necessary for that functionality (for example, reading public contract state or resolving an address on a chain explorer).

## Third-Party Services

Windmill Exchange may rely on the following third-party services to provide certain features:

- **Web3 wallet extensions** (MetaMask, Rabby, Coinbase Wallet, and similar) — for reading your public address and signing/relaying your transactions. Their handling of your information is governed by their own privacy policies and terms of service.
- **Public RPC providers** and **block explorers** — for reading on-chain data. Their handling of requests is governed by their respective policies.
- **Vercel** — for hosting of the public website and any standard hosting logs.
- **GitHub (StabilityNexus)** — for source code distribution and issue reporting.

## Data Security

Windmill Exchange minimizes privacy and security risk by not collecting personal information and by processing information locally in your browser and on public blockchains.

However, no method of electronic storage or transmission can be guaranteed to be completely secure. Users are responsible for:

- Maintaining the security of their devices, wallets, and private keys.
- Protecting any data they choose to export, share, or otherwise make available.
- Confirm their own understanding of Web3 security practices (see the Terms of Use page).

## Data Deletion

Because windmill exchange does not store your personal information on servers it controls, there is nothing to delete server-side.

- **Browser preferences:** Clear your browser's `localStorage` for the site (or use your browser's site-data settings) to remove locally stored UI preferences.
- **Wallet connection:** Disconnect your wallet from the Interface; this never affects blockchain state.
- **On-chain data:** Transactions and orders are public and immutable on the blockchain. Once broadcast, they cannot be deleted or altered by Windmill Exchange or by you.

## Data Export

The Interface may display on-chain and wallet data that is publicly verifiable. Public blockchain data can be exported or reviewed by anyone through block explorers, independently of Windmill Exchange. Windmill Exchange does not create or store personal data export files.

## Children's Privacy

Windmill Exchange is not intended to knowingly collect personal information from children where such collection is prohibited by applicable law. The Interface does not collect personal information from anyone, including children.

## Free Access

Windmill Exchange is free and permissionless. Its core functionality — browsing the exchange, connecting a wallet, and interacting with the matching protocol on supported EVM chains — is available without any subscription or payment to Windmill Exchange. Any blockchain network fees (e.g., gas) are paid by the user directly to the network and are not collected by Windmill Exchange.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes to the Interface, its functionality, or applicable legal requirements.

Any updates will be made available wherever this Privacy Policy is published (in this file and on the `/privacy` page of the Interface).

## Contact Us

If you have any questions or concerns about this Privacy Policy or Windmill Exchange's privacy practices, please reach out via:

- **Discord:** the `#windmill-exchange` channel of the Stability Nexus community
- **GitHub:** [StabilityNexus/Windmill-EVM-WebUI](https://github.com/StabilityNexus/Windmill-EVM-WebUI) (issues)
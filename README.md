# RPG-Maker-Base-Integration
Coinbase Wallet Plugin for RPG Maker MZ – Integrate blockchain functionality, including native and ERC‑20 token balance checks on Ethereum and Base networks, directly into your RPG Maker game.

# Coinbase Wallet Plugin for RPG Maker MZ

The Coinbase Wallet Plugin for RPG Maker MZ allows you to integrate blockchain functionality directly into your game. With this plugin, you can connect a Coinbase Wallet, check native and ERC‑20 token balances, purchase in-game items, and even send NFTs. It supports both Ethereum and the Base network (L2) with dedicated commands for each.

## Features

- **Wallet Connection:**  
  Easily connect a Coinbase Wallet to your game using the `ConnectWallet` command.

- **Token Balance Checks:**  
  - **Ethereum:**  
    Use `CheckTokenBalance` and `ShowTokenBalance` to verify ERC‑20 token balances.
  - **Base Network:**  
    Use `CheckBaseBalance` and `ShowBaseBalance` for tokens on the Base network.

- **In-Game Transactions:**  
  Send transactions for purchasing items using the `PurchaseItem` command.

- **NFT Transfers:**  
  Transfer NFTs from the player's wallet with the `SendNFT` command.

- **Enhanced Debugging:**  
  Detailed console logs help diagnose issues with token balances and network calls.

## Requirements

- **RPG Maker MZ**
- **CoinbaseWalletSDK**
- **Web3.js**

> **Note:** Ensure that both CoinbaseWalletSDK and Web3.js are included in your project.

## Installation

1. **Download the Plugin:**  
   Save the plugin code as `CoinbaseWalletPlugin.js`.

2. **Place in Your Project:**  
   Copy the file into your project's `js/plugins` directory.

3. **Configure the Plugin:**  
   Open RPG Maker MZ, go to the Plugin Manager, and add `CoinbaseWalletPlugin`.
   - Set the parameters such as `rpcUrl`, `chainId`, `appName`, `appLogoUrl`, etc.
   - For native coin balance checks, set `gameTokenAddress` to `"native"`.
   - For ERC‑20 tokens, provide the correct token contract address.

4. **Include Required Libraries:**  
   Make sure that your project includes both the CoinbaseWalletSDK and Web3.js libraries.

## Usage

### Connecting the Wallet

- **Command:** `ConnectWallet`
- **Description:** Initiates the wallet connection process.
- **Example:**  
  Call the command from an event to prompt the player to connect their wallet.

### Checking Token Balances

- **Ethereum Network:**  
  - **Commands:**  
    - `CheckTokenBalance` – Checks if the wallet holds the required token amount.
    - `ShowTokenBalance` – Retrieves the token balance, stores it in a game variable, and displays it.
  - **Usage:**  
    Set the token address in the plugin parameter (or override via event command) and call the commands from an event.

- **Base Network (L2):**  
  - **Commands:**  
    - `CheckBaseBalance` – Checks the token balance on the Base network.
    - `ShowBaseBalance` – Retrieves the token balance on Base, stores it in a game variable, and displays it.
  - **Usage:**  
    Use your Base token contract address (e.g., the Brett token address `0x532f27101965dd16442e59d40670faf5ebb142e4`) and ensure you provide the Base RPC endpoint (or let the plugin use its default).

### In-Game Transactions

- **PurchaseItem:**  
  Sends a transaction to purchase an in-game item.  
  Provide the recipient address and the price in wei.

- **SendNFT:**  
  Transfers an NFT from the player's wallet by specifying the NFT contract address, token ID, and recipient address.

### Debugging

The plugin outputs debugging logs in the browser’s console. This helps you trace:
- The connected wallet address.
- The token address and network parameters used.
- Errors encountered during contract calls (e.g., ABI mismatches, RPC issues).

For example, to view the balance stored in a game variable, you can use a script call in an event:

<pre> Your token balance is \V[1] tokens.</pre>

### License
This project is licensed under the MIT License with some conditions. See the LICENSE file for details.

### Contributing
Contributions are welcome! Feel free to open issues or submit pull requests to enhance functionality, fix bugs, or improve documentation.

### Acknowledgements
CoinbaseWalletSDK
Web3.js
The RPG Maker community for continuous inspiration in integrating modern technologies into game development.

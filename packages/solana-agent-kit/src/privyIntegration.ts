// ...
// Example of a function that calls your backend route
// to sign & send via Privy. Adjust to match your existing routes.

export async function signAndSendWithPrivy(base64Tx: string): Promise<string> {
  // 1) Post to backend route that calls privySignAndSendTransaction
  //    in apps/backend/src/privy/privyWallet.ts
  const res = await fetch(
    "http://localhost:5000/api/privy/solana/signAndSend",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionBase64: base64Tx }),
    }
  );

  if (!res.ok) {
    throw new Error("Privy sign and send transaction failed on the backend");
  }

  const data = await res.json();

  // data should contain something like:
  // {
  //   "method": "signAndSendTransaction",
  //   "data": {
  //     "hash": "...",
  //     "caip2": "..."
  //   }
  // }

  return data?.data?.hash;
}

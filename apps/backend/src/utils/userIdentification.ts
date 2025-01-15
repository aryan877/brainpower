import { User } from "../models/User.js";
import { UnauthorizedError } from "../middleware/errors/types.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export async function getUserId(req: AuthenticatedRequest): Promise<string> {
  // If no user object exists in request, throw error
  if (!req.user?.userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  return req.user.userId;
}

export async function getUserWalletAddress(
  req: AuthenticatedRequest
): Promise<string | null> {
  const userId = await getUserId(req);

  // First check if wallet address is already in the request
  if (req.user?.walletAddress) {
    return req.user.walletAddress;
  }

  // If not, try to find an active wallet from the user document
  const user = await User.findOne({ userId });
  if (!user) {
    return null;
  }

  const activeWallet = user.wallets.find((wallet) => wallet.isActive);
  return activeWallet?.address || null;
}

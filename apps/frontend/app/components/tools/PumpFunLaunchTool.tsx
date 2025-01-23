import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Rocket } from "lucide-react";
import Image from "next/image";
import { LaunchPumpfunTokenInput } from "@repo/brainpower-agent";
import { PumpFunLaunchToolResult } from "../../types/tools";
import { Textarea } from "@/components/ui/textarea";
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import { useWallet } from "../../hooks/wallet";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../../store/notificationStore";
import { ipfsClient } from "../../clients/ipfs";

interface PumpFunLaunchToolProps {
  args: Partial<LaunchPumpfunTokenInput>;
  onSubmit: (result: PumpFunLaunchToolResult) => void;
}

export function PumpFunLaunchTool({ args, onSubmit }: PumpFunLaunchToolProps) {
  const [formData, setFormData] =
    useState<Partial<LaunchPumpfunTokenInput>>(args);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionError, setTransactionError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { wallet, sendTransaction } = useWallet();
  const { addNotification } = useNotificationStore();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        setErrors((prev) => ({ ...prev, imageUrl: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          imageUrl: "Please select an image file",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setTransactionError("");

    if (!wallet?.address) {
      addNotification(
        "error",
        "Wallet Not Connected",
        "Please connect your wallet to continue."
      );
      onSubmit({
        status: "error",
        message:
          "Wallet not connected. Please connect your wallet to continue.",
        error: {
          code: "WALLET_NOT_CONNECTED",
          message: "Wallet not connected",
        },
      });
      setIsSubmitting(false);
      return;
    }

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.tokenName?.trim()) {
      newErrors.tokenName = "Token name is required";
    }
    if (!formData.tokenTicker?.trim()) {
      newErrors.tokenTicker = "Token ticker is required";
    }
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }
    if (!selectedImage) {
      newErrors.imageUrl = "Token image is required";
    }

    if (Object.keys(newErrors).length > 0) {
      onSubmit({
        status: "error",
        message: "Please fill in all required fields.",
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: newErrors,
        },
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Generate mint keypair
      const mintKeypair = Keypair.generate();

      // Upload metadata to pump.fun's IPFS
      const pumpFunResponse = await ipfsClient.uploadToPumpFun(selectedImage!, {
        name: formData.tokenName!,
        symbol: formData.tokenTicker!,
        description: formData.description!,
        twitter: formData.twitter,
        telegram: formData.telegram,
        website: formData.website,
      });

      console.log(pumpFunResponse);

      // Create token transaction
      const payload = {
        publicKey: wallet.address,
        action: "create",
        tokenMetadata: {
          name: formData.tokenName!,
          symbol: formData.tokenTicker!,
          uri: pumpFunResponse.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: formData.initialLiquiditySOL || 0.0001,
        slippage: formData.slippageBps || 5,
        priorityFee: formData.priorityFee || 0.00005,
        pool: "pump",
      };

      const txResponse = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!txResponse.ok) {
        throw new Error(
          `Transaction creation failed: ${txResponse.statusText}`
        );
      }

      const txBuffer = await txResponse.arrayBuffer();
      const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer));

      // Sign with mint keypair first
      tx.sign([mintKeypair]);

      // Send transaction using the wallet hook
      const { signature, confirmation } = await sendTransaction(tx, {
        skipPreflight: false,
        maxRetries: 5,
      });

      if (confirmation?.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      // Submit success result
      onSubmit({
        status: "success",
        message: "Token launched successfully! View on pump.fun soon.",
        data: {
          signature,
          mint: mintKeypair.publicKey.toBase58(),
          metadataUri: pumpFunResponse.metadataUri,
        },
      });
    } catch (error) {
      console.error("Launch error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to launch token";

      // Add more descriptive error message for users
      const userMessage =
        error instanceof Error && error.message.includes("timeout")
          ? "Transaction is taking longer than expected. Please check pump.fun in a few minutes to see your token."
          : "Failed to launch token. Please try again.";

      onSubmit({
        status: "error",
        message: userMessage,
        error: {
          code: "LAUNCH_ERROR",
          message: errorMessage,
          details: error,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof LaunchPumpfunTokenInput,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "initialLiquiditySOL" ||
        field === "slippageBps" ||
        field === "priorityFee"
          ? parseFloat(value)
          : value,
    }));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          Launch Your PumpFun Token
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              value={formData.tokenName || ""}
              onChange={(e) => handleChange("tokenName", e.target.value)}
              className={errors.tokenName ? "border-destructive" : ""}
              placeholder="Enter token name"
            />
            {errors.tokenName && (
              <p className="text-sm text-destructive">{errors.tokenName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenTicker">Token Ticker</Label>
            <Input
              id="tokenTicker"
              value={formData.tokenTicker || ""}
              onChange={(e) => handleChange("tokenTicker", e.target.value)}
              className={errors.tokenTicker ? "border-destructive" : ""}
              placeholder="Enter token ticker"
            />
            {errors.tokenTicker && (
              <p className="text-sm text-destructive">{errors.tokenTicker}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className={errors.description ? "border-destructive" : ""}
            placeholder="Enter token description"
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Token Image</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="image-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 transition-colors",
                  errors.imageUrl ? "border-destructive" : "border-primary/20"
                )}
              >
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={128}
                    className="h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-primary/60 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload token image
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {errors.imageUrl && (
                <p className="text-sm text-destructive mt-1">
                  {errors.imageUrl}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter (Optional)</Label>
            <Input
              id="twitter"
              value={formData.twitter || ""}
              onChange={(e) => handleChange("twitter", e.target.value)}
              placeholder="@handle"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram (Optional)</Label>
            <Input
              id="telegram"
              value={formData.telegram || ""}
              onChange={(e) => handleChange("telegram", e.target.value)}
              placeholder="t.me/group"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              value={formData.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="initialLiquiditySOL">Initial Liquidity (SOL)</Label>
            <Input
              id="initialLiquiditySOL"
              type="number"
              step="0.0001"
              min="0.0001"
              value={formData.initialLiquiditySOL || 0.0001}
              onChange={(e) =>
                handleChange("initialLiquiditySOL", e.target.value)
              }
              className={errors.initialLiquiditySOL ? "border-destructive" : ""}
            />
            {errors.initialLiquiditySOL && (
              <p className="text-sm text-destructive">
                {errors.initialLiquiditySOL}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippageBps">Slippage (BPS)</Label>
            <Input
              id="slippageBps"
              type="number"
              min="1"
              max="1000"
              value={formData.slippageBps || 5}
              onChange={(e) => handleChange("slippageBps", e.target.value)}
              className={errors.slippageBps ? "border-destructive" : ""}
            />
            {errors.slippageBps && (
              <p className="text-sm text-destructive">{errors.slippageBps}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priorityFee">Priority Fee (SOL)</Label>
            <Input
              id="priorityFee"
              type="number"
              step="0.00001"
              min="0.00001"
              value={formData.priorityFee || 0.00005}
              onChange={(e) => handleChange("priorityFee", e.target.value)}
              className={errors.priorityFee ? "border-destructive" : ""}
            />
            {errors.priorityFee && (
              <p className="text-sm text-destructive">{errors.priorityFee}</p>
            )}
          </div>
        </div>

        {transactionError && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {transactionError}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Launching Token...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Launch Token
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

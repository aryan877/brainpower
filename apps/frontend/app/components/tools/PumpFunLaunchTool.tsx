import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Rocket, X } from "lucide-react";
import Image from "next/image";
import { LaunchPumpfunTokenInput } from "@repo/brainpower-agent";
import { PumpFunLaunchToolResult } from "../../types/tools";
import { Textarea } from "@/components/ui/textarea";
import { VersionedTransaction, Keypair } from "@solana/web3.js";
import { useWallet } from "../../hooks/wallet";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../../store/notificationStore";
import { ipfsClient } from "../../clients/ipfs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  tokenTicker: z.string().min(1, "Token ticker is required"),
  description: z.string().min(1, "Description is required"),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  website: z.string().optional(),
  initialLiquiditySOL: z.number().min(0.0001, "Must be at least 0.0001 SOL"),
  slippageBps: z.number().min(1).max(1000, "Must be between 1 and 1000 BPS"),
  priorityFee: z.number().min(0.00001, "Must be at least 0.00001 SOL"),
});

interface PumpFunLaunchToolProps {
  args: Partial<LaunchPumpfunTokenInput>;
  onSubmit: (result: PumpFunLaunchToolResult) => void;
}

export function PumpFunLaunchTool({ args, onSubmit }: PumpFunLaunchToolProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const { wallet, sendTransaction } = useWallet();
  const { addNotification } = useNotificationStore();
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenName: args.tokenName || "",
      tokenTicker: args.tokenTicker || "",
      description: args.description || "",
      twitter: args.twitter || "",
      telegram: args.telegram || "",
      website: args.website || "",
      initialLiquiditySOL: args.initialLiquiditySOL || 0.0001,
      slippageBps: args.slippageBps || 5,
      priorityFee: args.priorityFee || 0.00005,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageError("");
    } else {
      setImageError("Please select an image file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setTransactionError("");

    if (!selectedImage) {
      setImageError("Token image is required");
      setIsSubmitting(false);
      return;
    }

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

    try {
      const mintKeypair = Keypair.generate();

      const pumpFunResponse = await ipfsClient.uploadToPumpFun(selectedImage, {
        name: data.tokenName,
        symbol: data.tokenTicker,
        description: data.description,
        twitter: data.twitter,
        telegram: data.telegram,
        website: data.website,
      });

      const payload = {
        publicKey: wallet.address,
        action: "create",
        tokenMetadata: {
          name: data.tokenName,
          symbol: data.tokenTicker,
          uri: pumpFunResponse.metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: data.initialLiquiditySOL,
        slippage: data.slippageBps,
        priorityFee: data.priorityFee,
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
      tx.sign([mintKeypair]);

      const { signature, confirmation } = await sendTransaction(tx, {
        skipPreflight: false,
        maxRetries: 5,
      });

      if (confirmation?.value.err) {
        throw new Error(
          `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      onSubmit({
        status: "success",
        message: "Visit pump.fun to start trading and managing your token!",
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

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background p-6">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          Launch Your PumpFun Token
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tokenName">
              Token Name <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("tokenName")}
              className={cn(
                form.formState.errors.tokenName && "border-destructive"
              )}
              placeholder="Enter token name"
            />
            {form.formState.errors.tokenName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.tokenName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenTicker">
              Token Ticker <span className="text-destructive">*</span>
            </Label>
            <Input
              {...form.register("tokenTicker")}
              className={cn(
                form.formState.errors.tokenTicker && "border-destructive"
              )}
              placeholder="Enter token ticker"
            />
            {form.formState.errors.tokenTicker && (
              <p className="text-sm text-destructive">
                {form.formState.errors.tokenTicker.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            {...form.register("description")}
            className={cn(
              form.formState.errors.description && "border-destructive"
            )}
            placeholder="Enter token description"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-destructive">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Token Image <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("image-upload")?.click()}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-[160px] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-primary/20",
                  imageError && "border-destructive",
                  "hover:bg-primary/5"
                )}
              >
                {imagePreview ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="max-h-[140px] w-auto object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-sm">Click or drop to replace</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Upload
                      className={cn(
                        "w-8 h-8 mb-2 transition-transform duration-200",
                        isDragging
                          ? "text-primary scale-110"
                          : "text-primary/60"
                      )}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      {isDragging ? (
                        <span className="text-primary font-medium">
                          Drop image here
                        </span>
                      ) : (
                        <>
                          Click to upload or drag image
                          <br />
                          <span className="text-xs">
                            PNG, JPG, GIF up to 10MB
                          </span>
                        </>
                      )}
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
              </div>
              {imageError && (
                <p className="text-sm text-destructive mt-1">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter (Optional)</Label>
            <Input {...form.register("twitter")} placeholder="@handle" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram (Optional)</Label>
            <Input {...form.register("telegram")} placeholder="t.me/group" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input {...form.register("website")} placeholder="https://" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="initialLiquiditySOL">
              Initial Liquidity (SOL){" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.0001"
              {...form.register("initialLiquiditySOL", { valueAsNumber: true })}
              className={cn(
                form.formState.errors.initialLiquiditySOL &&
                  "border-destructive"
              )}
            />
            {form.formState.errors.initialLiquiditySOL && (
              <p className="text-sm text-destructive">
                {form.formState.errors.initialLiquiditySOL.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippageBps">
              Slippage (BPS) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              {...form.register("slippageBps", { valueAsNumber: true })}
              className={cn(
                form.formState.errors.slippageBps && "border-destructive"
              )}
            />
            {form.formState.errors.slippageBps && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slippageBps.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priorityFee">
              Priority Fee (SOL) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              step="0.00001"
              {...form.register("priorityFee", { valueAsNumber: true })}
              className={cn(
                form.formState.errors.priorityFee && "border-destructive"
              )}
            />
            {form.formState.errors.priorityFee && (
              <p className="text-sm text-destructive">
                {form.formState.errors.priorityFee.message}
              </p>
            )}
          </div>
        </div>

        {transactionError && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {transactionError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              onSubmit({
                status: "cancelled",
                message: "Token launch cancelled by user",
              });
            }}
            disabled={isSubmitting}
            className="border-2"
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

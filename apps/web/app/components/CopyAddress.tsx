import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CopyAddressProps {
  address: string;
  explorerUrl?: string;
  className?: string;
  showCopy?: boolean;
  showExplorer?: boolean;
}

export function CopyAddress({
  address,
  explorerUrl,
  className,
  showCopy = true,
  showExplorer = true,
}: CopyAddressProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const truncatedAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-sm",
        className
      )}
    >
      <code className="bg-background/80 px-2 py-0.5 rounded text-sm truncate min-w-0 flex-shrink">
        {truncatedAddress}
      </code>
      <div className="flex items-center gap-1 flex-shrink-0">
        {showCopy && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-primary/10 rounded-md transition-colors"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
            )}
          </button>
        )}
        {showExplorer && explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-primary/10 rounded-md transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
          </a>
        )}
      </div>
    </div>
  );
}

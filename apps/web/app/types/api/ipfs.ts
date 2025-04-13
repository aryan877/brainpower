export interface UploadToIPFSResponse {
  imageUrl: string;
}

export interface PumpFunMetadata {
  name: string;
  symbol: string;
  description: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface UploadToPumpFunIPFSResponse {
  metadataUri: string;
  metadata: PumpFunMetadata;
}

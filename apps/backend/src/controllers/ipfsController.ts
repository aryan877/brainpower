import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth/index.js";
import axios from "axios";
import FormData from "form-data";
import { BadRequestError, DatabaseError } from "../middleware/errors/types.js";

interface FileRequest extends AuthenticatedRequest {
  file?: Express.Multer.File;
}

export const uploadToIPFS = async (req: FileRequest, res: Response) => {
  if (!req.file) {
    throw new BadRequestError("No file provided");
  }

  if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    throw new DatabaseError("IPFS service not properly configured");
  }

  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
        maxBodyLength: Infinity,
      }
    );

    if (!response.data?.IpfsHash) {
      throw new DatabaseError("Failed to get IPFS hash from provider");
    }

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("IPFS upload error:", error);

    if (axios.isAxiosError(error)) {
      throw new DatabaseError(
        error.response?.data?.error || "Failed to upload to IPFS service",
        error.response?.data
      );
    }

    if (error instanceof Error) {
      throw new DatabaseError(error.message);
    }

    throw new DatabaseError("Failed to upload to IPFS");
  }
};

export const uploadToPumpFunIPFS = async (req: FileRequest, res: Response) => {
  if (!req.file) {
    throw new BadRequestError("No file provided");
  }

  try {
    const formData = new FormData();

    // Add metadata fields from request body
    const { name, symbol, description, twitter, telegram, website } = req.body;
    formData.append("name", name);
    formData.append("symbol", symbol);
    formData.append("description", description);
    formData.append("showName", "true");

    if (twitter) formData.append("twitter", twitter);
    if (telegram) formData.append("telegram", telegram);
    if (website) formData.append("website", website);

    // Add the file
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post("https://pump.fun/api/ipfs", formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
    });

    if (!response.data?.metadataUri) {
      throw new DatabaseError("Failed to get metadata URI from pump.fun");
    }

    res.json({
      metadataUri: response.data.metadataUri,
      metadata: response.data.metadata,
    });
  } catch (error) {
    console.error("Pump.fun IPFS upload error:", error);

    if (axios.isAxiosError(error)) {
      throw new DatabaseError(
        error.response?.data?.error || "Failed to upload to pump.fun IPFS",
        error.response?.data
      );
    }

    if (error instanceof Error) {
      throw new DatabaseError(error.message);
    }

    throw new DatabaseError("Failed to upload to pump.fun IPFS");
  }
};

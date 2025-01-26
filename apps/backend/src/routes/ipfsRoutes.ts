import { Router } from "express";
import { authenticateUser } from "../middleware/auth/index.js";
import { validateCluster } from "../middleware/auth/cluster.js";
import {
  uploadToIPFS,
  uploadToPumpFunIPFS,
} from "../controllers/ipfsController.js";
import { asyncHandler } from "../middleware/errors/asyncHandler.js";
import multer from "multer";
import { BadRequestError } from "../middleware/errors/types.js";
import { validateRequest } from "../validators/validateRequest.js";
import { pumpFunUploadSchema } from "../validators/ipfsValidators.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Configure multer with file validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new BadRequestError(
          `Invalid file type. Supported types: ${ALLOWED_MIME_TYPES.join(", ")}`
        )
      );
      return;
    }
    cb(null, true);
  },
});

export function setupIPFSRoutes(router: Router): Router {
  router.use(authenticateUser);
  router.use(validateCluster);

  router.post("/upload", upload.single("file"), asyncHandler(uploadToIPFS));
  router.post(
    "/upload-pumpfun",
    upload.single("file"),
    validateRequest({ body: pumpFunUploadSchema }),
    asyncHandler(uploadToPumpFunIPFS)
  );

  return router;
}

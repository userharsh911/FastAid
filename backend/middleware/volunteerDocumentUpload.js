import multer from "multer";

const MAX_VOLUNTEER_DOCUMENT_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf"];

const volunteerDocumentUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_VOLUNTEER_DOCUMENT_SIZE_BYTES,
        files: 1,
    },
    fileFilter: (req, file, callback) => {
        const mimetype = String(file?.mimetype || "").toLowerCase();

        if (mimetype.startsWith("image/") || ALLOWED_MIME_TYPES.includes(mimetype)) {
            callback(null, true);
            return;
        }

        callback(new Error("Only image or PDF files are allowed"));
    },
});

export const volunteerDocumentUploadMiddleware = (req, res, next) => {
    volunteerDocumentUpload.single("document")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    success: false,
                    message: "Document must be 8MB or smaller",
                });
            }

            return res.status(400).json({
                success: false,
                message: error.message || "Invalid document upload",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Document upload failed",
        });
    });
};

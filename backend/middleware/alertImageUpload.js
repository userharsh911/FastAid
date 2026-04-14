import multer from "multer";

const MAX_ALERT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const alertImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_ALERT_IMAGE_SIZE_BYTES,
        files: 1,
    },
    fileFilter: (req, file, callback) => {
        if (file?.mimetype?.startsWith("image/")) {
            callback(null, true);
            return;
        }

        callback(new Error("Only image files are allowed"));
    },
});

export const alertImageUploadMiddleware = (req, res, next) => {
    alertImageUpload.single("image")(req, res, (error) => {
        if (!error) {
            next();
            return;
        }

        if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    success: false,
                    message: "Image must be 5MB or smaller",
                });
            }

            return res.status(400).json({
                success: false,
                message: error.message || "Invalid image upload",
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "Image upload failed",
        });
    });
};

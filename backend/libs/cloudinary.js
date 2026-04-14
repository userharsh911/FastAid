import { v2 as cloudinary } from "cloudinary";

const getCloudinaryCredentials = () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
});

const configureCloudinary = ({ cloudName, apiKey, apiSecret }) => {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
};

const isCloudinaryConfigured = ({ cloudName, apiKey, apiSecret }) => (
    Boolean(cloudName) &&
    Boolean(apiKey) &&
    Boolean(apiSecret)
);

export const uploadAlertImageToCloudinary = async ({ fileBuffer, mimetype, userId }) => {
    if (!fileBuffer?.length) {
        throw new Error("Alert image buffer is missing");
    }

    const credentials = getCloudinaryCredentials();
    configureCloudinary(credentials);

    if (!isCloudinaryConfigured(credentials)) {
        throw new Error("Cloudinary credentials are missing");
    }

    const folderUserPart = userId ? `user_${userId}` : "guest";
    const preferredFormat = mimetype === "image/png" ? "png" : "jpg";

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `emergent-guardian/alerts/${folderUserPart}`,
                resource_type: "image",
                format: preferredFormat,
                transformation: [
                    { width: 1600, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new Error("Cloudinary upload failed"));
                    return;
                }

                resolve({
                    publicId: result.public_id,
                    url: result.secure_url,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                });
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default cloudinary;

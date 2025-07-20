import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImageClodinary = async (image) => {
    if (!image || !image.buffer) {
        throw new Error("No image file provided or buffer is missing.");
    }

    const uploadImage = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "binkeyit"
            },
            (error, result) => {
                if (error) return reject(error);
                return resolve(result);
            }
        );
        stream.end(image.buffer); // ✅ send buffer to Cloudinary
    });

    return uploadImage; // contains .secure_url, .public_id, etc.
};

export default uploadImageClodinary;


const cloudinary = require("cloudinary").v2;

// TODO: put in .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

const uploadPicture = async (pictureToUpload, folder = "/") => {
  try {
    return await cloudinary.uploader.upload(convertToBase64(pictureToUpload), {
      folder: folder,
    });
  } catch (error) {
    throw error;
  }
};

const deletePicture = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadPicture, deletePicture };

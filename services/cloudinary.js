const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Verify mimetype starts with image
const isImage = (file) => {
  return /^image/.test(file.mimetype);
};

const uploadPicture = async (picture, folder = "/") => {
  try {
    return await cloudinary.uploader.upload(convertToBase64(picture), {
      folder: folder,
    });
  } catch (error) {
    throw error;
  }
};

// Deprecated: see deletePicturesAndFolder
const deletePicture = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    throw error;
  }
};

// TODO: consider keeping these separated
const deletePicturesAndFolder = async (folder) => {
  try {
    // delete content
    await cloudinary.api.delete_resources_by_prefix(folder);
    // delete folder
    await cloudinary.api.delete_folder(folder);
  } catch (error) {
    throw error;
  }
};

module.exports = { isImage, uploadPicture, deletePicturesAndFolder };

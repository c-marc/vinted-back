const cloudinary = require("cloudinary").v2;

// TODO: put in .env
cloudinary.config({
  cloud_name: "dtopi7ioo",
  api_key: "989156875617375",
  api_secret: "NlgiCIApGCzO7a_VvuitEWO2esw",
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

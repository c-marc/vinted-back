const express = require("express");
const fileUpload = require("express-fileupload");

const User = require("../models/User");
const Offer = require("../models/Offer");
const { uploadPicture, deletePicture } = require("../services/cloudinary");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// URL : http://localhost:3000/offer/publish
// Méthode HTTP : POST
// Headers : Authorization Bearer Token
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // get text part of the body
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      // create new Offer
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { brand: brand },
          { size: size },
          { condition: condition },
          { color: color },
          { city: city },
        ],
        product_image: null, // need offer._id first
        // owner: req.user._id,
        owner: req.user, // use full object to show full account when querying
      });

      // get pic and try to upload
      if (req.files?.picture) {
        const folder = "/vinted/offers/" + newOffer._id;
        const uploadedPicture = await uploadPicture(req.files.picture, folder);
        // console.log(uploadPicture);
        // update and save newOffer
        newOffer.product_image = uploadedPicture;
      }
      await newOffer.save();

      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update offer
// Beware: product_details is an Array with nested obj:
// - markModified()
// - or schema
// - or full reassignement (trying this)
router.put(
  "/offer/:id/update",
  isAuthenticated,
  fileUpload(), // needed for body ( form-data )
  async (req, res) => {
    try {
      const offerToUpdate = await Offer.findById(req.params.id);
      if (!offerToUpdate) {
        return res.status(404).json({ message: "Unknow product id" });
      }

      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      // cast details as an object
      const currentDetails = {};
      for (const v in offerToUpdate.product_details) {
        currentDetails[Object.keys(v)[0]] = Object.values(v)[0];
      }
      console.log("Check parsing of details:\n", currentDetails);

      // create new Offer (this should avoid nesting prb)
      const modifiedFields = {
        product_name: title ?? offerToUpdate.product_name,
        product_description: description ?? offerToUpdate.product_description,
        product_price: price ?? offerToUpdate.product_price,
        product_details: [
          { brand: brand ?? currentDetails.brand }, // TODO : use the weird keynames MARQUE, etc...
          { size: size ?? currentDetails.size },
          { condition: condition ?? currentDetails.condition },
          { color: color ?? currentDetails.color },
          { city: city ?? currentDetails.city },
        ],
      };

      // deal with image update
      // get pic and try to upload
      if (req.files?.picture) {
        // delete previous pic
        const public_id = offerToUpdate.product_image.public_id;
        await deletePicture(public_id);
        // upload new one
        const folder = "/vinted/offers/" + offerToUpdate._id;
        const uploadedPicture = await uploadPicture(req.files.picture, folder);
        // update and save newOffer
        modifiedFields.product_image = uploadedPicture;
      }

      console.log("Goal\n", modifiedFields);

      const updated = await Offer.findByIdAndUpdate(
        req.params.id,
        modifiedFields,
        { new: true }
      );
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// delete
router.delete("/offer/:id/delete", isAuthenticated, async (req, res) => {
  try {
    const id = req.params.id;
    // delete images
    // get public_id
    const offerToDelete = await Offer.findById(id);
    if (!offerToDelete) {
      return res.status(404).json({ message: "Unknow product id" });
    }
    const public_id = offerToDelete.product_image.public_id;
    await deletePicture(public_id);
    // delete folder ?
    // delete offer
    await Offer.findByIdAndDelete(id);
    res.json({ message: "Offer sucessfully deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//GET
// Query:
// title : String
// priceMin : Number
// priceMax : Number
// sort : Valeurs possibles "price-desc", "price-asc"
// page: Number
router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page, limit } = req.query;

    // TODO: validate

    const titleRE = new RegExp(title ?? ".*", "i");

    const filter = {
      product_name: titleRE,
      product_price: {
        // Warning: Number(undefined) is not undefined, it's NaN
        // wrap everything
        $gte: Number(priceMin ?? 0), //
        $lte: Number(priceMax ?? 10 ** 6),
        // or use different syntax
        $gte: Number(priceMin) || 0,
        $lte: Number(priceMax) || 10 ** 6,
      },
    };

    const sortingRule = {};
    if (sort === "price-desc") sortingRule.product_price = -1;
    if (sort === "price-asc") sortingRule.product_price = 1;

    // defaults: page = 1, limit = 10
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    console.log(filter);
    const offers = await Offer.find(filter)
      .sort(sortingRule)
      .skip(skip)
      .limit(limit)
      //.select("product_name product_price") //demo
      .populate("owner", "account");

    const count = await Offer.countDocuments(filter);

    res.json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

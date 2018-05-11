const express = require("express");
const router = express.Router();
const Product = require("../models/products");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const auth = require("../middleware");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      if (docs) {
        if (docs.length > 0) {
          res.status(200).json({
            count: docs.length,
            products: docs.map(doc => ({
              name: doc.name,
              price: doc.price,
              productImage: doc.productImage,
              meta: {
                method: "GET",
                url: `localhost:4000/products/${doc._id}`
              }
            }))
          });
        } else if (docs.length === 0) {
          res.status(404).json({
            message: "No document found"
          });
        }
      } else {
        console.log("no documents");
        res.status(404).json({
          message: "No document found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post("/", auth, upload.single("productImage"), (req, res, next) => {
  const { name, price } = req.body;

  Product.find()
    .exec()
    .then(products => {
      let exisitngProducts = products.filter(product => product.name === name);
      return exisitngProducts;
    })
    .then(exisitngProducts => {
      if (exisitngProducts.length > 0) {
        if (!!price && !req.file) {
          Product.where({ _id: exisitngProducts[0]._id })
            .update({ $set: { price: price } })
            .exec();
        } else if (!!price && !!req.file) {
          fs.unlink(`./${exisitngProducts[0].productImage}`, err => {
            if (err) Promise.reject("Error in deleting file");
          });
          Product.where({ _id: exisitngProducts[0]._id })
            .update({ $set: { price: price, productImage: req.file.path } })
            .exec();
        } else if (!price && !!req.file) {
          fs.unlink(`./${exisitngProducts[0].productImage}`, err => {
            if (err) Promise.reject("Error in deleting file");
          });
          Product.where({ _id: exisitngProducts[0]._id })
            .update({ $set: { productImage: req.file.path } })
            .exec();
        }
        return {
          _id: exisitngProducts[0]._id,
          name: name,
          price: !!price ? price : exisitngProducts[0].price,
          productImage: !!req.file
            ? req.file.path
            : exisitngProducts[0].productImage
        };
      } else {
        const product = new Product({
          _id: new mongoose.Types.ObjectId(),
          name,
          price,
          productImage: req.file.path
        });
        product.save();
        return product;
      }
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        name: result.name,
        price: result.price,
        productImage: result.productImage,
        _id: result._id,
        meta: {
          method: "GET",
          url: `localhost:4000/products/${result._id}`
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        console.log(doc);
        res.status(201).json({
          doc,
          meta: {
            methad: "POST",
            message: "Add to card",
            url: `localhost:4000/orders/${id}`
          }
        });
      } else {
        res.status(404).json({
          message: "document not found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", (req, res, next) => {
  // TODO: a better path that considers file upload too
  const id = req.params.productId;
  const obj = {};
  for (let key of req.body) {
    obj[key.propName] = key.value;
  }

  Product.where({ _id: id })
    .update({ $set: obj })
    .exec()
    .then(result => {
      res.status(200).json({
        name: result.name,
        price: result.price,
        productImage: result.productImage,
        _id: result._id,
        meta: {
          method: "GET",
          url: `localhost:4000/products/${id}`
        }
      });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .remove()
    .exec()
    .then(result => {
      console.log("document deleted", id);
      res.status(200).json({ result });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;

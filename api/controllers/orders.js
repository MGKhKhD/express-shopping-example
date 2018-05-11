const mongoose = require("mongoose");
const Order = require("../models/orders");
const Product = require("../models/products");

exports.GetAllOrders = (req, res, next) => {
  Order.find()
    .populate("product", "name price")
    .exec()
    .then(orders => {
      res.status(201).json({
        orders
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};

exports.PlaceANewOrder = (req, res, next) => {
  const { productId, quantity } = req.body;
  Product.findById(productId)
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({
          message: "product not found"
        });
      }
      return Order.find().exec();
    })
    .then(orders => {
      let existingOrder = orders.filter(({ product }) => product == productId);
      return existingOrder;
    })
    .then(existingOrder => {
      if (existingOrder.length > 0) {
        let addedQuantity = !!quantity ? quantity : 1;
        Order.where({ _id: existingOrder[0]._id })
          .update({
            $set: {
              quantity: existingOrder[0].quantity + addedQuantity
            }
          })
          .exec();
        return {
          _id: existingOrder[0]._id,
          produc: existingOrder[0].product,
          quantity: existingOrder[0].quantity + addedQuantity
        };
      } else {
        let order = new Order({
          _id: new mongoose.Types.ObjectId(),
          quantity: !!quantity ? quantity : 1,
          product: productId
        });
        order.save();
        return order;
      }
    })
    .then(order => {
      res.status(201).json({
        message: "order added",
        order
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

exports.GetAnOrderById = (req, res, next) => {
  const id = req.params.orderId;
  Order.findById(id)
    .select("product quantity _id")
    .populate("product", "name price")
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "not found"
        });
      }
      res.status(200).json({
        order,
        meta: {
          method: "GET",
          url: "localhost:4000//orders"
        }
      });
    })
    .catch(err => {
      res.status(404).json({
        error: err
      });
    });
};

exports.UpdateOrder = (req, res, next) => {
  res.status(200).json({
    message: "successful update of order",
    id: req.params.orderId
  });
};

exports.DeleteOneOrder = (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "order is removed"
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};

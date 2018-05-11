const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.SignupUserController = (req, res, next) => {
  const { email, password } = req.body;
  User.find({ email: email })
    .exec()
    .then(docs => {
      if (docs.length > 0) {
        return res.status(409).json({
          message: "User is already registered"
        });
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(409).json({
            error: err
          });
        } else {
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            email,
            password: hash
          });
          user
            .save()
            .then(result => {
              res.status(200).json({
                _id: result._id,
                email: result.email
              });
            })
            .catch(err => {
              res.status(500).json({
                error: err
              });
            });
        }
      });
    });
};

exports.LoginUserController = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email })
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(404).json({
            message: "Auth failed"
          });
        }
        if (result) {
          let token = jwt.sign(
            {
              email: user.email,
              _id: user._id
            },
            "JWT_SECRET_SING"
          );
          return res.status(200).json({
            _id: user._id,
            email: user.email,
            token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.UpdateEmailUserController = (req, res, next) => {
  const { _id, email } = req.user;
  User.findById(_id)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: "No record of user"
        });
      }
      user.set({ email: !!req.body.email ? req.body.email : email });
      return user.save();
    })
    .then(user => {
      res.status(200).json({
        message: "Email successfully updated",
        email: user.email,
        _id: user._id
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.DeleteUserController = (req, res, next) => {
  const id = req.user._id;
  User.findById(id)
    .exec()
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "No user exists" });
      }
      return User.where({ _id: id })
        .remove()
        .exec();
    })
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};

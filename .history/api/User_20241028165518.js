const express = require("express");
const router = express.Router();

//import our user model so that we can have access
const User = require("./../models/User");

//password handler and hashing
const bcrypt = require("bcrypt");

//Signup
router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name == "" || email == "" || password == "" || dateOfBirth == "") {
    res.json({
      status: "Failed",
      message: "Empty Input Fields",
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.json({
      status: "Failed",
      message: "Invalid Name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "Failed",
      message: "Invalid email format entered",
    });
  } else if (isNaN(new Date(dateOfBirth).getTime())) {
    res.json({
      status: "Failed",
      message: "Invalid date of birth entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "Failed",
      message: "password is too short. 8 characters required ",
    });
  } else {
    //checking user email if it exists
    User.find({ email })
      .then((result) => {
        if (result.length) {
          // a user already exist
          res.json({
            status: "Failed",
            message: "User with the provided email already exist ",
          });
        } else {
          // Try to create new user

          //password hashing
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
              });
              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "Account created successful",
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "Failed",
                    message: "An error occurred while creating the account",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "Failed",
                message: "An error occurred while hashing the password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message:
            "An error occurred while checking for an existing user email",
        });
      });
  }
});

//Signin
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "Failed",
      message: "Empty Input Fields",
    });
  } else {
    //checking user email if it exists
    User.find({ email }).then((data) => {
      if (data.length) {
        //user exist
        const hashedPassword = data[0].password;
        bcrypt.compare(password, hashedPassword).then((result) => {
          if (result) {
            //password is correct
            res.json({
              status: "SUCCESS",
              message: "Logged in successfully",
              data: data,
            });
          } else{
            res.json({
              status: "Failed",
              message: "Invalid password",
            });
          }
        }).catch(err =>{
            res.json({
                status: "Failed",
                message: "an error occurred while checking the password",
              });
        })
      } else{
        res.json({
            status: "Failed",
            message: "Invalid credentials entered",
          });
      }
    }).catch(err =>{
        res.json({
            status: "Failed",
            message: "An error occurred when checking for the existing user",
          });
    })
  }
});

module.exports = router;

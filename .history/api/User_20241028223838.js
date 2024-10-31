const express = require("express");
const router = express.Router();

//import our user model so that we can have access
const User = require("./../models/User");
const UserVerification = require("./../models/UserVerification");

//email handler
const nodemailer = require("nodemailer");

//generation of unique strings
const { v4: uuidv4 } = require("uuid");

// env variables
require("dotenv").config();

//password handler and hashing
const bcrypt = require("bcrypt");

//path for html page to show it is verified
const path = require("path");

// nodemailer transporter and staff
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
});

//CHECKING transporter success or fail
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
    console.log(success);
  }
});

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
                verified: false,
              });
              newUser
                .save()
                .then((result) => {
                  //handler verification email
                  sendVerificationEmail(result, res);
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

//send verification email
const sendVerificationEmail = ({ _id, email }, res) => {
  //url to be used in the email.
  const currentUrl = "https://localhost:5000/";

  const uniqueString = uuidv4() + _id;

  // setting mail options
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<p> Verify your email address to complete the signup and login into your account </p> <p> This link 
    <b>expires in 6 hours</b>. </p> <p> Press <a href=${
      currentUrl + "user/verify/" + _id + "/" + uniqueString
    }>here</a> to proceed </p>`,
  };

  //hash the unique string
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      // set values in user verification records collection
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              // email sent and verification recorded
              res.json({
                status: "SUCCESS",
                message: "Email sent and verification recorded",
              });
            })
            .catch((error) => {
              console.log(error);
              res.json({
                status: "Failed",
                message: "Error occurred while sending the verification email",
              });
            });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "Failed",
            message: "couldn't save verification email data",
          });
        });
    })
    .catch(() => {
      res.json({
        status: "Failed",
        message: "An error occurred while hashing the email data.",
      });
    });
};

//VERIFY EMAIL
router.get("/verify/:userId/:uniqueString", (res, req) => {
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result)=>{
      if(result.length > 0 ){
        //user verification record exist so we proceed

        const {expiresAt} = result[0];
        //checks for  expiring time
        if(expiresAt < Date.now()){
          //verification expired
          UserVerification
          .deleteOne({userId})
          .then()
          .catch((error)=>{
            console.log(error);
            let message =
            "An error occurred while clearing expired user verification record";
            res.redirect(`/user/verified/error=true$message=${message}`)
          })
        }

      }else{
        //user verification record doesn't exist
        let message =
        "Account record doesn't exist or has been verified. please signup or login  ";
        res.redirect(`/user/verified/error=true$message=${message}`)
      }

    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing- user verification record ";
      res.redirect(`/user/verified/error=true$message=${message}`);
    });
});

//verified page router
router.get("/verified", (res, req) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
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
    User.find({ email })
      .then((data) => {
        if (data.length) {
          //user exist
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                //password is correct
                res.json({
                  status: "SUCCESS",
                  message: "Logged in successfully",
                  data: data,
                });
              } else {
                res.json({
                  status: "Failed",
                  message: "Invalid password",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "Failed",
                message: "an error occurred while checking the password",
              });
            });
        } else {
          res.json({
            status: "Failed",
            message: "Invalid credentials entered",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "Failed",
          message: "An error occurred when checking for the existing user",
        });
      });
  }
});

module.exports = router;

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewParse: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

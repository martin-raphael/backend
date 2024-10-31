//mongodb
require("./config/db");

const app = require("express")();
const port = process.env.PORT || 5000;
const UserRouter = require("./api/User"); // importing user routes

//for accepting post form
const bodyParser = require("express").json;
app.use(bodyParser());

app.use("/user", UserRouter);
app.use(express.static(path.join(__dirname, 'views')));

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

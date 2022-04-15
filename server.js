const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
var cors = require("cors");
const bcrypt = require("bcrypt");

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//MongoDB databse setup with mongoose
mongoose
  .connect(process.env.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log("Database Connected Successfully"))
  .catch((err) => console.log(err.message));

//Routes

// Sign Up Functionality

let User = require("./models/users");
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  const user = new User({ email, password });
  user.save((err) => {
    if (err) {
      if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        res.send({ message });
      }
    } else {
      res.send({ message: "sucessfull", user: user });
    }
  });
});

// Login Functionality
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);
  User.findOne({ email: email }, (err, user) => {
    if (!user) {
      res.send({ message: "Sorry You are not a user" });
    } else {
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          res.send({ message: "Login Success", user: user });
        } else {
          res.send({ message: "Wrong Credentials" });
        }
      });
    }
  });
});

let ExpensesSchema = require("./models/expenses");

app.post("/addExpenses", (req, res) => {
  const { userEmail, name, cost, date } = req.body;
  // console.log(userEmail, name, cost, date, type);

  const expenses = new ExpensesSchema({
    email: userEmail,
    name: name,
    cost: cost,
    date: date,
  });
  expenses
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Expenses Added successfully!",
        userCreated: {
          _id: result._id,
          userEmail: result.userEmail,
        },
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-unused-expressions
      console.log(err),
        res.status(500).json({
          error: err,
        });
    });
});

// router.get("/allRestaurants", async (req, res) => {
//   const search = req.query.search;
//   const allRestaurants = await Restaurant.find({
//     restaurantName: { $regex: search, $options: "i" },
//   });
//   res.send(allRestaurants);
// });

//get all expenses
app.get("/allExpenses/:id", async (req, res) => {
  const email = req.params.id;
  const search = req.query.search;

  const allExpenses = await ExpensesSchema.find({
    email: email,
    name: { $regex: search, $options: "i" },
  });
  res.send(allExpenses);
  console.log(allExpenses);
});

app.get("/findAndDelete/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);

  ExpensesSchema.findOneAndDelete({ _id: id }, (err) => {
    if (err) {
      if (err.code === 11000) {
        const message = "Error Occured";
        res.send({ message });
      }
    } else {
      res.send({ message: "Sucessfull" });
    }
  });
});

app.get("/findOne/:id", async (req, res) => {
  const id = req.params;
  // console.log(id);
  const expense = await ExpensesSchema.findOne(id);
  console.log(expense);
  res.send(expense);
});

// app.get("/findOne/:id", (req, res) => {
//   console.log(req.params.id);
//   ExpensesSchema.findOne({ _id: req.params.id }, (err, expense) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send({ expense: expense });
//     }
//   });
// });

// exports.updateData = async (req, res) => {
//   const { title, located, cost, brief } = req.body;
//   //console.log(req.body)
//   // console.log(req.params.id)

//   const result = await RoomListing.findByIdAndUpdate(
//       { _id: req.params.id },
//       {
//           $set: {
//               roomTitle: title,
//               location: located,
//               costPerNight: cost,
//               description: brief
//           },
//       },
//       {
//           new: true,
//           useFindAndModify: false,
//       },
//       (err) => {
//           if (err) {
//               res.status(500).json({
//                   error: "There was a server side error!",
//               });
//           } else {
//               return res.json({ status: 'ok' })
//           }
//       }
//   );
// }

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

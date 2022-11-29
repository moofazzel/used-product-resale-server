const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;

const app = express();

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_pass}@cluster0.ia0tdiq.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// const uri = `mongodb+srv://second-hand-products:i6xt64yM4b3IU8V8@cluster0.ia0tdiq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function dbConnect() {
  try {
    await client.connect();
    console.log("DATABASE CONNECTED");
  } catch (error) {
    console.log(error.name, error.massage);
  }
}

dbConnect();

// All Database Collection
const allCategories = client
  .db("second-hand-products")
  .collection("categories");

const productCollection = client
  .db("second-hand-products")
  .collection("products");

const userCollections = client.db("second-hand-products").collection("users");

const ordersCollection = client.db("second-hand-products").collection("orders");

// second-hand-products**ok
// get all seller
try {
  app.get("/allSeller/:type", async (req, res) => {
    const accountType = req.params.type;
    const result = await userCollections.find({ accountType }).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("UsersCollections", error.name, error.massage, error.stack);
}

// second-hand-products**ok
// get all seller
try {
  app.get("/allBuyer/:type", async (req, res) => {
    const accountType = req.params.type;
    const result = await userCollections.find({ accountType }).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("UsersCollections", error.name, error.massage, error.stack);
}

// second-hand-products**ok
// delete a user
try {
  app.delete("/user/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const result = await userCollections.deleteOne(filter);
    res.send(result);
  });
} catch (error) {
  console.log("user delete", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// get user by id
try {
  app.get("/user/:email", async (req, res) => {
    const { email } = req.params;
    const result = await userCollections.findOne({ email: email });
    console.log(result);
    res.send(result);
  });
} catch (error) {
  console.log("UsersCollections", error.name, error.massage, error.stack);
}

// second-hand-products-**ok
// INSERT USER DATA TO MONGODB
try {
  app.post("/users",verifyJWT, async (req, res) => {
    const user = req.body;
    const existingUser = await userCollections.findOne({ email: user.email });
    console.log(existingUser);
    if (existingUser) {
      return res.send({ message: "User already exist" });
    }
    const result = await userCollections.insertOne(user);
    res.send(result);
  });
} catch (error) {
  console.log("UsersCollections", error.name, error.massage, error.stack);
}

// second-hand-products
// Insert orders/buyer data
// FIXME:
// try {
//   app.get("/product", async (req, res) => {
//     const productData = req.query;
//     const result = await ordersCollection.insertOne(productData);
//     console.log(result);
//     res.send(result);
//   });
// } catch (error) {
//   console.log("Update product booked", error.name, error.massage, error.stack);
// }

// second-hand-products
// find orders
try {
  app.get("/my_orders", async (req, res) => {
    const result = await ordersCollection.find({}).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("my orders", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// find orders by user
try {
  app.get("/orders", async (req, res) => {
    const { email, id } = req.query;
    const result = await ordersCollection.findOne({
      product_id: id,
      email: email,
    });
    res.send(result);
  });
} catch (error) {
  console.log("ordersCollection", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// Insert orders/buyer data
try {
  app.post("/orders",verifyJWT, async (req, res) => {
    const productData = req.body;
    const result = await ordersCollection.insertOne(productData);
    res.send(result);
  });
} catch (error) {
  console.log("Update product booked", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// Insert product data
try {
  app.post("/addProduct",verifyJWT, async (req, res) => {
    const productData = req.body;
    const result = await productCollection.insertOne(productData);

    res.send(result);
  });
} catch (error) {
  console.log("Update product booked", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// delete a product
try {
  app.delete("/product/:id",verifyJWT, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const result = await productCollection.deleteOne(filter);
    res.send(result);
  });
} catch (error) {
  console.log("Delete product", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// Get all product for a user

try {
  app.get("/myProduct", async (req, res) => {
    const email = req.query.email;
    const result = await productCollection.find({ userEmail: email }).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("myProduct", error.name, error.massage, error.stack);
}
// second-hand-products **ok
// Put user advertise
try {
  app.put("/product/advertise/:id",verifyJWT, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const option = { upsert: true };
    const updateDoc = {
      $set: {
        advertise: "yes",
      },
    };
    const result = await productCollection.updateOne(filter, updateDoc, option);
    console.log(result);
    res.send(result);
  });
} catch (error) {
  console.log("Put User", error.name, error.massage, error.stack);
}
// second-hand-products **ok
// Put user verified
try {
  app.put("/user/verify/:id",verifyJWT, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const option = { upsert: true };
    const updateDoc = {
      $set: {
        user_role: "verified",
      },
    };
    const result = await userCollections.updateOne(filter, updateDoc, option);
    console.log(result);
    res.send(result);
  });
} catch (error) {
  console.log("Put User verify", error.name, error.massage, error.stack);
}

// second-hand-products **ok
// find admin
try {
  app.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await userCollections.findOne(query);
    res.send({
      isAdmin: user?.role === "admin",
      accountType: user?.accountType,
      user_role: user?.user_role,
    });
  });
} catch (error) {
  console.log("", error.name, error.massage, error.stack);
}

try {
  app.get("/featuredProduct", async (req, res) => {
    const result = await productCollection.find({ advertise: "yes" }).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("featuredProduct", error.name, error.massage, error.stack);
}

// second-hand-products
// Get product by id

try {
  app.get("/categories/:name", async (req, res) => {
    const name = req.params.name;
    const filter = { category: name };
    const result = await productCollection.find(filter).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("Get all product by id", error.name, error.massage, error.stack);
}

// second-hand-products
// Get categories

try {
  app.get("/categories", async (req, res) => {
    const query = {};
    const result = await allCategories.find(query).toArray();
    res.send(result);
  });
} catch (error) {
  console.log("Get all categories", error.name, error.massage, error.stack);
}

app.get("/", (req, res) => {
  res.send("Second hand products server is running");
});

app.listen(port, () => {
  console.log("Second hand products server is running");
});

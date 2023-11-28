const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

//middleware 
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ro1ru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
    const database = client.db('timeKeeper');
    const productCollection = database.collection("products");
    const reviewCollection = database.collection("reviews");
    const userCollection = database.collection("users");
    const orderCollection = database.collection("orders");

    //GET
    app.get('/', (req, res) => {
        res.send('Hello World!');
    })

    //POST (Product)
    app.post('/products', async (req, res) => {
        try{
            let newProduct = req.body;
        const image = req.files.image;
        const imageData = image.data;
        const encodedPic = imageData.toString('base64');
        const imageBuffer = Buffer.from(encodedPic, 'base64');
        newProduct['image'] = imageBuffer;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
        } 
        catch{ err => console.log(err)}
    })

    //GET(Product)
    app.get('/products', async (req, res) => {
        const result = await productCollection.find({}).toArray();
        res.send(result);
    })

    //Delete (Product)
    app.delete('/products/:id', async (req, res) => {
        const id = req.params.id;
        const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    })
    //GET(Product)
    app.get('/products/:id', async (req, res) => {
        const result = await productCollection.findOne({ _id: new ObjectId(req.params.id) });
        res.send(result);
    })

    //POST (Reviews)
    app.post('/reviews', async (req, res) => {
        let newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.send(result);
    })

    // GET (Reviews)
    app.get('/reviews', async (req, res) => {
        const result = await reviewCollection.find({}).toArray();
        res.send(result);
    })

    //POST (Users)
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    //GET (Users)
    app.get('/users', async (req, res) => {
        const result = await userCollection.find({}).toArray();
        res.send(result);
    })

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email
        const result = await userCollection.findOne({ email: email });
        let isAdmin;
        if (result?.role === 'admin') {
            isAdmin = true;
            res.send({ admin: isAdmin });
        } else {
            isAdmin = false;
            res.send({ admin: isAdmin });
        }
    })

    //PUT (Make Admin)
    app.put('/users', async (req, res) => {
        const newAdmin = req.body;
        const filter = { email: newAdmin.email };
        const updateDoc = { $set: { role: 'admin' } }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result)
    })

    //POST(Orders)
    app.post('/orders', async (req, res) => {
        const newOrder = req.body;
        const result = await orderCollection.insertOne(newOrder);
        res.send(result);
    })

    //GET(Orders)
    app.get('/orders', async (req, res) => {
        const email = req.query.email;
        if (email) {
            const result = await orderCollection.find({ email: email }).toArray();
            res.send(result);
        } else {
            const result = await orderCollection.find({}).toArray();
            res.send(result);
        }
    })

    //GET(Orders)
    app.get('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: id };
        const result = await orderCollection.findOne(query);
        res.send(result);
    })

    // //DELETE(Orders)
    app.delete('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: id };
        const result = await orderCollection.deleteOne(query);
        res.send(result);
    })

    //PUT Updated Status
    app.put('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const newStatus = req.body;
        const query = { _id: id };
        const options = { upsert: true };
        const updateDoc = { $set: { OrderStatus: newStatus.OrderStatus } };
        const result = await orderCollection.updateOne(query, updateDoc, options);
        res.send(result);

    })



});
app.listen(port, () => console.log(`Listening on port http://localhost:${port}`));
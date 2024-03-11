const express = require('express');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/User')

const app = express();

dotEnv.config();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDb Connected successfully");
}).catch((error) => {
    console.error(error);
});



const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'mySession'
});


// This code for express-session

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
    store: store
}));


app.get('/signup', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/dashboard', (req, res) => {
    res.render('welcome');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({
            username, email, password
        })
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/signup');
    }
})

// app.get('/', (req, res) => {
//     res.send(`Server is running at ${PORT}`);
// });

app.listen(PORT, () => {
    console.log(`Server running successfully @ ${PORT}`);
});
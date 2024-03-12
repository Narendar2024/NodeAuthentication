const express = require('express');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/User');
const bccrypt = require('bcryptjs');


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

const checkAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}


app.get('/signup', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/dashboard', checkAuth, (req, res) => {
    res.render('welcome');
});

// app.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         const newUser = new User({
//             username, email, password
//         })
//         await newUser.save();
//         req.session.person = username
//         res.redirect('/login');
//     } catch (err) {
//         console.error(err);
//         res.redirect('/signup');
//     }
// })

// app.get('/', (req, res) => {
//     res.send(`Server is running at ${PORT}`);
// });

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.redirect('/signup');
        }
        const hashPassword = await bccrypt.hash(password, 12);
        user = new User({
            username,
            email,
            password: hashPassword
        });
        req.session.person = user.username
        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error(`${error}`);
    }
})

app.post('/user-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.redirect('/signup')
        }
        const checkPassword = await bccrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.redirect('/signup');
        }
        req.session.isAuthenticated = true
        res.redirect('/dashboard');
    } catch (error) {
        console.error(`${error}`);
    }
})
app.listen(PORT, () => {
    console.log(`Server running successfully @ ${PORT}`);
});
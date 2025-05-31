const express =require('express');
const dotenv= require('dotenv').config();
const cors = require('cors');
const {mongoose} = require('mongoose');
const cookieParser = require('cookie-parser');
require('./server'); // imports and starts server.js

const app = express();

//database connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Daatabase Connected'))
.catch((err) => console.log('Database not Connected', err))

//middleware 
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))


app.use('/', require('./routes/authRoutes'));
app.use('/api/mobile/data', require('./routes/MobileData'));
app.use('/api/workers', require('./routes/workerRoutes'));


const port =8000;
app.listen(port, ()=>console.log(`Server is running on port ${port}`))
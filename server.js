import express from 'express';
import connectDatabase from './config/db';
import {check, validationResult} from 'express-validator';
import cors from 'cors';

//initialize express application

const app = express();

//connect database
connectDatabase();

//configure Middleware
app.use(express.json({extended: false}));
app.use(
    cors({
        origin:'http://localhost:3000'
    })
);
// API endpoints
/**
 * @route GET
 * @desc Test endpoint
 */

app.get('/', (req, res) =>
    res.send('http get request sent to root api endpoint')
    );

/**
 * @route POST api/user
 * @desc Register user
**/   
app.post('/api/users', (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

//connection listener
const port = 3000;
app.listen(port, () => 
console.log ('Express server running on port 3000')
);
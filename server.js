import express from 'express';
import connectDatabase from './config/db';
import {check, validationResult} from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from './models/User';
import auth from './middleware/auth';
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
    res.send('http get request sent to root api endpoint'),
    );
app.get('/api/', (res, req) => res.send('http get request sent to api'));

app.post(
    '/api/users',
    [
        check('name', 'Please enter your name').not().isEmpty(),
        check('email', 'PLease enter a valid email').isEmail(),
        check('password', 'Please enter a password with 6 0r more characters').isLength({min:6})
    ], 
    async (req, res) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors: errors.array()});
        }else{
            const {name, email, password} = req.body;
            try{
                //check if user exists
                let user = await User.findOne({email: email});
                if(user){
                    return res
                    .status(400)
                    .json({errors: [{msg: 'User already exists'}]});
                }
                //create a new user
                user = new User({
                    name: name, 
                    email: email,
                    password: password
                });
                //encrypt the password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                //save to db and return 
                await user.save();
                //generate and return a jwt token
                returnToken(user, res);
            }catch(error){
                res.status(500).send('Server error');
            }
        }
    }
);
/**
 * @route POST api/user
 * @desc Register user
**/   
app.post(
    '/api/users',
    [
        check ('name', 'Please enter your name')
        .not()
        .isEmpty(), 
        check('email', 'Please enter a valid email')
        .isEmail(),
        check(
            'password','Please enter a password with 6 or more characters'
            ).isLength({ min: 6 })
        ],

    async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            } else {
                const { name, email, password } = req.body;
                try {
                    //Check if user exists
                    let user = await User.findOne({ email: email});
                    if (!user) {
                        return res
                            .status (400)
                            .json({ errors: [{ msg: 'User already exists'}] });
                    }
                    //create a new user
                    user = new User ({
                        name: name,
                        email: email,
                        password: password
                    });
                    //encrypt the password
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(password, salt);

                    //save to the db and return
                    await user.save();
                    
                    //generate and return a JWT token
                    returnToken(user, res);
                    
                }   catch (error){
                    res.status(500).send('Server error');
                }
            }
        }   
);
/*
*@route GET api/auth
*@desc Authenticate
*/
app.get('/api/auth', auth, async(req, res) =>{
    try{
        const user= await User.findById(req.user.id);
        res.status(200).json(user);
    }catch(error){
        res.status(500).send('Unknown server error');
    }
});
//@route Post api/login
//@login user

app.post(
    '/api/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'A password is required').exists()
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(422).json({errors:errors.array()});
        }else{
            const{email,password} = req.body;
            try{
                //check if user exists
                let user = await User.findOne({email:email });
                if(!user){
                    return res
                    .status(400)
                    .json({errors:[{msg:'Invalid email or password'}]})
                }

                //check password
                const match= await bcrypt.compare(password, user.password);
                if(!match){
                    return res
                    .status(400)
                    .json({errors:[{msg:'Invalid email or password'}]});
                }
                //generate and return a JWT token
                returnToken(user,res);
            }catch(error){
                res.status(500).send('server error');
            }
        }
    }
);
const returnToken = (user, res)=>{
    const payload={
        user: {
            id:user.id
        }
    };
    jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn:'10hr'},
        (err, token)=>{
            if(err) throw err;
            res.json({token:taken});
        }
    );
};

//connection listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));

//connection listener
//app.listen(3000, () => console.log ('Express server running on port 3000'));

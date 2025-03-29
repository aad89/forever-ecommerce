import validator from 'validator'
import userModel from './../models/userModel.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


const createToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET)
}

const loginUser = async(req,res)=>{
    try {
        const {email, password} = req.body;

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: "User does'nt exists"})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = createToken(user._id);
            res.json({success: true, token})
        }else{
            res.json({success: false, message: "invalid credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

const registerUser = async(req,res)=>{
    try {
        const {name,email,password} = req.body;

        //checking user exists

        const exists = await userModel.findOne({email: email})
        if(exists){
            return res.json({success: false, message:"User Already Exists."})
        }

        //validating email format and strong password

        if (!validator.isEmail(email)) {
            return res.json({success: false, message:"Please enter a valid Email."})
        }
        if(password.length < 8){
            return res.json({success: false, message:"Please enter a strong Password."})
        }

        //hashing password
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({success:true, token})


    } catch (error) {
        console.log(error);
        res.json({success: false, message: error})
    }
}

const adminLogin = async(req,res)=>{
    try {
        const {email, password} = req.body;

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true, token})
        } else{
            res.json({success: false, message: "Invalid credentials "})
        }


    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

export {loginUser, registerUser, adminLogin}
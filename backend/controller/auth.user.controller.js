import bcryptjs from "bcryptjs";
import User from "../model/user.model.js";
import { generateUsername } from "../libs/username.js";
import {createJSONwebToken} from "../libs/jwt.js"

export const signupController = async(req,res)=>{
    try {
        const {email,password,phone} = req.body;
        if(!email || !password || !phone) return res.status(400).json({success:false,message:"All fields are required"});

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password,salt);

        if(!hashedPassword) return res.status(500).json({success:false,message:"Internal server error"})

        const user = User({
            email,
            password:hashedPassword,
            phone,
            as_guest:false
        })

        await user.save();

        const token = createJSONwebToken(email);

        delete user.password;

        res.status(201).send({success:true,token,user});


    } catch (error) {
        console.log("error while creating an account : ",error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

export const loginController = async(req,res)=>{
    try {
        console.log("login back")
        const {email,password} = req.body;
        if(!email || !password) return res.status(400).json({success:false,message:"All fields are required"});
        console.log("emial ",email,password)
        const user = await User.findOne({email});
        console.log("user ",user)
        if(!user) return res.status(400).json({success:false,message:"Credentials are invalid"});

        const isVerify = await bcryptjs.compare(password,user.password);
        if(!isVerify) return res.status(400).json({success:false,message:"Invalid credentials"});

        const token = createJSONwebToken(email);
        
        delete user.password;
        console.log("login conf ");
        res.send({success:true,token,user});

    } catch (error) {
        console.log("error while logging : ",error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

export const loginAsGuestController = async(req,res)=>{
    try {
        const {as_guest} = req.body;
        if(!as_guest.toString()) return res.status(400).json({success:false,message:"All fields are required"});

        if(as_guest && !req.body?.id){
            const user = User({
                fullname: generateUsername("user")
            })
            if(!user) return res.status(400).json({success:false,message:"Credentials are invalid"});        
    
            await user.save();
            res.send({success:true,user});
        }else{
            const {id,fullname,phone,email,password} = req.body;
            if(!email || !password || !phone || !fullname) return res.status(400).json({success:false,message:"All fields are required"});

            const existUser = await User.findOne({email});
            if(existUser) return res.status(400).json({success:false,message:"Account Already exists"})

            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password,salt);
            if(!hashedPassword) return res.status(500).json({success:false,message:"Internal server error"})

            const user = await User.findOneAndUpdate({id},{
                fullname,
                phone,
                email,
                password:hashedPassword,
                as_guest:false
            },{new:true})
            if(!user) return res.status(400).json({success:false,message:"Bad request"});

            delete user.password;
            res.send({success:true,user});
        }

    } catch (error) {
        console.log("error while logging as guest : ",error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }

}

export const getUserController = async(req,res)=>{
    try {
        const user = req.user;
        res.send({user})
    } catch (error) {
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import { loginValidation, registerValidation } from "../validation/user-validation.js"
import { ResponseError } from "../error/response-error.js";
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";

const register = async (request) => {
    const user = validate(registerValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            email: user.email
        }
    })

    if(countUser > 1){
        throw new ResponseError(400, "Username already exists");
    }

    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            name: true,
            email: true
        }
    }) 
}

const login = async(request) => {
    const loginRequest = validate(loginValidation, request);

    const user = await prismaClient.user.findUnique({
        where:{
            email: request.email
        },
        select:{
            email: true,
            password: true
        }
    });

    if(!user){
        throw new ResponseError(401, "Invalid email or password")
    }

    const validPassword = await bcrypt.compare(request.password, user.password);

    if(!validPassword){
        throw new ResponseError(401, "Invalid email or password")
    }

    const token = uuid().toString();

    return prismaClient.user.update({
        data:{
            token: token
        },
        where:{
            email: user.email
        },
        select:{
            token: true
        }
    })
}

export default {register, login}
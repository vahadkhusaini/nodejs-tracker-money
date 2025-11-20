import {validate} from "../validation/validation.js";
import {prismaClient} from "../application/database.js";
import { loginValidation, registerValidation, getUserValidation, updateUserValidation } from "../validation/user-validation.js"
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

const get = async (email) => {
    // Get user function implementation will go here

    email = validate(getUserValidation, email);

    const user = await prismaClient.user.findUnique({
        where: {
            email: email
        },
        select: {
            email: true,
            name: true
        }
    });

    if (!user) {
        throw new ResponseError(404, "User not found");
    }

    return user;
}

const update = async (request) => {
    // Update user function implementation will go here

    const user = validate(updateUserValidation, request);

    const totalUserInDatabase = await prismaClient.user.count({
        where: {
            email: user.email
        }
    });

    if (totalUserInDatabase === 0) {
        throw new ResponseError(404, "User not found");
    }

    const updateData = {};

    if (user.password) {
        updateData.password = await bcrypt.hash(user.password, 10);
    }

    if (user.name) {
        updateData.name = user.name;
    }

    return prismaClient.user.update({
        data: updateData,
        where: {
            email: user.email
        },
        select: {
            email: true,
            name: true
        }
    });
}   

const logout = async (email) => {

    email = validate(getUserValidation, email);

    const user = await prismaClient.user.findUnique({
        where: {
            email: email
        },
        select: {
            email: true
        }
    });

    if(!user) {
        throw new ResponseError(404, "User not found");
    }

    return prismaClient.user.update({
        where: {
            email: email
        },
        data: {
            token: null
        },
        select: {
            email: true
        }
    });

}

export default {register, login, get, update, logout}
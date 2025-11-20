import Joi from "joi";

const registerValidation = Joi.object({
    email: Joi.string().max(255).email().required(),
    name: Joi.string().max(255).required(),
    password: Joi.string().max(255).required()
});

const loginValidation = Joi.object({
    email: Joi.string().max(255).email().required(),
    password: Joi.string().max(255).required()
});

const updateUserValidation = Joi.object({
    email: Joi.string().max(100).required(),
    password: Joi.string().max(100).optional(),
    name: Joi.string().max(100).optional(),
});

const getUserValidation = Joi.string().max(100).required();


export {registerValidation, loginValidation, getUserValidation, updateUserValidation}
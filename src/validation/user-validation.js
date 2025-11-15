import Joi from "joi";

const registerValidation = Joi.object({
    email: Joi.string().max(255).required(),
    name: Joi.string().max(255).required(),
    password: Joi.string().max(255).required()
});

export {registerValidation}
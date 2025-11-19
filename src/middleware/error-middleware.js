import { ResponseError } from "../error/response-error.js";

const errorMiddleware = (err, req, res, next) => {

    if(!err) {
        return next();
    }

    if (err instanceof ResponseError) {
        res.status(err.status).json({
            errors: err.message
        }).end();
    } else {
        console.error(err);
        res.status(500).json({
            error: err.message
        }).end();
    }
}

export {errorMiddleware};

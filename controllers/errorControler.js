const { handle } = require('express/lib/router');
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate field value "${value}". Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => {
    const message = 'Invalid token. Please log in again!';
    return new AppError(message, 401);
}

const handleJWTExpiredError = () => {
    const message = 'Your token has expired. Please log in again!';
    return new AppError(message, 401);
}

const sendErrorDev = (err, req, res) => {
    // API
    console.log(req.originalUrl);
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    // RENDERED WEBSITE
    console.error('💥 Error: ,', err);
    return res.status(err.statusCode).render('error', {
        title:'Something went wrong',
        msg: err.message
    });
};

const sendErrorProd = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')){
        // Operational, trusted error: send message to the client
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        //Programming or other unknown error: Don't leak error details
        // 1. Log the error
        console.error('💥 Error: ,', err);
        // 2. Send a generic message
        return res.status(500).json({
            status: 'error',
            message: 'Ups, something went wrong'
        });
    }
    // RENDERED WEBSITE
    if(err.isOperational){
        return res.status(err.statusCode).render('error', {
            title:'Something went wrong',
            msg: err.message
        });
    }
    //Programming or other unknown error: Don't leak error details
    // 1. Log the error
    console.error('💥 Error: ,', err);
    // 2. Send a generic message
    return res.status(err.statusCode).render('error', {
        title:'Something went wrong',
        msg: 'Please try again later'
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req, res);
    } else if(process.env.NODE_ENV === 'production'){
        let error = JSON.parse(JSON.stringify(err));
        error.message = err.message;
        
        // Catch CastErrors
        if(error.name === 'CastError'){
            error = handleCastErrorDB(error);
        }
        // Catch Duplicate fields
        if(error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        // Catch ValidationErrors
        if(error.name === 'ValidationError'){
            error = handleValidationErrorDB(error);
        }
        // Catch  AuthError (JWT)
        if(error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        // Catch TokenExpiredError (JWT)
        if(error.name === 'TokenExpiredError'){
            error = handleJWTExpiredError()
        }
        sendErrorProd(error, req, res);
    }
    
};
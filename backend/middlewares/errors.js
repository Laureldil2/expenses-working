exports.notFound = (req, res, next) => {
    const err = new Error('404 page not found');
    err.status = 404;
    next(err);
}

exports.catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err)); //options.fn
    }
}

exports.catchErrors = (err, req, res, next) => {
    console.log(err.message)
    res.status(err.status || 500).json({
        message: err.message
    });
    next(err)
}

exports.checkAvailability = (req, res, next) => {
    if(process.env.off == 1) {
        const err = new Error('503 Service temporary unavailable');
        err.status = 503;
        next(err);
    } else
    next();
}
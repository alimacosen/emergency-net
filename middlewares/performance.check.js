exports.performanceCheck = (req, res, next) => {
    // System is under testing. 
    if (serverStatus === 2 && (req.user == null || req.user.userId != administrater)) {
        return res.sendStatus(401);
    }
    next();
}
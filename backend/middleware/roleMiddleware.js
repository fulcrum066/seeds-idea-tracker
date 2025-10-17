module.exports.authorize = (...allowed) => {
    return (req, res, next) => {
        const roles = req.user?.roles || [];
        const ok = roles.some(r => allowed.includes(r));
        if (!ok) {
            res.status(403);
            throw new Error("Forbidden");
        }
        next();
    };
};

// Middleware to ensure the user is logged in for API routes
export const ensureLoggedInApi = (req, res, next) => {
    if (!req.session?.userId) return res.status(401).json({
        error: "Unauthorized"
    });
    next();
};
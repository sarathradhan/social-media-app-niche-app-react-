// API authentication guard. It ensures protected routes reject unauthenticated requests with a consistent 401 response.
import { sendError } from "../utils/apiResponse.js";

export const ensureLoggedInApi = (req, res, next) => {
    if (!req.session?.userId) {
        return sendError(res, 401, "Please log in to continue.");
    }
    next();
};
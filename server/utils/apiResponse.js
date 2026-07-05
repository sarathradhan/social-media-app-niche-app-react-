// Shared helpers for sending standardized JSON success and error responses from the server.
export function sendSuccess(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

export function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

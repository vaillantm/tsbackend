"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.error('[error]', err);
    }
    res.status(status).json({ message });
}

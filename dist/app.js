"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const error_1 = require("./middleware/error");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./swagger"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const categories_routes_1 = __importDefault(require("./routes/categories.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const uploads_routes_1 = __importDefault(require("./routes/uploads.routes"));
const admin_orders_routes_1 = __importDefault(require("./routes/admin.orders.routes"));
const reviews_routes_1 = __importDefault(require("./routes/reviews.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
const allowedOrigins = [
    'http://localhost:5173',
    'https://tsxfrontend.vercel.app',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/categories', categories_routes_1.default);
app.use('/api/products', products_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/admin/orders', admin_orders_routes_1.default);
app.use('/api/uploads', uploads_routes_1.default);
app.use('/api/v1/reviews', reviews_routes_1.default);
app.use('/api/v1/products', products_routes_1.default);
app.use('/api/v1/users', users_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
});
app.use(error_1.errorHandler);
exports.default = app;

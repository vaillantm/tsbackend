import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import { errorHandler } from './middleware/error';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/orders.routes';
import uploadRoutes from './routes/uploads.routes';
import adminOrderRoutes from './routes/admin.orders.routes';
import reviewRoutes from './routes/reviews.routes';

const app = express();

// Security headers
app.use(helmet());

// CORS setup for frontend with credentials
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // allow cookies/auth headers
}));

// Handle preflight requests explicitly
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger/OpenAPI docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling
app.use(errorHandler);

export default app;

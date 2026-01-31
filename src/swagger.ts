import { Express, Request, Response } from 'express';
import { config } from './config/env';

// Minimal, dependency-light Swagger setup.
// Always serves JSON at /api/docs.json. If swagger-ui-express is installed, also serves UI at /api/docs.
export function setupSwagger(app: Express) {
  const openapi = buildOpenApiSpec();

  // JSON spec
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.json(openapi);
  });

  // Optional UI if dependency exists
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const swaggerUi = require('swagger-ui-express');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  } catch (_) {
    // No UI installed; only JSON is served.
  }
}

function buildOpenApiSpec() {
  const bearerAuth = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  } as const;

  return {
    openapi: '3.0.3',
    info: {
      title: 'Eshop Backend API',
      version: '1.0.0',
      description: 'REST API for authentication, users, categories, products, cart, and orders.'
    },
    servers: [
      { url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.PORT}` }
    ],
    tags: [
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Categories' },
      { name: 'Products' },
      { name: 'Cart' },
      { name: 'Orders' }
    ],
    components: {
      securitySchemes: { bearerAuth },
      schemas: buildSchemas(),
    },
    security: [],
    paths: buildPaths(),
  } as const;
}

// Export spec as default for direct mounting with swagger-ui-express
const swaggerSpec = buildOpenApiSpec();
export default swaggerSpec;

function buildSchemas() {
  return {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'vendor', 'customer'] },
        avatar: { type: 'string' }
      }
    },
    Category: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        path: { type: 'string' },
        image: { type: 'string' },
        createdBy: { type: 'string' }
      },
      required: ['name', 'path']
    },
    Product: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' },
        images: { type: 'array', items: { type: 'string' } },
        categoryId: { type: 'string' },
        vendorId: { type: 'string' },
      },
      required: ['name', 'price', 'quantity', 'categoryId']
    },
    CartItem: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        quantity: { type: 'number', minimum: 1 }
      },
      required: ['productId', 'quantity']
    },
    Cart: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } }
      }
    },
    OrderItem: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        name: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'number' },
      }
    },
    Order: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        userId: { type: 'string' },
        items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        totalAmount: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
      }
    },
    Message: {
      type: 'object',
      properties: { message: { type: 'string' } }
    },
    AuthToken: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: { $ref: '#/components/schemas/User' }
      }
    }
  } as const;
}

function bearer() {
  return [{ bearerAuth: [] }];
}

function buildPaths() {
  return {
    // Health
    '/api/health': {
      get: {
        tags: ['Auth'],
        summary: 'Healthcheck',
        responses: { '200': { description: 'OK' } }
      }
    },

    // Auth
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register',
        requestBody: {
          required: true,
          content: { 'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                role: { type: 'string', enum: ['admin', 'vendor', 'customer'] }
              },
              required: ['name', 'email', 'password']
            }
          } }
        },
        responses: { '201': { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthToken' } } } } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } } },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthToken' } } } } }
      }
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'My profile', security: bearer(), responses: { '200': { description: 'OK' } } },
      patch: { tags: ['Auth'], summary: 'Update own profile', security: bearer(), requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, avatar: { type: 'string' } } } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/auth/change-password': {
      post: { tags: ['Auth'], summary: 'Change password', security: bearer(), requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['currentPassword', 'newPassword'] } } } }, responses: { '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } } } }
    },
    '/api/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Forgot password', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } }, required: ['email'] } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['token', 'newPassword'] } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout', security: bearer(), responses: { '200': { description: 'OK' } } }
    },

    // Users (Admin)
    '/api/users': {
      get: { tags: ['Users'], summary: 'List users', security: bearer(), responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } }
    },
    '/api/users/{id}': {
      get: { tags: ['Users'], summary: 'Get user', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      patch: { tags: ['Users'], summary: 'Update user', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Users'], summary: 'Delete user', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'No Content' } } }
    },

    // Categories
    '/api/categories': {
      get: { tags: ['Categories'], summary: 'List categories', responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        security: bearer(),
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  path: { type: 'string' },
                  image: { type: 'string', format: 'binary' }
                },
                required: ['name', 'path']
              }
            },
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' }
            }
          }
        },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/api/categories/{id}': {
      get: { tags: ['Categories'], summary: 'Get category', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      patch: {
        tags: ['Categories'],
        summary: 'Update category',
        security: bearer(),
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  path: { type: 'string' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            },
            'application/json': {
              schema: { $ref: '#/components/schemas/Category' }
            }
          }
        },
        responses: { '200': { description: 'OK' } }
      },
      delete: { tags: ['Categories'], summary: 'Delete category', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'No Content' } } }
    },

    // Products
    '/api/products': {
      get: { tags: ['Products'], summary: 'List products', responses: { '200': { description: 'OK' } } },
      post: {
        tags: ['Products'],
        summary: 'Create product (images optional)',
        security: bearer(),
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  quantity: { type: 'number' },
                  categoryId: { type: 'string' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } }
                },
                required: ['name', 'price', 'quantity', 'categoryId']
              }
            },
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' }
            }
          }
        },
        responses: { '201': { description: 'Created' } }
      }
    },
    '/api/products/{id}': {
      get: { tags: ['Products'], summary: 'Get product', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      patch: { tags: ['Products'], summary: 'Update product', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Products'], summary: 'Delete product', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '204': { description: 'No Content' } } }
    },

    // Cart (all authenticated)
    '/api/cart': {
      get: { tags: ['Cart'], summary: 'Get my cart', security: bearer(), responses: { '200': { description: 'OK' } } }
    },
    '/api/cart/add': {
      post: { tags: ['Cart'], summary: 'Add to cart', security: bearer(), requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'number' } }, required: ['productId'] } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/cart/quantity': {
      patch: { tags: ['Cart'], summary: 'Update quantity', security: bearer(), requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'number' } }, required: ['productId', 'quantity'] } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/cart/remove': {
      delete: { tags: ['Cart'], summary: 'Remove from cart', security: bearer(), requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' } }, required: ['productId'] } } } }, responses: { '200': { description: 'OK' } } }
    },
    '/api/cart/clear': {
      delete: { tags: ['Cart'], summary: 'Clear cart', security: bearer(), responses: { '200': { description: 'OK' } } }
    },

    // Orders
    '/api/orders': {
      post: { tags: ['Orders'], summary: 'Create order from cart', security: bearer(), responses: { '201': { description: 'Created' }, '400': { description: 'Cart is empty' } } },
      get: { tags: ['Orders'], summary: 'My orders', security: bearer(), responses: { '200': { description: 'OK' } } }
    },
    '/api/orders/{id}': {
      get: { tags: ['Orders'], summary: 'Get my order', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } }
    },
    '/api/orders/{id}/cancel': {
      patch: { tags: ['Orders'], summary: 'Cancel my order (pending only)', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '400': { description: 'Cannot cancel' } } }
    },

    // Admin orders (reflecting current routing under /api/orders/admin/*)
    '/api/orders/admin/all': {
      get: { tags: ['Orders'], summary: 'Admin list all orders', security: bearer(), responses: { '200': { description: 'OK' } } }
    },
    '/api/orders/admin/{id}/status': {
      patch: { tags: ['Orders'], summary: 'Admin update order status', security: bearer(), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] } }, required: ['status'] } } } }, responses: { '200': { description: 'OK' } } }
    }
    ,

    // Uploads
    '/api/uploads/profile': {
      post: {
        tags: ['Auth'],
        summary: 'Upload profile image',
        security: bearer(),
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] }
            }
          }
        },
        responses: { '201': { description: 'Uploaded' }, '400': { description: 'No file uploaded' } }
      }
    },
    
  } as const;
}

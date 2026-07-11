/**
 * Global Error Handling Middleware.
 * This intercepts all errors thrown in controllers, services, or other middlewares
 * and sends a consistent JSON response to the client.
 */
export default function errorMiddleware(err, req, res, next) {
  // Log the complete error stack as a string to avoid Node v24 util.inspect bugs with ZodError objects
  console.error("[Error Handler]:", err.stack || err.message || err);

  // 1. Zod Validation Error handling
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // 2. Prisma Database Constraint violation handling
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      // P2002 is Prisma's code for Unique Constraint Violation (e.g. duplicating email)
      const field = err.meta?.target?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `Duplicate value error: A record with this '${field}' already exists.`
      });
    }
    if (err.code === 'P2025') {
      // P2025 is Prisma's code for Record Not Found
      return res.status(404).json({
        success: false,
        message: err.meta?.cause || 'The requested database record was not found.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Database Error: ${err.message}`
    });
  }

  // 3. Custom errors or general server errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message: message
  });
}

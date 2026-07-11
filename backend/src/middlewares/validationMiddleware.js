/**
 * Validation Middleware.
 * Creates an Express middleware that validates the incoming request payload (body, query, or params)
 * against a Zod validation schema. If validation succeeds, it overwrites the field with the parsed/validated
 * data (to ensure type conversions like strings-to-dates apply). If it fails, it forwards the ZodError
 * to the global error handler.
 * 
 * @param {ZodSchema} schema - The Zod schema to validate against.
 * @param {string} source - Where to look for the data ('body', 'query', or 'params'). Defaults to 'body'.
 */
export default function validationMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    try {
      // Parse data and perform any default values or type conversions (e.g. date conversion)
      const parsedData = schema.parse(req[source]);
      
      // Update the request with the parsed data
      req[source] = parsedData;
      
      next();
    } catch (error) {
      // Forward Zod error to the global error handler middleware
      next(error);
    }
  };
}

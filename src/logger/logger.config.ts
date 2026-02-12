/**
 * @file logger.config.ts
 * @brief Pino HTTP logger configuration for nestjs-pino.
 * @details Exports pinoHttp options used by LoggerModule.forRoot() so that
 *          log level and pretty-printing are environment-dependent (debug and
 *          pretty in non-production, info and JSON in production). This
 *          supports structured logs for production and readable console
 *          output during development.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

/**
 * @brief Whether the application is running in a production environment.
 * @details Derived from process.env.NODE_ENV; used to set log level and
 *          pretty-print behaviour.
 */
const isProduction: boolean = process.env.NODE_ENV === "production";

/**
 * @brief Log level for the Pino HTTP logger.
 * @details 'debug' in non-production for easier debugging; 'info' in
 *          production to reduce volume and avoid sensitive debug data.
 */
const logLevel: "debug" | "info" | "warn" | "error" = isProduction
  ? "info"
  : "debug";

/**
 * @brief Pino HTTP options for nestjs-pino LoggerModule.
 * @details Configures level and optional pino-pretty transport for
 *          development. In production, no transport is used so logs
 *          are written as JSON to stdout. Type is compatible with
 *          LoggerModule.forRoot({ pinoHttp }).
 */
export const pinoHttpOptions: {
  level: string;
  transport?: {
    target: string;
    options: { colourise: boolean; translateTime: string };
  };
} = {
  level: logLevel,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colourise: true,
            translateTime: "SYS:standard",
          },
        },
      }),
};

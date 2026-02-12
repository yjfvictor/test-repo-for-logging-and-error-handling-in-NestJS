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
 * @var isProduction
 * @type boolean
 * @brief Whether the application is running in a production environment.
 * @details Derived from process.env.NODE_ENV; used to set log level and
 *          pretty-print behaviour.
 */
const isProduction: boolean = process.env.NODE_ENV === "production";

/**
 * @var logLevel
 * @type "debug" | "info" | "warn" | "error"
 * @brief Log level for the Pino HTTP logger.
 * @details 'debug' in non-production for easier debugging; 'info' in
 *          production to reduce volume and avoid sensitive debug data.
 */
const logLevel: "debug" | "info" | "warn" | "error" = isProduction
  ? "info"
  : "debug";

/**
 * @var pinoHttpOptions
 * @type class
 * @brief Pino HTTP options for nestjs-pino LoggerModule.
 * @details Configures level and optional pino-pretty transport for
 *          development. In production, no transport is used so logs
 *          are written as JSON to stdout. Type is compatible with
 *          LoggerModule.forRoot({ pinoHttp }).
 */
export const pinoHttpOptions: {
  /**
   * @var level
   * @type string
   * @brief Log level for the Pino HTTP logger.
   * @details 'debug' in non-production for easier debugging; 'info' in
   *          production to reduce volume and avoid sensitive debug data.
   */
  level: string;
  /**
   * @var transport
   * @type object
   * @brief Transport for the Pino HTTP logger.
   * @details 'pino-pretty' in non-production for human-readable output;
   *          empty in production to write logs as JSON to stdout.
   */
  transport?: {
    /**
     * @var target
     * @type string
     * @brief Target for the Pino HTTP logger.
     * @details 'pino-pretty' in non-production for human-readable output;
     *          empty in production to write logs as JSON to stdout.
     */
    target: string;
    /**
     * @var options
     * @type object
     * @brief Options for the Pino HTTP logger.
     * @details 'colourise: true' in non-production for human-readable output;
     *          'translateTime: "SYS:standard"' in non-production for timestamp
     *          in human-readable format; empty in production.
     */
    options: {
      /**
       * @var colourise
       * @type boolean
       * @brief Whether to colourise the output.
       * @details 'true' in non-production for human-readable output;
       *          'false' in production to write logs as JSON to stdout.
       */
      colourise: boolean;
      /**
       * @var translateTime
       * @type string
       * @brief The format of the timestamp.
       * @details Passed to pino-pretty; "SYS:standard" yields human-readable
       *          timestamps in the system locale. Omitted in production when
       *          logs are raw JSON.
       */
      translateTime: string;
    };
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

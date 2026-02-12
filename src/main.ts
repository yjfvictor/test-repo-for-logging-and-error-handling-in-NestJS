/**
 * @file main.ts
 * @brief Application entry point for the NestJS logging and error-handling demo.
 * @details Bootstraps the NestJS application with Pino-based structured logging
 *          and a global exception filter. Configures the HTTP adapter and starts
 *          the server on the configured port. Uses bufferLogs so that the
 *          application logger can be replaced with the Pino Logger after the
 *          module graph is built.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";

/**
 * @function bootstrap
 * @type function
 * @brief Bootstraps and starts the NestJS application.
 * @details Creates the Nest application with logging buffered, installs the
 *          Pino logger as the application logger, registers the global
 *          exception filter using the HTTP adapter host (for platform-agnostic
 *          reply), and listens on PORT or 3000.
 * @returns Promise that resolves when the server is listening.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  /**
   * @var logger
   * @type Logger
   * @brief Application-level Pino logger from nestjs-pino.
   * @details Obtained from the module after creation; set as the application
   *          logger via useLogger() so that all NestJS bootstrap and runtime
   *          logs use Pino.
   */
  const logger: Logger = app.get(Logger);
  app.useLogger(logger);

  /**
   * @var httpAdapterHost
   * @type HttpAdapterHost
   * @brief Host providing the HTTP adapter for platform-agnostic responses.
   * @details Passed to AllExceptionsFilter so that the filter can send error
   *          responses via the adapter (works with both Express and Fastify).
   */
  const httpAdapterHost: HttpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  /**
   * @var port
   * @type number
   * @brief Port on which the HTTP server will listen.
   * @details Read from the PORT environment variable if set; otherwise defaults
   *          to 3000.
   */
  const port: number = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    "Bootstrap",
  );
}

bootstrap();

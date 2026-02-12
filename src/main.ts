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

  /** @type {Logger} Application-level Pino logger from nestjs-pino. */
  const logger: Logger = app.get(Logger);
  app.useLogger(logger);

  /** @type {HttpAdapterHost} Host providing the HTTP adapter for platform-agnostic responses. */
  const httpAdapterHost: HttpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  /** @type {number} Port on which the HTTP server will listen. */
  const port: number = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}`,
    "Bootstrap",
  );
}

bootstrap();

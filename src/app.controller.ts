/**
 * @file app.controller.ts
 * @brief Root HTTP controller for the demo application.
 * @details Exposes a GET / endpoint that returns a welcome message and
 *          demonstrates logging. Also exposes GET /error and GET /http-error
 *          to trigger the global exception filter for testing.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { AppService } from "./app.service";

/**
 * @class AppController
 * @brief Root HTTP controller.
 * @details Handles GET / for the welcome message and GET /error, GET /http-error
 *          for exception filter demonstration. Uses NestJS Logger (backed by
 *          Pino when nestjs-pino is configured) for request-scoped logs.
 */
@Controller()
export class AppController {
  /**
   * @var logger
   * @type Logger
   * @brief NestJS Logger instance for this controller.
   * @details Context is set to AppController for log correlation.
   */
  private readonly logger: Logger = new Logger(AppController.name);

  /**
   * @function constructor
   * @brief Constructs the controller with the application service.
   * @details The service is used by getHello() to obtain the welcome message;
   *          dependency injection allows the service to be mocked in tests.
   * @param appService Injected application service.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @function getHello
   * @brief Handles GET / and returns the welcome message.
   * @details Logs an info message and delegates to AppService.getHello().
   * @returns The welcome string from the service.
   */
  @Get()
  getHello(): string {
    this.logger.log("Root route requested", AppController.name);
    return this.appService.getHello();
  }

  /**
   * @function getError
   * @brief Handles GET /error and throws a generic Error.
   * @details Used to verify that the global exception filter catches
   *          non-HTTP exceptions and returns a formatted 500 response.
   * @throws {Error} Always throws to trigger the exception filter.
   */
  @Get("error")
  getError(): never {
    this.logger.warn("Intentional error route requested", AppController.name);
    throw new Error("Intentional error for filter testing");
  }

  /**
   * @function getHttpError
   * @brief Handles GET /http-error and throws an HttpException.
   * @details Used to verify that the global exception filter formats
   *          HttpException (and subclasses) with a consistent JSON shape.
   * @throws {HttpException} Always throws with status 400.
   */
  @Get("http-error")
  getHttpError(): never {
    this.logger.warn(
      "Intentional HTTP error route requested",
      AppController.name,
    );
    throw new HttpException(
      { reason: "Bad request for filter testing" },
      HttpStatus.BAD_REQUEST,
    );
  }
}

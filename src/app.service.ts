/**
 * @file app.service.ts
 * @brief Application service for the root module.
 * @details Provides the getHello() method used by the root controller.
 *          Can be extended with further business logic; logging is
 *          available via NestJS Logger when needed.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";

/**
 * @class AppService
 * @brief Application root service.
 * @details Exposes a single method getHello() that returns a welcome message.
 */
@Injectable()
export class AppService {
  /**
   * @var logger
   * @type Logger
   * @brief Logger instance for this service.
   * @details Context is AppService.name for log correlation.
   */
  private readonly logger: Logger = new Logger(AppService.name);

  /**
   * @function getHello
   * @type function
   * @brief Returns a welcome message.
   * @details Algorithm: return a fixed string. No side effects. Logging
   *          can be added here if needed for debugging or auditing.
   * @returns A string containing the welcome message.
   */
  getHello(): string {
    this.logger.debug("getHello() invoked", AppService.name);
    return "Hello from the logging and error-handling demo!";
  }
}

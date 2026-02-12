/**
 * @file all-exceptions.filter.ts
 * @brief Global exception filter that formats all API error responses.
 * @details Catches every unhandled exception (HTTP and non-HTTP), determines
 *          the HTTP status and message, builds a consistent JSON body
 *          (statusCode, timestamp, path, message, errorCode), and sends the
 *          response via the HTTP adapter so it works with both Express and
 *          Fastify. Improves API consistency and debuggability.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { Request } from "express";

/**
 * @interface ApiErrorResponseBody
 * @brief Shape of the JSON body sent for every API error response.
 * @details All error responses from this filter conform to this interface so that
 *          clients may parse them consistently. Each member is documented below
 *          with its type and usage.
 */
export interface ApiErrorResponseBody {
  /**
   * @var number statusCode
   * @brief HTTP status code returned to the client.
   * @details Standard HTTP status value (e.g. 400, 404, 500). Indicates the
   *          outcome of the request from the server's perspective.
   */
  statusCode: number;

  /**
   * @var string timestamp
   * @brief ISO 8601 timestamp at which the error was handled.
   * @details Date and time in ISO 8601 format (e.g. UTC) at which the exception
   *          filter produced the response. Used for auditing and correlation.
   */
  timestamp: string;

  /**
   * @var string path
   * @brief Request URL path that led to the error.
   * @details The path component of the request URL (e.g. /users/123) so that
   *          clients may identify which endpoint failed.
   */
  path: string;

  /**
   * @var string message
   * @brief Human-readable error message.
   * @details A short description of the error suitable for display to users or
   *          for logging. For HttpException this is taken from the response
   *          body; for other exceptions it is a generic message in production.
   */
  message: string;

  /**
   * @var string errorCode
   * @brief Optional error code for programmatic handling.
   * @details When present, a stable code (e.g. VALIDATION_ERROR) that clients
   *          may use to branch logic. Omitted when not provided by the exception.
   */
  errorCode?: string;
}

/**
 * @brief Global exception filter that formats all exceptions as a consistent API error response.
 * @details Implements ExceptionFilter with @Catch() so that it catches every exception.
 *          Uses HttpAdapterHost to get the underlying HTTP adapter and send the response
 *          in a platform-agnostic way. For HttpException (and subclasses), status and
 *          message are taken from the exception; for other errors, status is 500 and
 *          message is a generic string (or the error message in non-production). Logs
 *          the exception at error level for debugging.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * @brief NestJS Logger for logging caught exceptions.
   */
  private readonly logger: Logger = new Logger(AllExceptionsFilter.name);

  /**
   * @brief Constructs the filter with the HTTP adapter host.
   * @param httpAdapterHost Injected host that provides the HTTP adapter.
   */
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * @brief Handles the exception and sends a formatted JSON response.
   * @details 1) Resolves the HTTP adapter from the host. 2) Switches the
   *          arguments host to HTTP to get request and response. 3) Computes
   *          status: HttpException.getStatus() or 500. 4) Builds message and
   *          optional errorCode from the exception (for HttpException, uses
   *          getResponse(); for others, uses a safe message). 5) Builds
   *          ApiErrorResponseBody with statusCode, timestamp (ISO 8601), path,
   *          message, and optional errorCode. 6) Logs the exception. 7) Sends
   *          the response via the adapter.
   * @param exception The thrown exception (any type).
   * @param host The arguments host to access request/response and adapter.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest<Request>();

    const httpStatus: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const path: string = httpAdapter.getRequestUrl(request);

    let message: string;
    let errorCode: string | undefined;

    if (exception instanceof HttpException) {
      const response: string | object = exception.getResponse();
      if (
        typeof response === "object" &&
        response !== null &&
        "message" in response
      ) {
        const msg = (response as { message?: string | string[] }).message;
        message = Array.isArray(msg) ? msg.join(", ") : (msg as string);
      } else if (typeof response === "string") {
        message = response;
      } else {
        message = "An HTTP error occurred";
      }
      if (
        typeof response === "object" &&
        response !== null &&
        "errorCode" in response
      ) {
        errorCode = (response as { errorCode?: string }).errorCode;
      }
    } else {
      message =
        process.env.NODE_ENV !== "production" && exception instanceof Error
          ? exception.message
          : "Internal server error";
    }

    const responseBody: ApiErrorResponseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path,
      message,
      ...(errorCode !== undefined ? { errorCode } : {}),
    };

    this.logger.error(
      `Exception caught: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
      AllExceptionsFilter.name,
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

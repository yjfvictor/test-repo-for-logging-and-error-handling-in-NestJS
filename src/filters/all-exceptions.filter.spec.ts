/**
 * @file all-exceptions.filter.spec.ts
 * @brief Unit tests for AllExceptionsFilter.
 * @details Tests that the filter produces the correct JSON body and status
 *          for HttpException and for generic Error, and that the response
 *          is sent via the HTTP adapter with the correct status and body
 *          shape (statusCode, timestamp, path, message, optional errorCode).
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { ArgumentsHost } from "@nestjs/common/interfaces/features/arguments-host.interface";
import {
  AllExceptionsFilter,
  ApiErrorResponseBody,
} from "./all-exceptions.filter";

describe("AllExceptionsFilter", () => {
  /**
   * @var mockReply
   * @type jest.Mock<void, [unknown, unknown, number]>
   * @brief Mock HTTP adapter with reply(response, body, statusCode).
   * @details Jest mock used to assert that the filter calls the adapter's reply
   *          with the expected response body and status code.
   */
  let mockReply: jest.Mock<void, [unknown, unknown, number]>;

  /**
   * @var mockGetRequestUrl
   * @type jest.Mock<string, [unknown]>
   * @brief Mock getRequestUrl to return a fixed path.
   * @details Returns "/test-path" so that the filter's response body path field
   *          can be asserted consistently.
   */
  let mockGetRequestUrl: jest.Mock<string, [unknown]>;

  /**
   * @var mockResponse
   * @type Record<string, unknown>
   * @brief Mock response object passed to reply().
   * @details Empty object; the adapter's reply() is invoked with this as the
   *          first argument in the filter under test.
   */
  let mockResponse: Record<string, unknown>;

  /**
   * @var mockRequest
   * @type Record<string, unknown>
   * @brief Mock request object (used for URL in adapter).
   * @details Holds a url property; getRequestUrl() is called with this object
   *          to obtain the path included in the error response body.
   */
  let mockRequest: Record<string, unknown>;

  /**
   * @var mockHost
   * @type ArgumentsHost
   * @brief ArgumentsHost mock that provides HTTP context.
   * @details Provides switchToHttp() returning getRequest() and getResponse()
   *          so that the filter can obtain the request and response passed to catch().
   */
  let mockHost: ArgumentsHost;

  /**
   * @var filter
   * @type AllExceptionsFilter
   * @brief Filter instance under test.
   * @details Created in beforeEach with the mocked HttpAdapterHost; each test
   *          invokes filter.catch() with an exception and mockHost.
   */
  let filter: AllExceptionsFilter;

  /**
   * @function beforeEach
   * @type function
   * @brief Sets up the mock reply, getRequestUrl, response, request, and host.
   * @details Sets up the mock reply, getRequestUrl, response, request, and host.
   */
  beforeEach(() => {
    mockReply = jest.fn();
    mockGetRequestUrl = jest.fn().mockReturnValue("/test-path");
    mockResponse = {};
    mockRequest = { url: "/test-path" };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;

    const httpAdapterHost: HttpAdapterHost = {
      httpAdapter: {
        reply: mockReply,
        getRequestUrl: mockGetRequestUrl,
      },
    } as unknown as HttpAdapterHost;

    filter = new AllExceptionsFilter(httpAdapterHost);
  });

  /**
   * @function describe
   * @type function
   * @brief Tests for when catching HttpException.
   * @details Tests that the filter sends the correct status and body with message from exception response.
   */
  describe("when catching HttpException", () => {
    /**
     * @function it
     * @type function
     * @brief Tests that the filter sends the correct status and body with message from exception response.
     * @details Tests that the filter sends the correct status and body with message from exception response.
     */
    it("should send status and body with message from exception response", () => {
      const exception: HttpException = new HttpException(
        { message: "Validation failed" },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockGetRequestUrl).toHaveBeenCalledWith(mockRequest);
      expect(mockReply).toHaveBeenCalledTimes(1);
      const [, body, status]: [unknown, ApiErrorResponseBody, number] =
        mockReply.mock.calls[0] as [unknown, ApiErrorResponseBody, number];
      expect(status).toBe(400);
      expect(body.statusCode).toBe(400);
      expect(body.message).toBe("Validation failed");
      expect(body.path).toBe("/test-path");
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    });

    /**
     * @function it
     * @type function
     * @brief Tests that the filter handles string response from HttpException.
     * @details Tests that the filter handles string response from HttpException.
     */
    it("should handle string response from HttpException", () => {
      const exception: HttpException = new HttpException(
        "Forbidden",
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockHost);

      const callArgs: [unknown, ApiErrorResponseBody, number] = mockReply.mock
        .calls[0] as [unknown, ApiErrorResponseBody, number];
      const body: ApiErrorResponseBody = callArgs[1];
      expect(body.statusCode).toBe(403);
      expect(body.message).toBe("Forbidden");
    });

    /**
     * @function it
     * @type function
     * @brief Tests that the filter includes errorCode when present in response object.
     * @details Tests that the filter includes errorCode when present in response object.
     */
    it("should include errorCode when present in response object", () => {
      const exception: HttpException = new HttpException(
        { message: "Not found", errorCode: "RESOURCE_NOT_FOUND" },
        404,
      );

      filter.catch(exception, mockHost);

      const callArgs: [unknown, ApiErrorResponseBody, number] = mockReply.mock
        .calls[0] as [unknown, ApiErrorResponseBody, number];
      const body: ApiErrorResponseBody = callArgs[1];
      expect(body.errorCode).toBe("RESOURCE_NOT_FOUND");
      expect(body.message).toBe("Not found");
    });

    /**
     * @function it
     * @type function
     * @brief Tests that the filter handles array message in response.
     * @details Tests that the filter handles array message in response.
     */
    it("should handle array message in response", () => {
      const exception: HttpException = new HttpException(
        { message: ["Error one", "Error two"] },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(exception, mockHost);

      const callArgs: [unknown, ApiErrorResponseBody, number] = mockReply.mock
        .calls[0] as [unknown, ApiErrorResponseBody, number];
      const body: ApiErrorResponseBody = callArgs[1];
      expect(body.message).toBe("Error one, Error two");
    });
  });

  /**
   * @function describe
   * @type function
   * @brief Tests for when catching non-HTTP exception.
   * @details Tests that the filter sends the correct status and body with generic message when NODE_ENV is production and with exception message when NODE_ENV is not production.
   */
  describe("when catching non-HTTP exception", () => {
    /**
     * @function it
     * @type function
     * @brief Tests that the filter sends the correct status and body with generic message when NODE_ENV is production.
     * @details Tests that the filter sends the correct status and body with generic message when NODE_ENV is production.
     */
    it("should send 500 and generic message when NODE_ENV is production", () => {
      const originalEnv: string | undefined = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const exception: Error = new Error("Sensitive detail");
      filter.catch(exception, mockHost);

      const [, body, status]: [unknown, ApiErrorResponseBody, number] =
        mockReply.mock.calls[0] as [unknown, ApiErrorResponseBody, number];
      expect(status).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.message).toBe("Internal server error");
      expect(body.path).toBe("/test-path");

      process.env.NODE_ENV = originalEnv;
    });

    /**
     * @function it
     * @type function
     * @brief Tests that the filter sends the correct status and body with exception message when NODE_ENV is not production.
     * @details Tests that the filter sends the correct status and body with exception message when NODE_ENV is not production.
     */
    it("should send 500 and exception message when NODE_ENV is not production", () => {
      const originalEnv: string | undefined = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const exception: Error = new Error("Sensitive detail");
      filter.catch(exception, mockHost);

      const callArgs: [unknown, ApiErrorResponseBody, number] = mockReply.mock
        .calls[0] as [unknown, ApiErrorResponseBody, number];
      const body: ApiErrorResponseBody = callArgs[1];
      expect(body.message).toBe("Sensitive detail");

      process.env.NODE_ENV = originalEnv;
    });
  });

  /**
   * @function describe
   * @type function
   * @brief Tests for the ApiErrorResponseBody shape.
   * @details Tests that the ApiErrorResponseBody always includes statusCode, timestamp, path, and message.
   */
  describe("ApiErrorResponseBody shape", () => {
    /**
     * @function it
     * @type function
     * @brief Tests that the ApiErrorResponseBody always includes statusCode, timestamp, path, and message.
     * @details Tests that the ApiErrorResponseBody always includes statusCode, timestamp, path, and message.
     */
    it("should always include statusCode, timestamp, path, message", () => {
      const exception: HttpException = new HttpException(
        "Test",
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockHost);

      const callArgs: [unknown, ApiErrorResponseBody, number] = mockReply.mock
        .calls[0] as [unknown, ApiErrorResponseBody, number];
      const body: ApiErrorResponseBody = callArgs[1];
      expect(body).toHaveProperty("statusCode");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("path");
      expect(body).toHaveProperty("message");
    });
  });
});

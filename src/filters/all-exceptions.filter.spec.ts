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
   * @brief Mock HTTP adapter with reply(response, body, statusCode).
   */
  let mockReply: jest.Mock<void, [unknown, unknown, number]>;

  /**
   * @brief Mock getRequestUrl to return a fixed path.
   */
  let mockGetRequestUrl: jest.Mock<string, [unknown]>;

  /**
   * @brief Mock response object passed to reply().
   */
  let mockResponse: Record<string, unknown>;

  /**
   * @brief Mock request object (used for URL in adapter).
   */
  let mockRequest: Record<string, unknown>;

  /**
   * @brief ArgumentsHost mock that provides HTTP context.
   */
  let mockHost: ArgumentsHost;

  /**
   * @brief Filter instance under test.
   */
  let filter: AllExceptionsFilter;

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

  describe("when catching HttpException", () => {
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

  describe("when catching non-HTTP exception", () => {
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

  describe("ApiErrorResponseBody shape", () => {
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

/**
 * @file app.controller.spec.ts
 * @brief Unit tests for AppController.
 * @details Tests the root GET / handler, the intentional /error and /http-error
 *          routes, and verifies that the controller delegates to AppService
 *          and logs appropriately. Uses NestJS Testing module and mocks.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  /**
   * @var appController
   * @type AppController
   * @brief Controller instance under test.
   * @details Resolved from the testing module after compilation in beforeEach.
   */
  let appController: AppController;

  /**
   * @var mockAppService
   * @type { getHello: jest.Mock<string, []> }
   * @brief Mock AppService with a getHello implementation.
   * @details Injected in place of AppService; getHello returns the welcome
   *          string so that the controller's getHello() can be asserted.
   */
  let mockAppService: { getHello: jest.Mock<string, []> };

  beforeEach(async () => {
    mockAppService = {
      getHello: jest
        .fn()
        .mockReturnValue("Hello from the logging and error-handling demo!"),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("getHello", () => {
    it("should return the welcome message from the service", () => {
      const result: string = appController.getHello();
      expect(result).toBe("Hello from the logging and error-handling demo!");
      expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
    });
  });

  describe("getError", () => {
    it("should throw a generic Error", () => {
      expect(() => appController.getError()).toThrow(Error);
      expect(() => appController.getError()).toThrow(
        "Intentional error for filter testing",
      );
    });
  });

  describe("getHttpError", () => {
    it("should throw an HttpException with status 400", () => {
      expect(() => appController.getHttpError()).toThrow(HttpException);
      try {
        appController.getHttpError();
      } catch (e) {
        const ex: HttpException = e as HttpException;
        expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(ex.getResponse()).toEqual({
          reason: "Bad request for filter testing",
        });
      }
    });
  });
});

/**
 * @file app.service.spec.ts
 * @brief Unit tests for AppService.
 * @details Tests getHello() returns the expected welcome string. Service has
 *          no dependencies beyond the built-in Logger; only return value
 *          is asserted.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AppService } from "./app.service";

describe("AppService", () => {
  /**
   * @brief Service instance under test.
   */
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe("getHello", () => {
    it("should return the welcome message", () => {
      const result: string = service.getHello();
      expect(result).toBe("Hello from the logging and error-handling demo!");
    });
  });
});

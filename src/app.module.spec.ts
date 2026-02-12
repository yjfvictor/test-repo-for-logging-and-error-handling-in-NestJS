/**
 * @file app.module.spec.ts
 * @brief Unit tests for AppModule.
 * @details Verifies that the root module can be created and that it exports
 *          the expected controller and providers. Does not test the full
 *          module graph with real LoggerModule to keep tests fast.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppModule", () => {
  /**
   * @brief Compiled NestJS testing module for AppModule.
   */
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
  });

  it("should resolve AppController", () => {
    const controller: AppController =
      moduleRef.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  it("should resolve AppService", () => {
    const service: AppService = moduleRef.get<AppService>(AppService);
    expect(service).toBeDefined();
  });
});

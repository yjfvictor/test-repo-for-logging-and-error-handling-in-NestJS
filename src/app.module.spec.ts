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
   * @var moduleRef
   * @type TestingModule
   * @brief Compiled NestJS testing module for AppModule.
   * @details Created in beforeEach; used to verify that the module is defined
   *          and that AppController and AppService can be resolved.
   */
  let moduleRef: TestingModule;

  /**
   * @function beforeEach
   * @type function
   * @brief Creates the NestJS testing module for AppModule.
   * @details Creates the NestJS testing module for AppModule.
   */
  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  /**
   * @function it
   * @type function
   * @brief Tests that the AppModule is defined.
   * @details Tests that the AppModule is defined.
   */
  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
  });

  /**
   * @function it
   * @type function
   * @brief Tests that the AppController is resolved.
   * @details Tests that the AppController is resolved.
   */
  it("should resolve AppController", () => {
    const controller: AppController =
      moduleRef.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  /**
   * @function it
   * @type function
   * @brief Tests that the AppService is resolved.
   * @details Tests that the AppService is resolved.
   */
  it("should resolve AppService", () => {
    const service: AppService = moduleRef.get<AppService>(AppService);
    expect(service).toBeDefined();
  });
});

/**
 * @file app.e2e-spec.ts
 * @brief End-to-end tests for the application.
 * @details Bootstraps the NestJS application and verifies that it initialises
 *          correctly. Further e2e tests may be added to exercise HTTP endpoints.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  /**
   * @brief NestJS application instance under test.
   */
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should create the application", () => {
    expect(app).toBeDefined();
  });
});

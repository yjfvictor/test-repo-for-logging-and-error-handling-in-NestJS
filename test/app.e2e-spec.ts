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

/**
 * @function describe
 * @type function
 * @brief Tests for the AppController (e2e).
 * @details Tests that the NestJS application instance is created.
 */
describe("AppController (e2e)", () => {
  /**
   * @var app
   * @type INestApplication
   * @brief NestJS application instance under test.
   * @details Created and initialised in beforeEach; closed in afterEach. Used
   *          to assert that the application boots successfully.
   */
  let app: INestApplication;

  /**
   * @function beforeEach
   * @type function
   * @brief Creates the NestJS application instance.
   * @details Creates the NestJS application instance.
   */
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * @function afterEach
   * @type function
   * @brief Closes the NestJS application instance.
   * @details Closes the NestJS application instance.
   */
  afterEach(async () => {
    await app.close();
  });

  /**
   * @function it
   * @type function
   * @brief Tests that the NestJS application instance is created.
   * @details Tests that the NestJS application instance is created.
   */
  it("should create the application", () => {
    expect(app).toBeDefined();
  });
});

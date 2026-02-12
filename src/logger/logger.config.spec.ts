/**
 * @file logger.config.spec.ts
 * @brief Unit tests for the Pino logger configuration.
 * @details Tests that pinoHttpOptions has a level property and that when
 *          NODE_ENV is production the level is 'info' and there is no
 *          transport; when not production, level is 'debug' and transport
 *          targets pino-pretty. Tests run with the current NODE_ENV so we
 *          only assert the shape and that level is one of the expected values.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { pinoHttpOptions } from "./logger.config";

describe("logger.config", () => {
  /**
   * @function describe
   * @type function
   * @brief Tests for the Pino HTTP logger configuration.
   * @details Tests that pinoHttpOptions has a level property and that when
   *          NODE_ENV is production the level is 'info' and there is no
   *          transport; when not production, level is 'debug' and transport
   *          targets pino-pretty. Tests run with the current NODE_ENV so we
   *          only assert the shape and that level is one of the expected values.
   */
  describe("pinoHttpOptions", () => {
    /**
     * @function it
     * @type function
     * @brief Tests that pinoHttpOptions has a level property that is a string.
     * @details Tests that the level property is a string and that it is one of
     *          the expected values.
     */
    it("should have a level property that is a string", () => {
      expect(typeof pinoHttpOptions.level).toBe("string");
      expect(["debug", "info", "warn", "error"]).toContain(
        pinoHttpOptions.level,
      );
    });

    /**
     * @function it
     * @type function
     * @brief Tests that pinoHttpOptions has a level property that is either "info" or "debug" depending on NODE_ENV.
     * @details Tests that the level property is either "info" or "debug" depending on the value of NODE_ENV.
     */
    it('should have level either "info" or "debug" depending on NODE_ENV', () => {
      if (process.env.NODE_ENV === "production") {
        expect(pinoHttpOptions.level).toBe("info");
      } else {
        expect(pinoHttpOptions.level).toBe("debug");
      }
    });

    /**
     * @function it
     * @type function
     * @brief Tests that pinoHttpOptions has a transport with target pino-pretty in non-production.
     * @details Tests that the transport property is defined and that the target is "pino-pretty" and the options are defined and that the colourise property is true and the translateTime property is "SYS:standard".
     */
    it("should in non-production have a transport with target pino-pretty", () => {
      if (process.env.NODE_ENV !== "production") {
        expect(pinoHttpOptions.transport).toBeDefined();
        expect(pinoHttpOptions.transport?.target).toBe("pino-pretty");
        expect(pinoHttpOptions.transport?.options).toBeDefined();
        expect(pinoHttpOptions.transport?.options.colourise).toBe(true);
        expect(pinoHttpOptions.transport?.options.translateTime).toBe(
          "SYS:standard",
        );
      }
    });

    /**
     * @function it
     * @type function
     * @brief Tests that pinoHttpOptions has no transport in production.
     * @details Tests that the transport property is undefined.
     */
    it("should in production have no transport", () => {
      if (process.env.NODE_ENV === "production") {
        expect(pinoHttpOptions.transport).toBeUndefined();
      }
    });
  });
});

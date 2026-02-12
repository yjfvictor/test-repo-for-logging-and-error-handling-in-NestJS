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
  describe("pinoHttpOptions", () => {
    it("should have a level property that is a string", () => {
      expect(typeof pinoHttpOptions.level).toBe("string");
      expect(["debug", "info", "warn", "error"]).toContain(
        pinoHttpOptions.level,
      );
    });

    it('should have level either "info" or "debug" depending on NODE_ENV', () => {
      if (process.env.NODE_ENV === "production") {
        expect(pinoHttpOptions.level).toBe("info");
      } else {
        expect(pinoHttpOptions.level).toBe("debug");
      }
    });

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

    it("should in production have no transport", () => {
      if (process.env.NODE_ENV === "production") {
        expect(pinoHttpOptions.transport).toBeUndefined();
      }
    });
  });
});

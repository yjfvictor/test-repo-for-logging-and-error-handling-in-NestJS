/**
 * @file app.module.ts
 * @brief Root application module.
 * @details Defines the root NestJS module that imports LoggerModule (nestjs-pino)
 *          for structured logging and declares the application controller and
 *          service. All request/response and application logs flow through Pino.
 * @author Victor Yeh
 * @date 2026-02-12
 * @copyright MIT License
 */

import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { pinoHttpOptions } from "./logger/logger.config";

/**
 * @class AppModule
 * @brief Root application module.
 * @details Registers the Pino logger module with HTTP-level options (level,
 *          pretty-print in non-production) and the single app controller
 *          and service.
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: pinoHttpOptions,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

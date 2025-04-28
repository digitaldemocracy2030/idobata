import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger.js';

describe('logger', () => {
  // 各テストの前にconsoleのメソッドをスパイする
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  // 各テストの後にモックをリストアする
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('info should call console.log with [INFO] prefix', () => {
    const message = 'Test info message';
    const args = [1, { data: 'test' }];
    logger.info(message, ...args);
    expect(console.log).toHaveBeenCalledOnce();
    expect(console.log).toHaveBeenCalledWith(`[INFO] ${message}`, ...args);
  });

  it('error should call console.error with [ERROR] prefix', () => {
    const message = 'Test error message';
    const args = [new Error('Something went wrong')];
    logger.error(message, ...args);
    expect(console.error).toHaveBeenCalledOnce();
    expect(console.error).toHaveBeenCalledWith(`[ERROR] ${message}`, ...args);
  });

  it('warn should call console.warn with [WARN] prefix', () => {
    const message = 'Test warn message';
    logger.warn(message);
    expect(console.warn).toHaveBeenCalledOnce();
    expect(console.warn).toHaveBeenCalledWith(`[WARN] ${message}`);
  });

  describe('debug', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      // NODE_ENVを元の値に戻す
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should call console.debug with [DEBUG] prefix when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      const message = 'Test debug message';
      const args = [{ detail: 'debug info' }];
      logger.debug(message, ...args);
      expect(console.debug).toHaveBeenCalledOnce();
      expect(console.debug).toHaveBeenCalledWith(`[DEBUG] ${message}`, ...args);
    });

    it('should not call console.debug when NODE_ENV is not development', () => {
      process.env.NODE_ENV = 'production';
      const message = 'Test debug message';
      logger.debug(message);
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not call console.debug when NODE_ENV is undefined', () => {
      process.env.NODE_ENV = undefined;
      const message = 'Test debug message';
      logger.debug(message);
      expect(console.debug).not.toHaveBeenCalled();
    });
  });
});

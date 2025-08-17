import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { sequelize, connectDB } from '../db';

describe('DB - connectDB', () => {
  let authSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    authSpy = jest.spyOn(sequelize, 'authenticate');
  });

  afterEach(() => {
    authSpy.mockRestore();
  });

  it('should call sequelize.authenticate and resolve', async () => {
    authSpy.mockResolvedValueOnce(undefined as any);
    await expect(connectDB()).resolves.not.toThrow();
    expect(authSpy).toHaveBeenCalled();
  });

  it('should throw when sequelize.authenticate rejects', async () => {
    const error = new Error('auth failed');
    authSpy.mockRejectedValueOnce(error);
    await expect(connectDB()).rejects.toThrow('auth failed');
    expect(authSpy).toHaveBeenCalled();
  });
});

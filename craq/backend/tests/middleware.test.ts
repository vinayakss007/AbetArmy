import { Request, Response, NextFunction } from 'express';
import { requestId } from '../src/middleware/requestId';

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
  },
}));

describe('requestId middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      setHeader: jest.fn(),
    };
    next = jest.fn();
  });

  it('should generate a UUID and set it on req.requestId', () => {
    requestId(req as Request, res as Response, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should use existing X-Request-ID header if provided', () => {
    const existingId = 'existing-request-id';
    req.headers = { 'x-request-id': existingId };

    requestId(req as Request, res as Response, next);

    expect(req.requestId).toBe(existingId);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
    expect(next).toHaveBeenCalled();
  });
});

describe('requestLogger middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let finishCallback: (() => void) | undefined;
  const mockLogger = require('../src/utils/logger').default;

  beforeEach(() => {
    jest.clearAllMocks();
    finishCallback = undefined;
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      requestId: 'test-request-id',
      user: undefined,
    };
    res = {
      statusCode: 200,
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') {
          finishCallback = cb;
        }
        return res as Response;
      }),
    };
    next = jest.fn();
  });

  it('should log request on finish', () => {
    const { requestLogger } = require('../src/middleware/requestLogger');
    requestLogger(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();

    // Simulate response finish
    if (finishCallback) {
      finishCallback();
    }

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/api/test',
        statusCode: 200,
        requestId: 'test-request-id',
      }),
      'request completed'
    );
  });

  it('should log as warn for 4xx status codes', () => {
    const { requestLogger } = require('../src/middleware/requestLogger');
    (res as any).statusCode = 404;
    requestLogger(req as Request, res as Response, next);

    if (finishCallback) {
      finishCallback();
    }

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
      }),
      'request completed'
    );
  });
});

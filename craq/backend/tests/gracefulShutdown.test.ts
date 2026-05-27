import { setupGracefulShutdown } from '../src/utils/gracefulShutdown';

jest.mock('../src/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('setupGracefulShutdown', () => {
  let mockServer: any;
  let mockPool: any;
  let mockRedisClient: any;
  let processOnSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;
  const signalHandlers: Record<string, Function> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockServer = {
      close: jest.fn((cb: () => void) => cb()),
    };

    mockPool = {
      end: jest.fn().mockResolvedValue(undefined),
    };

    mockRedisClient = {
      isOpen: true,
      quit: jest.fn().mockResolvedValue(undefined),
    };

    processOnSpy = jest.spyOn(process, 'on').mockImplementation(((event: string | symbol, handler: any) => {
      signalHandlers[event as string] = handler;
      return process;
    }) as any);

    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    processOnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should register SIGTERM and SIGINT handlers', () => {
    setupGracefulShutdown(mockServer, mockPool, mockRedisClient);

    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });

  it('should close server, pool, and redis on SIGTERM', async () => {
    setupGracefulShutdown(mockServer, mockPool, mockRedisClient);

    // Trigger SIGTERM handler
    await signalHandlers['SIGTERM']();

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockPool.end).toHaveBeenCalled();
    expect(mockRedisClient.quit).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should close server, pool, and redis on SIGINT', async () => {
    setupGracefulShutdown(mockServer, mockPool, mockRedisClient);

    // Trigger SIGINT handler
    await signalHandlers['SIGINT']();

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockPool.end).toHaveBeenCalled();
    expect(mockRedisClient.quit).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  it('should skip redis quit if not open', async () => {
    mockRedisClient.isOpen = false;
    setupGracefulShutdown(mockServer, mockPool, mockRedisClient);

    await signalHandlers['SIGTERM']();

    expect(mockRedisClient.quit).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});

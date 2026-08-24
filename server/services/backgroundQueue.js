import { EventEmitter } from 'events';
import { logger } from '../logger.js';

class BackgroundQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.isProcessing = false;
    this.queue = [];

    // Job handler registry
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  registerHandler(jobType, handlerFn) {
    this.handlers.set(jobType, handlerFn);
  }

  registerDefaultHandlers() {
    this.registerHandler('WEBHOOK_RETRY', async (payload) => {
      logger.info({ event: 'JOB_WEBHOOK_RETRY_EXECUTED', payload }, 'Background webhook retry executed');
      return { status: 'DELIVERED', retriedAt: new Date().toISOString() };
    });

    this.registerHandler('ANALYTICS_REFRESH', async (payload) => {
      logger.debug({ event: 'JOB_ANALYTICS_REFRESH_EXECUTED' }, 'Background analytics aggregation refreshed');
      return { status: 'REFRESHED', timestamp: new Date().toISOString() };
    });

    this.registerHandler('FRAUD_INVESTIGATION_LOG', async (payload) => {
      logger.info({ event: 'JOB_FRAUD_INVESTIGATION_LOGGED', payload }, 'Async fraud investigation dossier compiled');
      return { status: 'LOGGED', recordId: payload.transactionId };
    });
  }

  enqueue(jobType, payload = {}, { priority = 'NORMAL', delayMs = 0 } = {}) {
    const jobId = `job_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const job = {
      id: jobId,
      type: jobType,
      payload,
      priority,
      status: delayMs > 0 ? 'DELAYED' : 'QUEUED',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };

    this.jobs.set(jobId, job);

    if (delayMs > 0) {
      setTimeout(() => {
        job.status = 'QUEUED';
        this.queue.push(job);
        this.processNext();
      }, delayMs);
    } else {
      this.queue.push(job);
      process.nextTick(() => this.processNext());
    }

    logger.debug({ event: 'JOB_ENQUEUED', jobId, jobType }, `Enqueued background job ${jobId} (${jobType})`);
    return job;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const job = this.queue.shift();

    if (!job) {
      this.isProcessing = false;
      return;
    }

    job.status = 'PROCESSING';
    job.startedAt = new Date().toISOString();

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'FAILED';
      job.error = `No handler registered for job type: ${job.type}`;
      job.completedAt = new Date().toISOString();
      this.isProcessing = false;
      return this.processNext();
    }

    try {
      const result = await handler(job.payload);
      job.status = 'COMPLETED';
      job.result = result;
      job.completedAt = new Date().toISOString();
      logger.debug({ event: 'JOB_COMPLETED', jobId: job.id, jobType: job.type }, `Job ${job.id} completed`);
    } catch (err) {
      job.status = 'FAILED';
      job.error = err.message;
      job.completedAt = new Date().toISOString();
      logger.error({ event: 'JOB_FAILED', jobId: job.id, err: err.message }, `Job ${job.id} failed`);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  listRecentJobs(limit = 20) {
    return Array.from(this.jobs.values()).reverse().slice(0, limit);
  }
}

export const backgroundQueue = new BackgroundQueue();

let ioInstance = null;

export function initSocketIO(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to Real-Time RevivePay Sentinel Stream (${socket.id})`);
    
    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });
}

export function emitAuditLog(auditEntry) {
  if (ioInstance) {
    ioInstance.emit('audit:new', auditEntry);
  }
}

export function emitWebhookEvent(webhookRecord) {
  if (ioInstance) {
    ioInstance.emit('webhook:received', webhookRecord);
  }
}

export function emitTransactionUpdate(txn) {
  if (ioInstance) {
    ioInstance.emit('transaction:updated', txn);
  }
}

export function emitDisputeUpdate(dispute) {
  if (ioInstance) {
    ioInstance.emit('dispute:updated', dispute);
  }
}

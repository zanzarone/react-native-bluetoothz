const MAX_OPERATIONS_NUM = 100;
const OPERATION_TIMEOUT_MSEC = 8000;

class Scheduler {
  constructor() {
    this.operations = [];
    this.busy = false;
    this.mutexLock = false;
  }

  exec() {
    this.busy = true;
    const { task, id } = this.operations[0];
    console.log(`enq, executing op:${id}, l:, ${this.operations.length}`);
    task();
    this.operations[0].cancelToken = setTimeout(() => {
      this.dequeue();
    }, OPERATION_TIMEOUT_MSEC);
  }

  enqueue(task, uuid) {
    if (this.mutexLock) {
      console.log('enq, op discarded by lock queue');
      return;
    }
    if (this.operations.length + 1 > MAX_OPERATIONS_NUM) {
      console.log('enq, op discarded by MAX OP ENQUEUED');
      return;
    }
    const id = Math.floor(Math.random() * 100);
    this.operations.push({ task, uuid, id, cancelToken: null });
    if (!this.busy) {
      this.exec();
    } else {
      console.log('scheduler busy! l:', this.operations.length);
      this.operations.map((op) => console.log(`OP:${op.id}`));
    }
  }

  dequeue() {
    if (this.mutexLock) {
      console.log('dequeue, waiting, l:', this.operations.length);
      return;
    }
    this.busy = false;
    /// dequeue past executed op
    if (this.operations.length > 0) {
      const { id, cancelToken } = this.operations.shift();
      clearTimeout(cancelToken);
      console.log(`dequeue, op:${id}, executed`);
      if (this.operations.length > 0) {
        console.log('dequeuing... still remains:');
        this.operations.forEach((op) => {
          console.log(`- op:${op.id}`);
        });
        this.exec();
      }
    }
  }

  invalidate(uuid) {
    this.mutexLock = true;
    console.log('MUTEX LOCKED', this.operations.length);
    this.operations = this.operations.filter((op) => op.uuid !== uuid);
    this.mutexLock = false;
    console.log('MUTEX UNLOCKED', this.operations.length);
    this.dequeue();
  }
}

module.exports = Scheduler;

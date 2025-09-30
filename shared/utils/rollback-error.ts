export class RollbackError extends Error {
  constructor(message = 'Rollback') {
    super(message);
    this.name = 'RollbackError';
  }
}
export default RollbackError;

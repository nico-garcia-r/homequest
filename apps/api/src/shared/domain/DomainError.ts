// Base class for *expected* domain errors that should NOT be thrown
// but returned via Result. Subclasses should set a stable `code`
// so the HTTP layer can map them to status codes consistently.

export abstract class DomainError extends Error {
  abstract readonly code: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

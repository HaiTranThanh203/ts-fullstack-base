export class UserNotFoundException extends Error {
  constructor(id: string) {
    super(`User with id "${id}" not found`);
    this.name = 'UserNotFoundException';
  }
}

export class UserAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class UserDeletedException extends Error {
  constructor(id: string) {
    super(`User with id "${id}" has been deleted`);
    this.name = 'UserDeletedException';
  }
}
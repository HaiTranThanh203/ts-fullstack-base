export class InvalidCredentialsException extends Error {
  constructor() {
    super('Email or password is incorrect');
    this.name = 'InvalidCredentialsException';
  }
}

export class InvalidRefreshTokenException extends Error {
  constructor() {
    super('Refresh token is invalid or expired');
    this.name = 'InvalidRefreshTokenException';
  }
}

export class UnauthorizedException extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}
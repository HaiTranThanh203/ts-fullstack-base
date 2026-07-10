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

export class PasswordResetTokenExpiredException extends Error {
  constructor() {
    super('Password reset token has expired');
    this.name = 'PasswordResetTokenExpiredException';
  }
}

export class InvalidPasswordResetTokenException extends Error {
  constructor() {
    super('Invalid password reset token');
    this.name = 'InvalidPasswordResetTokenException';
  }
}

export class InvalidCurrentPasswordException extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'InvalidCurrentPasswordException';
  }
}

export class SamePasswordException extends Error {
  constructor() {
    super('New password must be different from current password');
    this.name = 'SamePasswordException';
  }
}
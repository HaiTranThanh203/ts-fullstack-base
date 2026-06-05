import { plainToInstance } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, IsOptional, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  MONGODB_URI!: string;

  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  PORT?: number = 3000;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig);
  if (errors.length > 0) {
    throw new Error(`Config validation error:\n${errors.toString()}`);
  }

  return validatedConfig;
}
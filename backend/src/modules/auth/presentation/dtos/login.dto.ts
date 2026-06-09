import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * LoginDto - Request DTO for login endpoint
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

/**
 * LoginResponseDto - Response DTO for login endpoint
 */
export class LoginResponseDto {
  token!: string;
  user!: {
    id: string;
    email: string;
    roles: string[];
  };
}

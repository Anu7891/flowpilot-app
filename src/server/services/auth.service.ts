  import bcrypt from 'bcryptjs';
import { userRepo } from '../repositories/user.repository';
import { conflict, unauthorized } from '../utils/errors';
import type { LoginDto, SignupDto } from '../validators/auth.schema';

export const authService = {
  async signup(dto: SignupDto) {
    const existing = await userRepo.findByEmail(dto.email);
    if (existing) throw conflict('An account with this email already exists.');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return userRepo.create({ name: dto.name, email: dto.email, passwordHash });
  },

  async login(dto: LoginDto) {
    const user = await userRepo.findByEmail(dto.email);
    // Same generic error for wrong email OR wrong password - no user enumeration.
    const invalid = unauthorized('Incorrect email or password.');
    if (!user || !user.passwordHash) throw invalid;
    const okPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!okPassword) throw invalid;
    const { passwordHash: _drop, ...safe } = user;
    return safe;
  },
};

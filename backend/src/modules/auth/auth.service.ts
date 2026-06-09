import { prisma } from "../../lib/prisma";
import { AppError } from "../../lib/errors";
import { comparePassword, hashPassword } from "../../lib/password";
import { signAccessToken, type Role } from "../../lib/jwt";
import type { AuthResponse, AuthUser } from "../../types/auth";
import type { LoginInput, RegisterInput } from "./auth.schema";

const INVALID_CREDENTIALS = "Invalid email or password";
const EMAIL_IN_USE = "Email is already registered";
const ACCOUNT_DISABLED = "Account has been disabled";

async function isEmailTaken(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase();
  const [teacher, student, admin] = await Promise.all([
    prisma.teacher.findUnique({ where: { email: normalizedEmail } }),
    prisma.student.findUnique({ where: { email: normalizedEmail } }),
    prisma.admin.findUnique({ where: { email: normalizedEmail } }),
  ]);
  return Boolean(teacher || student || admin);
}

function toAuthUser(
  user: { id: string; name: string; email: string },
  role: Role,
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
  };
}

function buildAuthResponse(
  user: { id: string; name: string; email: string },
  role: Role,
): AuthResponse {
  const authUser = toAuthUser(user, role);
  const accessToken = signAccessToken({
    sub: user.id,
    role,
    email: user.email,
  });

  return { user: authUser, accessToken };
}

export async function registerTeacher(
  input: RegisterInput,
): Promise<AuthResponse> {
  
  const email = input.email.toLowerCase();

  if (await isEmailTaken(email)) {
    throw new AppError(409, EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(input.password);

  const teacher = await prisma.teacher.create({
    data: {
      name: input.name.trim(),
      email,
      password: passwordHash,
    },
  });
  return buildAuthResponse(teacher, "teacher");
}

export async function registerStudent(
  input: RegisterInput,
): Promise<AuthResponse> {
  
  const email = input.email.toLowerCase();

  if (await isEmailTaken(email)) {
    throw new AppError(409, EMAIL_IN_USE);
  }

  const passwordHash = await hashPassword(input.password);

  const student = await prisma.student.create({
    data: {
      name: input.name.trim(),
      email,
      password: passwordHash,
    },
  });

  return buildAuthResponse(student, "student");
}

export async function loginTeacher(input: LoginInput): Promise<AuthResponse> {
  const email = input.email.toLowerCase();
  const teacher = await prisma.teacher.findUnique({ where: { email } });

  if (!teacher) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  if (!teacher.isActive) {
    throw new AppError(403, ACCOUNT_DISABLED);
  }

  const valid = await comparePassword(input.password, teacher.password);
  if (!valid) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  return buildAuthResponse(teacher, "teacher");
}

export async function loginStudent(input: LoginInput): Promise<AuthResponse> {
  const email = input.email.toLowerCase();
  const student = await prisma.student.findUnique({ where: { email } });

  if (!student) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  if (!student.isActive) {
    throw new AppError(403, ACCOUNT_DISABLED);
  }

  const valid = await comparePassword(input.password, student.password);
  if (!valid) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  return buildAuthResponse(student, "student");
}

export async function loginAdmin(input: LoginInput): Promise<AuthResponse> {
  const email = input.email.toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  if (!admin.isActive) {
    throw new AppError(403, ACCOUNT_DISABLED);
  }

  const valid = await comparePassword(input.password, admin.password);
  if (!valid) {
    throw new AppError(401, INVALID_CREDENTIALS);
  }

  return buildAuthResponse(admin, "admin");
}

export async function getMe(userId: string, role: Role): Promise<AuthUser> {
  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({ where: { id: userId } });
    if (!teacher || !teacher.isActive) {
      throw new AppError(401, "User not found");
    }
    return toAuthUser(teacher, "teacher");
  }
  
  if (role === "student") {
    const student = await prisma.student.findUnique({ where: { id: userId } });
    if (!student || !student.isActive) {
      throw new AppError(401, "User not found");
    }
    return toAuthUser(student, "student");
  }

  const admin = await prisma.admin.findUnique({ where: { id: userId } });
  if (!admin || !admin.isActive) {
    throw new AppError(401, "User not found");
  }
  return toAuthUser(admin, "admin");
}

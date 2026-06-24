import { Injectable } from '@nestjs/common';
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private imagekit: ImageKitService) {}

  getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true, headline: true,
        phone: true, location: true, linkedinUrl: true, githubUrl: true, avatarUrl: true,
        emailStyle: true, coverLetterStyle: true,
      },
    });
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true, email: true, firstName: true, lastName: true, headline: true,
        phone: true, location: true, linkedinUrl: true, githubUrl: true, avatarUrl: true,
        emailStyle: true, coverLetterStyle: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { url, fileId } = await this.imagekit.uploadBuffer(
      file.buffer,
      file.originalname || 'avatar.jpg',
      'avatars',
    );

    if (user?.avatarFileId) {
      try {
        await this.imagekit.delete(user.avatarFileId);
      } catch { /* ignore */ }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url, avatarFileId: fileId },
      select: { avatarUrl: true },
    });
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DocumentType, ResumeTrack } from '../../generated/prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');
import { ImageKitService } from '../../infrastructure/storage/imagekit.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

const VALID_TRACKS: ResumeTrack[] = ['Backend', 'Frontend', 'SoftwareEngineer'];

function isPdfFile(file: Express.Multer.File) {
  const name = file.originalname?.toLowerCase() ?? '';
  return (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/x-pdf' ||
    name.endsWith('.pdf')
  );
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService, private imagekit: ImageKitService) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    type: DocumentType,
    applicationId?: string,
    resumeTrack?: ResumeTrack,
  ) {
    if (!file?.buffer?.length) throw new BadRequestException('File required');

    if (type === DocumentType.Resume) {
      if (!resumeTrack || !VALID_TRACKS.includes(resumeTrack)) {
        throw new BadRequestException('Select a resume type: Backend, Frontend, or SoftwareEngineer');
      }
      if (!isPdfFile(file)) {
        throw new BadRequestException('Resume must be a PDF file — export from Word/Docs as .pdf');
      }
    }

    if (type === DocumentType.Resume && resumeTrack) {
      const existing = await this.prisma.document.findFirst({
        where: { userId, type: DocumentType.Resume, resumeTrack },
      });
      if (existing) {
        try {
          await this.imagekit.delete(existing.fileId);
        } catch { /* ignore */ }
        await this.prisma.document.delete({ where: { id: existing.id } });
      }
    }

    let extractedText: string | undefined;
    if (isPdfFile(file)) {
      try {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text?.replace(/\s+/g, ' ').trim();
      } catch (err) {
        this.logger.warn(`PDF parse failed for ${file.originalname}: ${err}`);
        extractedText = undefined;
      }
    }

    if (type === DocumentType.Resume) {
      if (!extractedText || extractedText.length < 40) {
        throw new BadRequestException(
          'Could not read text from this PDF. Save as text-based PDF from Word/Google Docs — scanned image PDFs are not supported.',
        );
      }
    }

    let url: string;
    let fileId: string;
    try {
      const uploaded = await this.imagekit.uploadBuffer(
        file.buffer,
        file.originalname,
        'documents',
      );
      url = uploaded.url;
      fileId = uploaded.fileId;
    } catch (err) {
      this.logger.error(`ImageKit upload failed: ${err}`);
      throw new BadRequestException('Storage upload failed — try a smaller PDF (under 4MB)');
    }

    return this.prisma.document.create({
      data: {
        userId,
        applicationId,
        type,
        resumeTrack: type === DocumentType.Resume ? resumeTrack : undefined,
        fileName: file.originalname,
        fileId,
        fileUrl: url,
        extractedText,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(userId: string, id: string) {
    return this.prisma.document.findFirstOrThrow({ where: { id, userId } });
  }

  async remove(userId: string, id: string) {
    const doc = await this.findOne(userId, id);
    try {
      await this.imagekit.delete(doc.fileId);
    } catch { /* ignore */ }
    await this.prisma.document.delete({ where: { id } });
    return { message: 'Deleted' };
  }
}

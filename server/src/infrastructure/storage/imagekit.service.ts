import ImageKit, { toFile } from '@imagekit/nodejs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageKitService {
  private client: ImageKit;

  constructor(config: ConfigService) {
    this.client = new ImageKit({
      privateKey: config.getOrThrow('IMAGEKIT_PRIVATE_KEY'),
    });
  }

  async uploadBuffer(buffer: Buffer, fileName: string, folder: string) {
    const safeName = fileName.replace(/[^\w.\-]/g, '_') || 'upload.bin';
    const result = await this.client.files.upload({
      file: await toFile(buffer, safeName),
      fileName: safeName,
      folder: `/careerflow/${folder}`,
      useUniqueFileName: true,
    });

    if (!result.url || !result.fileId) {
      throw new Error('ImageKit upload failed: missing url or fileId');
    }

    return { url: result.url, fileId: result.fileId };
  }

  async delete(fileId: string) {
    await this.client.files.delete(fileId);
  }
}

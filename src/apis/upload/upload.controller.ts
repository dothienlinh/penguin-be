import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadFilesDto } from './dto/upload-files.dto';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { Express } from 'express';
import { UploadFileDto } from './dto/upload-file.dto';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post('file')
  @ApiOperation({ summary: 'Upload a file' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFileDto,
  })
  @ResponseMessage('Uploaded file successfully')
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { fileName: file.filename };
  }

  @Post('files')
  @ApiOperation({ summary: 'Upload files' })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadFilesDto,
  })
  @ResponseMessage('Uploaded files successfully')
  uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    return { fileNames: files.map((file) => file.filename) };
  }
}

import { Controller, Get } from '@nestjs/common';
import { LabelNote } from 'src/label-notes/LabelNote';

@Controller('label-notes')
export class LabelNotesController {
  @Get()
  findAll(): LabelNote[] {
    return [];
  }
}

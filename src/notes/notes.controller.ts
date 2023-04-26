import { Controller, Get } from '@nestjs/common';
import { Note } from 'src/notes/Note';

@Controller('notes')
export class NotesController {
  @Get()
  findAll(): Note[] {
    return [];
  }
}

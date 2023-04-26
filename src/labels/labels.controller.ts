import { Controller, Get } from '@nestjs/common';
import { Label } from 'src/labels/Label';

@Controller('labels')
export class LabelsController {
  @Get()
  findAll(): Label[] {
    return [];
  }
}

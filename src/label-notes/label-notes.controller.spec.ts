import { Test, TestingModule } from '@nestjs/testing';
import { LabelNotesController } from './label-notes.controller';

describe('LabelNotesController', () => {
  let controller: LabelNotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelNotesController],
    }).compile();

    controller = module.get<LabelNotesController>(LabelNotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotesController } from './notes/notes.controller';
import { LabelNotesController } from './label-notes/label-notes.controller';
import { LabelsController } from './labels/labels.controller';

@Module({
  controllers: [
    AppController,
    NotesController,
    LabelNotesController,
    LabelsController,
  ],
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'test',
      entities: [],
      synchronize: true,
    }),
  ],
  providers: [AppService],
})
export class AppModule {}

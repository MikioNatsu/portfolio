import { Module } from '@nestjs/common';
import { AdminMessagesController, ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { MailService } from './mail.service';

@Module({
  controllers: [ContactsController, AdminMessagesController],
  providers: [ContactsService, MailService],
  exports: [ContactsService, MailService],
})
export class ContactsModule {}

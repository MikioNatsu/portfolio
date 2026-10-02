import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('contact')
@Controller('contact')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Submit a contact message (rate limited)' })
  submit(@Body() dto: CreateContactDto, @Ip() ip: string, @Req() request: Request) {
    return this.contacts.submit(dto, {
      ip,
      userAgent: request.headers['user-agent'],
    });
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/messages')
export class AdminMessagesController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Paginated contact inbox' })
  list(@Query() query: QueryMessagesDto) {
    return this.contacts.list(query);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a message as read or unread' })
  markRead(@Param('id') id: string, @Body() body: { read?: boolean }) {
    return this.contacts.markRead(id, body.read ?? true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.contacts.remove(id);
  }
}

import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class QueryMessagesDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(['NEW', 'READ', 'ARCHIVED'], { message: 'Status must be NEW, READ or ARCHIVED.' })
  declare status?: string;
}

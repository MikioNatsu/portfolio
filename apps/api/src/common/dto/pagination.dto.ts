import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;
}

export function resolvePagination(query: PaginationQueryDto): {
  skip: number;
  take: number;
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
}

export function buildPaginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

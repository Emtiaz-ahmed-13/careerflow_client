import { IsInt, IsIn, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const COMMITMENT_OPTIONS = [7, 14, 30, 60, 90] as const;

export class SetCommitmentDto {
  @ApiProperty({ enum: COMMITMENT_OPTIONS })
  @IsInt()
  @IsIn(COMMITMENT_OPTIONS)
  commitmentDays: number;
}

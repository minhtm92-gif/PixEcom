import { PartialType } from '@nestjs/mapped-types';
import { CreateLegalSetDto } from './create-legal-set.dto';

export class UpdateLegalSetDto extends PartialType(CreateLegalSetDto) {}

import { CreatePropertyDto } from '../dto/create-property.dto';

export interface Property extends CreatePropertyDto {
  id: string;
  unitCount: number;
  lastModified: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}
import { Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertyService {
  private properties: any[] = [];

  findAll() {
    return this.properties;
  }

  create(createPropertyDto: CreatePropertyDto) {
    const property = {
      id: Date.now().toString(),
      ...createPropertyDto,
    };
    this.properties.push(property);
    return property;
  }
}
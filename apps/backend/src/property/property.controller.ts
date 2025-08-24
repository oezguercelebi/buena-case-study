import { Controller, Get, Post, Body, Param, Put, Patch, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AutosavePropertyDto, GeneralInfoStepDto, BuildingDataStepDto, UnitsDataStepDto } from './dto/update-step.dto';
import type { Property } from './interfaces/property.interface';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.propertyService.getStats();
  }

  @Get('drafts')
  getDrafts() {
    return this.propertyService.getDrafts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: Partial<CreatePropertyDto>) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  // Draft management endpoints
  
  @Post('draft')
  createDraft(@Body() initialData?: Partial<AutosavePropertyDto>) {
    try {
      return this.propertyService.createDraft(initialData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id/autosave')
  autosave(@Param('id') id: string, @Body() data: AutosavePropertyDto) {
    try {
      return this.propertyService.autosave(id, data);
    } catch (error) {
      throw new HttpException(
        error.message, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/step/:step')
  updateStep(
    @Param('id') id: string, 
    @Param('step') step: string, 
    @Body() data: GeneralInfoStepDto | BuildingDataStepDto | UnitsDataStepDto
  ) {
    try {
      const stepNumber = parseInt(step, 10);
      if (stepNumber < 1 || stepNumber > 3) {
        throw new Error('Step must be between 1 and 3');
      }
      return this.propertyService.updateStep(id, stepNumber, data);
    } catch (error) {
      throw new HttpException(
        error.message, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/finalize')
  finalizeDraft(@Param('id') id: string) {
    try {
      return this.propertyService.finalizeDraft(id);
    } catch (error) {
      throw new HttpException(
        error.message, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete('draft/:id')
  deleteDraft(@Param('id') id: string) {
    const success = this.propertyService.deleteDraft(id);
    if (!success) {
      throw new HttpException('Draft not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Draft deleted successfully' };
  }
}
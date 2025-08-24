import { Controller, Get, Post, Body, Param, Put, Patch, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { AutosavePropertyDto, GeneralInfoStepDto, BuildingDataStepDto, UnitsDataStepDto } from './dto/update-step.dto';
import type { Property } from './interfaces/property.interface';

@ApiTags('properties')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all properties',
    description: 'Retrieves a list of all properties in the system with their current status and completion information.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all properties',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/Property' }
    }
  })
  findAll() {
    return this.propertyService.findAll();
  }

  @Get('stats')
  @ApiTags('statistics')
  @ApiOperation({ 
    summary: 'Get property statistics',
    description: 'Retrieves comprehensive statistics about all properties including counts by type, status, and completion metrics.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved property statistics',
    schema: {
      type: 'object',
      properties: {
        totalProperties: { type: 'number', example: 5 },
        wegProperties: { type: 'number', example: 3 },
        mvProperties: { type: 'number', example: 2 },
        totalUnits: { type: 'number', example: 68 },
        activeProperties: { type: 'number', example: 5 },
        archivedProperties: { type: 'number', example: 0 },
        averageUnitsPerProperty: { type: 'number', example: 14 },
        completedProperties: { type: 'number', example: 3 },
        inProgressProperties: { type: 'number', example: 2 },
        notStartedProperties: { type: 'number', example: 0 },
        averageCompletionPercentage: { type: 'number', example: 75 }
      }
    }
  })
  getStats() {
    return this.propertyService.getStats();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get property by ID',
    description: 'Retrieves a specific property by its unique identifier including all buildings and units.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique property identifier',
    example: '1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved property',
    schema: { $ref: '#/components/schemas/Property' }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new property',
    description: 'Creates a new property with complete building and unit information. Validates business rules for property type.'
  })
  @ApiBody({ 
    type: CreatePropertyDto,
    description: 'Complete property data including buildings and units'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Property successfully created',
    schema: { $ref: '#/components/schemas/Property' }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed - check request body format and business rules' 
  })
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update property',
    description: 'Updates an existing property with new data. Partial updates are supported.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique property identifier',
    example: '1'
  })
  @ApiBody({ 
    description: 'Partial property data to update',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Property Name' },
        address: { type: 'string', example: 'New Address' },
        managementCompany: { type: 'string', example: 'New Management Co.' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property successfully updated',
    schema: { $ref: '#/components/schemas/Property' }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed' 
  })
  update(@Param('id') id: string, @Body() updatePropertyDto: Partial<CreatePropertyDto>) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  // Property management endpoints
  
  @Patch(':id/autosave')
  @ApiOperation({ 
    summary: 'Autosave property data',
    description: 'Saves partial property data automatically during the onboarding process. Supports incremental updates without full validation.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique property identifier',
    example: '1'
  })
  @ApiBody({ 
    type: AutosavePropertyDto,
    description: 'Partial property data to save'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property data successfully saved',
    schema: { $ref: '#/components/schemas/Property' }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid data format' 
  })
  autosave(@Param('id') id: string, @Body() data: AutosavePropertyDto) {
    try {
      return this.propertyService.autosave(id, data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpException(
        errorMessage, 
        errorMessage.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/step/:step')
  @ApiOperation({ 
    summary: 'Update specific onboarding step',
    description: 'Updates data for a specific step in the property onboarding process. Step 1: General Info, Step 2: Building Data, Step 3: Units Data.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique property identifier',
    example: '1'
  })
  @ApiParam({ 
    name: 'step', 
    description: 'Onboarding step number (1, 2, or 3)',
    example: '1',
    enum: ['1', '2', '3']
  })
  @ApiBody({ 
    description: 'Step-specific data',
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/GeneralInfoStepDto' },
        { $ref: '#/components/schemas/BuildingDataStepDto' },
        { $ref: '#/components/schemas/UnitsDataStepDto' }
      ]
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Step data successfully updated',
    schema: { $ref: '#/components/schemas/Property' }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid step number or data format' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new HttpException(
        errorMessage, 
        errorMessage.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete property',
    description: 'Permanently removes a property and all associated data from the system.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique property identifier',
    example: '1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Property successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property deleted successfully' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Property not found' 
  })
  deleteProperty(@Param('id') id: string) {
    const success = this.propertyService.deleteProperty(id);
    if (!success) {
      throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Property deleted successfully' };
  }
}
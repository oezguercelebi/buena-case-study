export class CreatePropertyDto {
  name: string;
  address: string;
  buildings: {
    name: string;
    units: {
      number: string;
      type: string;
    }[];
  }[];
}
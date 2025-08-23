export interface Property {
  id: string
  name: string
  address: string
  buildings: Building[]
}

export interface Building {
  id: string
  name: string
  units: Unit[]
}

export interface Unit {
  id: string
  number: string
  type: string
}
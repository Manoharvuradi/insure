import { EventNotification } from "@prisma/client";

export interface IInput {
  label: string;
  type: string;
  name: string;
  required?: boolean;
  options?: Array<IOption>;
  multipleOptions?: Array<multipleOption>;
  disabled?: boolean;
}

export interface IEvent {
  target: ITarget;
}

interface ITarget {
  name: string;
  value?: any;
  files?: any;
  checked?: boolean;
}

export interface IOption {
  id?: number;
  label: string;
  value: any;
}
interface multipleOption {
  label: string;
  type: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
}

import { UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { FieldErrors } from "react-hook-form";

export interface IDefultvalue {
  phone: string;
}
export interface IFormData {
  phone: string;
}

export const defaultValue: IDefultvalue = {
  phone: "",
};

export interface ICourierData {
  courier: string;
  delivered: number;
  returned: number;
  total: number;
  ratio: string;
}

export interface IFraudCheckContextInterface {
  ratio: any;
  handleSubmit: UseFormHandleSubmit<IFormData>;
  register: UseFormRegister<IFormData>;
  formSubmit: (formData: IFormData) => Promise<void>;
  handleIconClick: () => Promise<void>;
  errors: FieldErrors<IFormData>;
  isSubmit: boolean;
  number: string;
  totalOrder: any;
  delivery: number;
  courierData: ICourierData[];
}

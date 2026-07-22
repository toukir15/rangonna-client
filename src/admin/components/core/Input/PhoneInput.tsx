// // import Ae from "../../../assets/flag/ae.svg";
// // import Au from "../../../assets/flag/au.svg";
// // import Bd from "../../../assets/flag/bd.svg";
// // import Bh from "../../../assets/flag/bh.svg";
// // import Kw from "../../../assets/flag/kw.svg";
// // import Om from "../../../assets/flag/om.svg";
// // import Ps from "../../../assets/flag/ps.svg";
// // import Qa from "../../../assets/flag/qa.svg";
// // import Sg from "../../../assets/flag/sg.svg";
// // import Sy from "../../../assets/flag/sy.svg";
// // import Ye from "../../../assets/flag/ye.svg";

// import React, {
//   ChangeEvent,
//   JSX,
//   MouseEvent,
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
// } from "react";
// import { Popover } from "react-tiny-popover";
// import Icon from "../Icon/Icon";

// interface ICountries {
//   country: string;
//   code: string;
//   iso: string;
//   // flag: string;
//   maxLength: number;
// }

// const data: ICountries[] = [
//   {
//     country: "Bahrain",
//     code: "+973",
//     iso: "BH",
//     // flag: Bh,
//     maxLength: 8,
//   },
//   {
//     country: "Bangladesh",
//     code: "+880",
//     iso: "BD",
//     // flag: Bd,
//     maxLength: 10,
//   },

//   {
//     country: "Kuwait",
//     code: "+965",
//     iso: "KW",
//     //  flag: Kw,
//     maxLength: 8,
//   },

//   {
//     country: "Oman",
//     code: "+968",
//     iso: "OM",
//     // flag: Om,
//     maxLength: 11,
//   },

//   {
//     country: "Palestine",
//     code: "+970",
//     iso: "PS",
//     // flag: Ps,
//     maxLength: 7,
//   },

//   {
//     country: "Qatar",
//     code: "+974",
//     iso: "QA",
//     //  flag: Qa,
//     maxLength: 11,
//   },

//   {
//     country: "Singapore",
//     code: "+65",
//     iso: "SG",
//     // flag: Sg,
//     maxLength: 8,
//   },

//   {
//     country: "Syria",
//     code: "+963",
//     iso: "SY",
//     // flag: Sy,
//     maxLength: 7,
//   },

//   {
//     country: "United Arab Emirates",
//     code: "+971",
//     iso: "AE",
//     // flag: Ae,
//     maxLength: 7,
//   },

//   {
//     country: "Yemen",
//     code: "+967",
//     iso: "YE",
//     // flag: Ye,
//     maxLength: 15,
//   },

//   {
//     country: "Australia",
//     code: "+61",
//     iso: "AU",
//     // flag: Au,
//     maxLength: 10,
//   },
// ];

// interface IInputProps {
//   label: string | JSX.Element;
//   placeholder?: string;
//   onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
//   onBlur?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
//   onClick?: (e: MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
//   onFocus?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
//   iconRight?: JSX.Element;
//   isDisabled?: boolean;
//   errorText?: any;
//   registerProperty?: any;
//   helpText?: string | JSX.Element;
//   ref?: React.Ref<HTMLInputElement>;
//   id?: string;
//   classNames?: string;
//   flagValue: string | any;
//   name: string;
//   setValue: (name: string, value: any) => void;
//   noMargin?: boolean;
//   isRequired?: boolean;
// }

// const PhoneInput: React.FC<IInputProps> = ({
//   label,
//   placeholder,
//   onChange,
//   onBlur,
//   onClick,
//   onFocus,
//   errorText,
//   isDisabled,
//   registerProperty,
//   id,
//   classNames,
//   flagValue,
//   setValue,
//   noMargin = false,
//   name,
//   isRequired = false,
// }) => {
//   const [isFocused, setIsFocused] = useState<boolean>(false);
//   const [generatedId] = useState<any>();
//   const [inputValue, setInputValue] = useState<string>("");

//   const [selectedValue, setSelectedValue] = useState<ICountries | undefined>();
//   const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

//   const toggleDropdown = () => {
//     setDropdownOpen((prevState) => !prevState);
//   };

//   const handleFlagChange = (value: ICountries) => {
//     setSelectedValue(value);
//     setValue && setValue(name, value ? value.code : undefined);
//     setDropdownOpen(false);
//   };

//   useEffect(() => {
//     data.map((item) => {
//       if (item.code === flagValue) {
//         setSelectedValue(item);
//       }
//     });
//   }, [flagValue]);

//   const handleClick = (
//     e: MouseEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     onClick && onClick(e);
//   };

//   const handleFocus = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setIsFocused(true);
//     onFocus && onFocus(e);
//   };

//   const handleBlur = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setIsFocused(false);
//     onBlur && onBlur(e);
//     registerProperty && registerProperty.onBlur(e);
//   };

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     let { value } = e.target;

//     value = value.replace(/\D/g, "");

//     myRef.current.value = value.slice(-(selectedValue?.maxLength || 10));

//     setInputValue(value);
//     onChange && onChange(e);
//     registerProperty && registerProperty.onChange(e);
//   };

//   const myRef: any = useRef(null);

//   useLayoutEffect(() => {
//     if (registerProperty && myRef?.current?.value) {
//       setInputValue(myRef.current.value);
//     }
//   }, [registerProperty]);

//   return (
//     <div
//       className={`relative ${classNames ? classNames : ""} ${
//         isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
//       } ${!noMargin ? "mt-5 mb-3" : ""}  min-w-[200px]`}
//     >
//       <div className="relative">
//         <label
//           htmlFor={
//             id
//               ? id
//               : registerProperty?.name
//               ? registerProperty.name
//               : generatedId
//           }
//           className="block font-inter text-xs font-medium text-neutral-700 mb-2"
//         >
//           {label}
//           {isRequired ? (
//             <span className="text-red-400 ml-1 font-inter text-[12px] font-semibold">
//               *
//             </span>
//           ) : null}
//         </label>

//         <div
//           className={`bg-white  ${
//             !errorText && !isFocused && inputValue
//               ? "border-green-500 bg-white"
//               : errorText
//               ? "border-red-400 bg-white"
//               : isFocused
//               ? "border-cyan-500 bg-white"
//               : "border-neutral-300 bg-white"
//           } flex border  px-6 py-3 rounded-lg w-full items-center`}
//         >
//           <div className="border-r pr-3 border-neutral-200 ">
//             <Popover
//               align={"center"}
//               reposition={true}
//               isOpen={dropdownOpen}
//               positions={["top"]}
//               onClickOutside={() => setDropdownOpen(false)}
//               content={
//                 <div className=" bg-white shadow-2xl rounded-lg">
//                   <div className=" mt-1 w-full overflow-y-scroll no-scrollbar h-48 rounded-md bg-white border border-gray-400 shadow-lg">
//                     {data.map((country) => (
//                       <div
//                         key={country.iso}
//                         className={`flex items-center px-1 py-2 cursor-pointer hover:bg-blue-500 hover:text-white ${
//                           selectedValue === country
//                             ? "bg-gray-700 text-white"
//                             : ""
//                         }`}
//                         onClick={() => {
//                           handleFlagChange(country);
//                         }}
//                       >
//                         {/* <Image
//                           src={country.flag}
//                           alt={country.iso}
//                           className="w-5 h-5 rounded-full mr-2"
//                         /> */}
//                         <span>{country.iso}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               }
//             >
//               <div onClick={toggleDropdown}>
//                 <div className="min-w-[16px] cursor-pointer h-4 flex justify-center gap-1 items-center mr-1">
//                   {selectedValue && (
//                     <>
//                       {/* <Image
//                         src={selectedValue.flag}
//                         alt={selectedValue.iso}
//                         className="w-[18px] h-[18px] rounded"
//                       /> */}
//                       <Icon
//                         name="expand_more"
//                         variant="outlined"
//                         className={`${
//                           dropdownOpen ? "rotate-180" : ""
//                         } text-base text-neutral-600`}
//                       />
//                       <h3 className="font-inter text-neutral-500 text-xs font-medium">
//                         {selectedValue.code}
//                       </h3>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </Popover>
//           </div>
//           <input
//             type="number"
//             id={
//               id
//                 ? id
//                 : registerProperty?.name
//                 ? registerProperty.name
//                 : generatedId
//             }
//             className={`relative px-2 w-full font-inter font-medium text-sm outline-none  placeholder:text-neutral-200 lg:placeholder:text-[14px] md:placeholder:text-[14px] xs:placeholder:text-[12px] bg-white`}
//             ref={(el) => {
//               myRef.current = el;
//               registerProperty && registerProperty.ref(el);
//             }}
//             name={registerProperty ? registerProperty.name : name}
//             key={registerProperty}
//             placeholder={placeholder}
//             onClick={(e: MouseEvent<HTMLInputElement>) => handleClick(e)}
//             onFocus={(e: ChangeEvent<HTMLInputElement>) => handleFocus(e)}
//             onBlur={(e: ChangeEvent<HTMLInputElement>) => handleBlur(e)}
//             onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
//           />
//         </div>
//       </div>
//       {errorText && (
//         <h3 className="text-red-400 text-xs font-inter mt-3  ">{errorText}</h3>
//       )}
//     </div>
//   );
// };

// export default PhoneInput;

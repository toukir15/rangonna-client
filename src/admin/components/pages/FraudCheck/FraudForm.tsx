import { FraudCheckContext } from "@/app/admin/fraud-check/page";
import React, { useContext } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Input from "@admin/components/core/Input/Input";
import Icon from "@admin/components/core/Icon/Icon";

const FraudForm: React.FC = () => {
  const {
    handleSubmit,
    register,
    formSubmit,
    handleIconClick,
    errors,
    isSubmit,
    number,
  } = useContext(FraudCheckContext);
  return (
    <>
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="bg-white dark:bg-gray-800"
      >
        <div className="md:flex  gap-3">
          <Input
            placeholder="Enter your phone no"
            registerProperty={register("phone")}
            errorText={errors?.phone?.message}
            type="number"
            noMargin
            iconRight={<Icon className="text-gray-400" name="content_copy" />}
            handleIconClick={handleIconClick}
          />
          <div className="md:mt-0 mt-2 ">
            <Button
              disabled={isSubmit}
              className="disabled:bg-gray-400 rounded-md px-2 bg-blue-400 font-medium text-white md:min-w-40 !w-full"
              type="submit"
            >
              {isSubmit ? <ButtonLoader /> : <p className="py-0.5">Report</p>}
            </Button>
          </div>
        </div>
      </form>
      <div>
        {number && (
          <p className="my-4 text-center font-semibold text-gray-700 dark:text-gray-300">
            Your Number is <strong>{number}</strong>
          </p>
        )}
      </div>
    </>
  );
};

export default FraudForm;

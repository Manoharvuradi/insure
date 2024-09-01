import React, { useState, useMemo, useEffect } from "react";
import Button from "~/common/buttons/filledButton";
import FormComponent from "~/common/form";
import { IEvent } from "~/interfaces/common/form";
import { api } from "~/utils/api";
import { updateInputpackages } from "~/utils/constants";

interface IPremium {
  id: any;
  coverAmount: any;
  setCoverAmount: any;
  handleCoverAmountChange: any;
}

const Premium = (props: IPremium) => {
  const { data } = api.packages.getPackageKeys.useQuery({ id: props?.id });
  useEffect(() => {
    if (data?.length) {
      props.setCoverAmount(data[0]);
    }
  }, [data]);

  return (
    <FormComponent
      formValues={props.coverAmount}
      handleChange={props.handleCoverAmountChange}
      inputs={updateInputpackages}
    />
  );
};

export default Premium;

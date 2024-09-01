export const invalideMainMemberAge = "Please enter a number greater than 18";

export const checkRequiredFields = (formErrors: any) => {
  let isDisabled = false;

  for (let key in formErrors) {
    if (typeof formErrors[key] !== "string") {
      if (Array.isArray(formErrors[key])) {
        for (let element of formErrors[key]) {
          if (!checkRequiredFields(element)) {
            return false;
          }
        }
      } else if (!checkRequiredFields(formErrors[key])) {
        return false;
      }
    } else if (formErrors[key] !== "") {
      isDisabled = true;
      return false;
    }
  }

  return !isDisabled;
};

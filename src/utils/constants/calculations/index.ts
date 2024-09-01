import {
  findLimit,
  getRuleForGivenDate,
  handleApiResponseError,
} from "~/utils/helpers";
import {
  calculateAgeBasedOnDOB,
  calculateAgeBasedOnSaid,
  packageNames,
} from "..";
import { logError } from "~/server/api/constants/logger";
import { PackageName } from "@prisma/client";
import { prisma } from "~/server/db";
// import { logError } from "~/components/logger";

export const premiumCalculations = async (
  input: any,
  ctx: any
): Promise<any> => {
  if (input.options) {
    const { members } = input.applicationData || input.policyData;
    const mainMember = members.mainMember;
    const spouse = members?.spouse;
    const children = members?.children;
    const extendedFamily = members?.extendedFamily;
    const mainMemberAge = mainMember?.dateOfBirth
      ? calculateAgeBasedOnDOB(mainMember?.dateOfBirth)
      : mainMember?.said
      ? calculateAgeBasedOnSaid(mainMember?.said)
      : mainMember?.age;
    const mainMemberData: any = {
      options: input.options,
      mainMember: {
        ...mainMember,
        premiumFrequency: input.billingFrequency,
        age: mainMemberAge,
      },
    };
    if (spouse) {
      mainMemberData.spouse = spouse.map((spouse: any) => {
        let spouseAge = spouse?.dateOfBirth
          ? calculateAgeBasedOnDOB(spouse?.dateOfBirth)
          : spouse?.said
          ? calculateAgeBasedOnSaid(spouse?.said)
          : spouse?.age;

        return {
          ...spouse,
          premiumFrequency: input.billingFrequency,
          age: spouseAge,
        };
      });
    }
    if (children) {
      mainMemberData.children = children.map((child: any) => {
        let childAge = child?.dateOfBirth
          ? calculateAgeBasedOnDOB(child?.dateOfBirth)
          : child?.said
          ? calculateAgeBasedOnSaid(child?.said)
          : child?.age;

        return {
          ...child,
          premiumFrequency: input.billingFrequency,
          age: childAge,
        };
      });
    }
    const extendedFamilyData = {
      // options: input.options,
      extendedFamily: extendedFamily?.map((family: any) => {
        let familyAge = family?.dateOfBirth
          ? calculateAgeBasedOnDOB(family?.dateOfBirth)
          : family?.said
          ? calculateAgeBasedOnSaid(family?.said)
          : family?.age;

        return {
          ...family,
          premiumFrequency: input.billingFrequency,
          age: familyAge,
        };
      }),
    };
    try {
      const hasChildren = Object.keys(members).some((key: string) => {
        if (key.includes("children")) {
          const children = members[key];
          if (Array.isArray(children)) {
            return children.some(
              (child: any) =>
                "dateOfBirth" in child || "said" in child || "age" in child
            );
          }
        }
        return false;
      });
      const hasExtendedFamily = Object.keys(members).some((key: string) => {
        if (key.includes("extendedFamily")) {
          const extendFamily = members[key];
          if (Array.isArray(extendFamily)) {
            return extendFamily.some(
              (family: any) =>
                "dateOfBirth" in family || "said" in family || "age" in family
            );
          }
        }
        return false;
      });
      let mainPremium = null;
      let extendedPremium = null;
      mainPremium = await getPremiumCalculatorByFilter(mainMemberData, ctx);

      if (hasExtendedFamily) {
        extendedPremium = await getExtendedFamilyPremiumCalculatorByFilter(
          extendedFamilyData,
          ctx
        );
      }

      if (
        mainPremium &&
        mainPremium.children &&
        mainPremium.children.length > 0 &&
        hasChildren
      ) {
        const checkMainData = checkChildrenDataExists(
          mainMemberData.children,
          mainPremium.children
        );

        if (!checkMainData) {
          mainPremium = null;
        }
      }
      if (
        extendedPremium &&
        extendedPremium.extendedFamily &&
        extendedPremium.extendedFamily.length > 0 &&
        hasExtendedFamily
      ) {
        const checkExtendData = checkExtendedFamilyDataExists(
          extendedFamilyData.extendedFamily,
          extendedPremium.extendedFamily
        );
        if (!checkExtendData) {
          extendedPremium = null;
        }
      }
      let response = { mainPremium, extendedPremium };
      return response;
    } catch (err) {
      return err;
    }
  } else {
    logError(
      `FAILURE: Error in CREATE QUOTAION for user: ${
        ctx?.session?.user?.id && ctx?.session?.user?.id
      }, User name: ${ctx?.session?.user?.firstName}, and Error: ${
        "OPTION is not found." + JSON.stringify(`OPTION is not found`)
      }`
    );
    return "OPTION is not found";
  }
};

export async function getPremiumCalculatorByFilter(input: any, ctx: any) {
  const response = await ctx.prisma.premiumCalculator.findFirst({
    where: {
      options: input.options,
      AND: [
        {
          ...(input.mainMember && {
            mainMember: {
              path: ["minAge"],
              lte: parseFloat(input.mainMember.age),
            },
          }),
        },
        {
          ...(input.mainMember &&
            !input.mainMember.id && {
              mainMember: {
                path: ["maxAge"],
                gte: parseFloat(input.mainMember.age),
              },
            }),
        },
        {
          ...(input.mainMember && {
            mainMember: {
              path: ["premiumFrequency"],
              equals: input.mainMember.premiumFrequency,
            },
          }),
        },
        ...(input.spouse && input.spouse.length > 0
          ? input.spouse.map((spouse: any) => ({
              spouse: {
                path: ["minAge"],
                lte: parseFloat(spouse.age),
              },
            }))
          : []),
        ...(input.spouse && input.spouse.length > 0
          ? input.spouse.map((spouse: any) => ({
              ...(!spouse.id && {
                spouse: {
                  path: ["maxAge"],
                  gte: parseFloat(spouse.age),
                },
              }),
            }))
          : []),
        ...(input.spouse && input.spouse.length > 0
          ? input.spouse.map((spouse: any) => ({
              spouse: {
                path: ["premiumFrequency"],
                equals: spouse.premiumFrequency,
              },
            }))
          : []),
        {
          ...(input.children &&
            input.children.length > 0 && {
              children: {
                some: {
                  OR: input.children.map(
                    (child: {
                      age: any;
                      premiumFrequency: string;
                      isStudying: boolean;
                      isDisabled: boolean;
                      isStillBorn: boolean;
                    }) => {
                      if (child.isDisabled) {
                        return {
                          minAge: { lte: parseFloat(child.age) },
                          premiumFrequency: { equals: child.premiumFrequency },
                          isDisabled: { equals: child.isDisabled },
                        };
                      } else if (child.isStillBorn) {
                        return {
                          minAge: { lte: child.age },
                          maxAge: { lte: child.age },
                          isStillBorn: { equals: child.isStillBorn },
                          premiumFrequency: { equals: child.premiumFrequency },
                        };
                      } else {
                        return {
                          minAge: { lte: parseFloat(child.age) },
                          maxAge: { gte: parseFloat(child.age) },
                          isStudying: { equals: child.isStudying },
                          premiumFrequency: { equals: child.premiumFrequency },
                        };
                      }
                    }
                  ),
                },
              },
            }),
        },
      ],
    },
    include: {
      children: true,
    },
  });
  return response;
}
export async function getExtendedFamilyPremiumCalculatorByFilter(
  input: any,
  ctx: any
) {
  const response = await ctx.prisma.extendedPremiumCalculator.findMany({
    where: {
      options: {
        in: input.extendedFamily.map(
          (extend: { options: any }) => extend.options
        ),
      },
    },
    include: {
      extendedFamily: true,
    },
  });
  return response;
}

export function checkChildrenDataExists(
  inputChildrenData: any,
  outputChildrenData: any
) {
  for (let child of inputChildrenData) {
    if (child.isDisabled) {
      return true;
    }
  }
  return inputChildrenData.every((child: any) => {
    return outputChildrenData.some((data: any) => {
      const age = child.age;
      const isStudying = child.isStudying;

      return (
        data.minAge <= age &&
        age <= data.maxAge &&
        data.isStudying === isStudying
      );
    });
  });
}

export function checkExtendedFamilyDataExists(
  inputExtendFamilyData: any,
  outputExtendFamilyData: any
) {
  return inputExtendFamilyData.every((exFamily: any) => {
    return outputExtendFamilyData.some((data: any) => {
      const age = exFamily.age;
      return data.minAge <= age && age <= data.maxAge;
    });
  });
}

export const membersHasKeys = (members: any[]): boolean => {
  return members.every(
    (obj: any) =>
      obj.hasOwnProperty("children") || obj.hasOwnProperty("extendedFamily")
  );
};

export const updateExistingDataWithNewMember = (
  existingData: any[],
  newData: any[]
) => {
  for (let newChild of newData) {
    if ("id" in newChild) {
      // Case 1: Check if child object has only id, then remove the object
      if (Object.keys(newChild).length === 1) {
        let childExists = existingData.some(
          (child: any) => child.id === newChild.id
        );

        if (childExists) {
          existingData = existingData.filter(
            (child: any) => child.id !== newChild.id
          );
        } else {
          throw new Error(
            `Child object with id ${newChild.id} does not exist.`
          );
        }
      }
      // Case 2: Check if object has id with other keys, then update the existing child object based on id
      else {
        let existingChild = existingData.find(
          (child: any) => child.id === newChild.id
        );
        if (existingChild) {
          Object.assign(existingChild, newChild);
        } else {
          throw new Error(
            `Child object with id ${newChild.id} does not exist.`
          );
        }
      }
    }
    // Case 3: If id is not in the object, append it to the existing children
    else {
      existingData.push(newChild);
    }
  }
  return existingData;
};

export const creditLifePremiumCalculation = async (
  input: any,
  ctx?: any,
  startDate?: any
) => {
  let {
    additionalPercentageInsured,
    outstandingSettlementBalance,
    loanSettlementAtInception,
  } = input;

  const response = await ctx.prisma.package.findFirst({
    where: {
      packageName: packageNames.creditLifeMotor as PackageName,
    },
    include: {
      packageRules: {
        include: {
          ruleLimits: true,
        },
      },
    },
  });
  if (!response) {
    throw new Error("Package Response is null");
  }
  const matchedRule = getRuleForGivenDate(
    startDate ? startDate : Date.now(),
    response?.packageRules
  );
  const matchedLimit = findLimit(
    matchedRule?.ruleLimits,
    outstandingSettlementBalance
  );
  const freeCoverBenefitAmount = matchedLimit?.freeCoverBenefitAmount;
  const freeCoverPremium = matchedLimit?.freeCoverPremium;
  const coverPremiumPercentage = matchedLimit?.aditionalCoverPercentage;
  let additionalPremium = 0;
  let sumAssured = freeCoverBenefitAmount;
  if (outstandingSettlementBalance <= freeCoverBenefitAmount) {
    loanSettlementAtInception = outstandingSettlementBalance;
    additionalPercentageInsured = "0";
  } else {
    if (additionalPercentageInsured === "Other") {
      additionalPremium = Number(
        (loanSettlementAtInception * coverPremiumPercentage).toFixed(2)
      );
    } else {
      const percentage = Number(additionalPercentageInsured);
      const additionalCover =
        (outstandingSettlementBalance - freeCoverBenefitAmount) *
        (percentage / 100);
      loanSettlementAtInception = Number(additionalCover.toFixed(2));
      additionalPremium = Number(
        (additionalCover * coverPremiumPercentage).toFixed(2)
      );
    }
    sumAssured += loanSettlementAtInception;
  }
  const updatedPolicyData = {
    ...input,
    freeCoverPremium,
    additionalPremium,
    totalPremium: Number((additionalPremium + freeCoverPremium).toFixed(2)),
    loanSettlementAtInception,
    sumAssured,
    additionalPercentageInsured,
  };
  return updatedPolicyData;
};

type DevicePolicyData = {
  devicePrice: number;
};

export const devicePremiumData = async (
  ctx: any,
  policyData: DevicePolicyData
) => {
  const response = await ctx?.prisma?.package.findFirst({
    where: {
      packageName: packageNames?.device as PackageName,
    },
    include: {
      packageRules: {
        include: {
          ruleLimits: true,
        },
      },
    },
  });
  const matchedRule = getRuleForGivenDate(Date.now(), response?.packageRules);
  const matchedLimit = findLimit(
    matchedRule?.ruleLimits,
    policyData.devicePrice
  );
  const deviceQuote = {
    ...policyData,
    premiumAmount: Number(
      (policyData.devicePrice * matchedLimit?.aditionalCoverPercentage).toFixed(
        2
      )
    ),
  };
  return deviceQuote;
};

export const deviceCreditLifePremiumCal = async (
  policyData: any,
  ctx: any,
  startDate?: any
) => {
  let {
    additionalPercentageInsured,
    outstandingSettlementBalance,
    loanSettlementAtInception,
  } = policyData;

  const response = await prisma.package.findFirst({
    where: {
      packageName: packageNames.creditLifeDevice as PackageName,
    },
    include: {
      packageRules: {
        include: {
          ruleLimits: true,
        },
      },
    },
  });
  if (!response) {
    throw new Error("Package Response is null");
  }
  const matchedRule = getRuleForGivenDate(
    startDate ? startDate : Date.now(),
    response?.packageRules
  );
  const matchedLimit = findLimit(
    matchedRule?.ruleLimits,
    outstandingSettlementBalance
  );
  const freeCoverBenefitAmount = matchedLimit?.freeCoverBenefitAmount;
  const freeCoverPremium = matchedLimit?.freeCoverPremium;
  const coverPremiumPercentage = matchedLimit?.aditionalCoverPercentage;
  let additionalPremium = 0;
  let sumAssured = freeCoverBenefitAmount;
  if (outstandingSettlementBalance <= freeCoverBenefitAmount) {
    loanSettlementAtInception = outstandingSettlementBalance.toFixed(2);
    additionalPercentageInsured = "0";
  } else {
    if (additionalPercentageInsured === "Other") {
      additionalPremium = Number(
        (loanSettlementAtInception * coverPremiumPercentage).toFixed(2)
      );
    } else {
      const percentage = Number(additionalPercentageInsured);
      const additionalCover =
        (outstandingSettlementBalance - freeCoverBenefitAmount) *
        (percentage / 100);
      loanSettlementAtInception = Number(additionalCover.toFixed(2));
      additionalPremium = Number(
        (additionalCover * coverPremiumPercentage).toFixed(2)
      );
    }
    sumAssured += loanSettlementAtInception;
  }
  const updatedPolicyData = {
    ...policyData,
    freeCoverPremium,
    additionalPremium,
    totalPremium: Number((additionalPremium + freeCoverPremium).toFixed(2)),
    loanSettlementAtInception,
    sumAssured,
    additionalPercentageInsured,
  };
  return updatedPolicyData;
};

export const retailDevicePremiumData = async (
  ctx: any,
  policyData: DevicePolicyData
) => {
  const response = await ctx?.prisma?.package.findFirst({
    where: {
      packageName: packageNames?.retailDeviceInsurance as PackageName,
    },
    include: {
      packageRules: {
        include: {
          ruleLimits: true,
        },
      },
    },
  });
  const matchedRule = getRuleForGivenDate(Date.now(), response?.packageRules);
  const matchedLimit = findLimit(
    matchedRule?.ruleLimits,
    policyData?.devicePrice
  );
  const deviceQuote = {
    ...policyData,
    totalPremium: (
      policyData.devicePrice * matchedLimit?.aditionalCoverPercentage
    ).toFixed(2),
    sumAssured: policyData?.devicePrice,
  };
  return deviceQuote;
};

export const retailDeviceCreditLifePremiumCal = async (
  policyData: any,
  ctx: any,
  startDate?: any
) => {
  let {
    additionalPercentageInsured,
    outstandingSettlementBalance,
    loanSettlementAtInception,
  } = policyData;

  const response = await prisma.package.findFirst({
    where: {
      packageName: packageNames.retailDeviceCreditLife as PackageName,
    },
    include: {
      packageRules: {
        include: {
          ruleLimits: true,
        },
      },
    },
  });
  if (!response) {
    throw new Error("Package Response is null");
  }
  const matchedRule = getRuleForGivenDate(
    startDate ? startDate : Date.now(),
    response?.packageRules
  );
  const matchedLimit = findLimit(
    matchedRule?.ruleLimits,
    outstandingSettlementBalance
  );
  const freeCoverBenefitAmount = matchedLimit?.freeCoverBenefitAmount;
  const freeCoverPremium = matchedLimit?.freeCoverPremium;
  const coverPremiumPercentage = matchedLimit?.aditionalCoverPercentage;
  let additionalPremium = 0;
  let sumAssured = freeCoverBenefitAmount;
  if (outstandingSettlementBalance <= freeCoverBenefitAmount) {
    loanSettlementAtInception = outstandingSettlementBalance;
    additionalPercentageInsured = "0";
  } else {
    if (additionalPercentageInsured === "Other") {
      additionalPremium = Number(
        (loanSettlementAtInception * coverPremiumPercentage).toFixed(2)
      );
    } else {
      const percentage = Number(additionalPercentageInsured);
      const additionalCover =
        (outstandingSettlementBalance - freeCoverBenefitAmount) *
        (percentage / 100);
      loanSettlementAtInception = Number(additionalCover.toFixed(2));
      additionalPremium = Number(
        (additionalCover * coverPremiumPercentage).toFixed(2)
      );
    }
    sumAssured += loanSettlementAtInception;
  }
  const updatedPolicyData = {
    ...policyData,
    freeCoverPremium,
    additionalPremium,
    totalPremium: Number((additionalPremium + freeCoverPremium).toFixed(2)),
    loanSettlementAtInception,
    sumAssured,
    additionalPercentageInsured,
  };
  return updatedPolicyData;
};

export const findChildrenAged20 = async (
  ctx: any,
  children: any[],
  policyNumber: string
) => {
  const childrenWithAge20 = children?.filter((child: any) => {
    if (child.isDisabled) {
      return false;
    } else if (child.isStudying && child.age > 25) {
      return false;
    } else if (child.age == 20) {
      return true;
    }
  });
  const promises =
    childrenWithAge20?.length > 0 &&
    childrenWithAge20.map(async (child: any) => {
      try {
        let actionResponse;
        actionResponse = await ctx?.prisma.actionRequiredPolices.findFirst({
          where: {
            childId: child.id,
          },
        });
        if (!actionResponse) {
          actionResponse = await ctx?.prisma.actionRequiredPolices.create({
            data: {
              policyNumber: policyNumber,
              childId: child.id,
              actionDate: child.dateOfBirth,
            },
          });
          return actionResponse;
        } else {
          return null;
        }
      } catch (error) {
        throw new Error(`Error creating action required policy: ${error}`);
      }
    });

  // Use Promise.all to wait for all promises to resolve
  if (Array.isArray(promises)) {
    await Promise.all(promises);
  }

  return promises;
};

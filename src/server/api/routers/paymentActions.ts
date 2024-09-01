import { logError, logInfo } from "~/server/api/constants/logger";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import {
  LAPSE_POLICY_THRESHOLD_IN_MONTHS,
  convertArrayToCSV,
} from "~/utils/constants/payments";
import {
  PaymentMethod,
  PaymentState,
  Policy,
  policyPayments,
} from "@prisma/client";
import {
  convertToObjectWithCreate,
  csvPaymentHeaders,
  downloadCsv,
  emplyoeePackageNames,
  packageNames,
  paymentState,
  paymentStatusObject,
  validateCSVData,
} from "~/utils/constants";
import {
  dateConversion,
  formatAccountNumber,
  formatAmount,
  formatBankAccountType,
  formatBranchCode,
  formatDateForDebit,
  formatName,
  formatPolicyNumber,
  handleApiResponseError,
} from "~/utils/helpers";
import {
  IQusurecollectionData,
  ITelkomCollectionData,
} from "~/interfaces/policy";
import { env } from "~/env.mjs";
import { sendMailWithAttachment } from "~/utils/helpers/emailGenerator";
import { z } from "zod";
import csvtojson from "csvtojson";
import { bcxEmplyoees } from "~/utils/helpers/bcxEmplyoees";
const axios = require("axios");
const qs = require("qs");

//Write logs inside loop
export const paymentActionsRouter = createTRPCRouter({
  //Refresh token for QSURE payments
  authentication: protectedProcedure.mutation(async ({}) => {
    logInfo(`Success LOG AT REQUEST AUTHENTICATION`);
    try {
      const axios = require("axios");
      const qs = require("qs");
      let data = qs.stringify({
        username: "Tshepisom",
        password: "Pale1Gomo#",
        grant_type: "password",
        client_id: "533BEDE7-0172-4ACA-9E25-439B1BF37AD0",
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://qscollectapi.qsure.co.za:62415/token",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      console.log("Config", JSON.stringify(config));
      logInfo(`Config: ${JSON.stringify(config)}`);
      let response;
      await axios
        .request(config)
        .then((response: any) => {
          console.log("config ", JSON.stringify(response.data));
          response = response.data;
          logInfo(
            `Response from refresh token API: ${JSON.stringify(response.data)}`
          );
        })
        .catch((error: any) => {
          console.log(error);
        });
      return response;
    } catch (error) {
      logError(`ERROR LOG at GET REFRESH TOKEN ${error}`);
    }
  }),

  // Trigger: Lambda function
  // TODO: Check active policies for balances exceeding a set premium multiple and lapse them.
  lapsePolicies: protectedProcedure
    .input(
      z.object({
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(`Success LOG AT REQUEST LAPSE POLICIES`);
      try {
        //get all active, unArchived policies, whos start date is greater than current date
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
          },
        });
        // Filter the policies based on the balance and premium
        const policiesToLapse = activePolicies.filter((policy) => {
          if (policy?.totalPremium && policy?.balance)
            return (
              policy?.balance >
              policy?.totalPremium * LAPSE_POLICY_THRESHOLD_IN_MONTHS
            );
        });
        const lapsedPolicies: Policy[] = [];
        let lapsedCount = 0;

        // Update the status of the policy to "LAPSED"
        for (const policy of policiesToLapse) {
          const updatePolicy = await ctx.prisma.policy.update({
            where: { id: policy.id },
            data: { status: "LAPSED" },
          });
          if (updatePolicy) {
            lapsedPolicies.push(policy);
            lapsedCount++;
          }
        }
        return {
          count: lapsedCount,
          lapsedPolicies: lapsedPolicies,
        };
      } catch (error) {
        logError(`Error log at LAPSE POLICIES Error:${error}`);
        return handleApiResponseError(error);
      }
    }),

  // Trigger: Lambda function
  // TODO: Update the balance of active policies with the total premium amount.and add an entry to Trasactions
  updatePositiveBalance: protectedProcedure
    .input(
      z.object({
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(`Success LOG AT REQUEST UPDATE POSITIVE BALANCE`);
      try {
        //get all active, unArchived policies, whos start date is greater than current date
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
          },
        });
        let count = 0;
        let updatedPolicies: Policy[] = [];
        for (const policy of activePolicies) {
          const { id, balance, billingDay, totalPremium, packageName } = policy;
          const updatedBalance = Number(balance) + Number(totalPremium);
          const nextBillingAmount = Number(totalPremium);
          let nextBillingDate;
          const currentDate = new Date();

          // Get the last day of the current month
          const lastDayOfCurrentMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate();

          // Check if the billing day has already passed in the current month
          if (billingDay <= currentDate.getDate()) {
            // Billing day has passed, set it to the same day in the next month
            const nextMonth =
              currentDate.getMonth() + 1 === 12
                ? 0
                : currentDate.getMonth() + 1;
            const nextYear =
              currentDate.getMonth() + 1 === 12
                ? currentDate.getFullYear() + 1
                : currentDate.getFullYear();
            const nextBillingDay = new Date(
              currentDate.getMonth() + 1 === 12
                ? currentDate.getFullYear() + 1
                : currentDate.getFullYear(),
              nextMonth,
              billingDay
            ).getDate();

            nextBillingDate = new Date(
              `${nextYear}-${(nextMonth + 1)
                .toString()
                .padStart(2, "0")}-${nextBillingDay
                .toString()
                .padStart(2, "0")}`
            );
          } else {
            // Billing day is in the current month and has not passed
            const nextBillingDay =
              billingDay <= lastDayOfCurrentMonth
                ? billingDay
                : lastDayOfCurrentMonth;

            nextBillingDate = new Date(
              `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${nextBillingDay
                .toString()
                .padStart(2, "0")}`
            );
          }

          const transactions = {
            paymentType: "policyPremium",
            amount: nextBillingAmount,
            balance: updatedBalance,
            billingDate: nextBillingDate,
            packageName: packageName,
          };
          const payload = {
            balance: updatedBalance,
            nextBillingDate: nextBillingDate,
            nextBillingAmount: nextBillingAmount,
            payments: convertToObjectWithCreate(transactions), //transtion payload
          };
          const updatedPolicy = await ctx.prisma.policy.update({
            where: {
              id: id,
            },
            data: {
              ...payload,
            },
            include: {
              payments: true,
            },
          });
          if (updatedPolicy) {
            updatedPolicies.push(updatedPolicy);
            count++;
          }
        }
        return {
          count: count,
          updatedPolicies: updatedPolicies,
        };
      } catch (error) {
        logError(`Error log at UPDATE POSITIVE BALANCE Error:${error}`);
        return handleApiResponseError(error);
      }
    }),

  // Trigger: Lambda function
  // TODO: Generate payment history with pending status for active policies(add a new eum field called state[set,notset]).
  generatePayments: protectedProcedure
    .input(
      z.object({
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(`Success LOG AT REQUEST GENERATE PAYMENTS`);
      try {
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
          },
        });
        let count = 0;
        let updatedPolicies: Policy[] = [];
        for (const policy of activePolicies) {
          const paymentHistory = {
            paymentType: "policyPremium",
            status: "PROCESSING",
            amount: policy.balance,
            billingDate: policy.nextBillingDate,
            packageName: policy.packageName,
          };
          const updatePolicy = await ctx.prisma.policy.update({
            where: {
              id: policy.id,
            },
            data: {
              policyPayments: convertToObjectWithCreate(paymentHistory),
            },
          });
          if (updatePolicy) {
            count++;
            updatedPolicies.push(updatePolicy);
          }
        }
        logInfo(`Success LOG AT RESPONSE GENERATE PAYMENTS : ${count} `);
        return { count: count, updatedPolicies: updatedPolicies };
      } catch (error) {
        logError(`Error log at GENERATE PAYMENTS Error:${error}`);
        return handleApiResponseError(error);
      }
    }),

  // Trigger: Lambda function
  // TODO: Get all active policies , check for debitFromSalary,
  //       If false, add it to Qsure; call the Qsure API with the appropriate request, and send email.
  postQsurePayments: protectedProcedure
    .input(
      z.object({
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(`Success LOG AT REQUEST POST QSURE PAYMENTS`);
      try {
        let paymentCSV: any[] = [];
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
          },
          include: {
            paymentMethod: true,
            policyPayments: true,
          },
        });
        let count = 0;
        const qsurecollectionData: IQusurecollectionData[] = [];
        let base64 = "";
        for (const policy of activePolicies) {
          const paymentMethod = policy.paymentMethod[
            policy.paymentMethod.length - 1
          ] as unknown as PaymentMethod;
          if (
            paymentMethod &&
            paymentMethod?.paymentMethodType === "DEBIT_FROM_BANK_ACCOUNT" &&
            policy.paymentMethod.length > 0
          ) {
            const paymentHistory = policy?.policyPayments[
              policy?.policyPayments.length - 1
            ] as policyPayments;

            qsurecollectionData.push({
              RecordId: 50,
              branchCode: formatBranchCode(paymentMethod.branchCode as string), //6 digit numeric
              accountNumber: formatAccountNumber(
                paymentMethod.accountNumber as string
              ), // 11 digit numeric
              amount: formatAmount(
                policy?.nextBillingAmount as unknown as string
              ), //greater than 0
              accountName: formatName(String(paymentMethod?.accountHolder)),
              userReference: formatPolicyNumber(String(paymentHistory.id)),
              actionDate: formatDateForDebit(
                policy?.nextBillingDate as unknown as string
              ),
              bankAccountType: formatBankAccountType(
                String(paymentMethod?.accountType)
              ), // current | savings | transmission account
            });
            count++;
          }
        }
        if (qsurecollectionData.length > 0) {
          const csvData: any = convertArrayToCSV(qsurecollectionData);
          const refreshToken = await getAuthToken();
          const collectionFile = await submitCollectionFile(
            csvData,
            refreshToken ?? ""
          );
          if (collectionFile) {
            base64 = btoa(csvData);
            const toaddress = env.TELKOM_ADMIN_MAIL;
            paymentCSV = [
              {
                fileName: "payments.csv",
                base64: base64,
              },
            ];
            sendMailWithAttachment(
              toaddress,
              paymentCSV,
              "Report to Qsure",
              new Date().getMonth()
            );
          }
        }
        return {
          count: count,
          base64: paymentCSV[0].base64,
          qsurecollectionData: qsurecollectionData,
        };
      } catch (error) {
        logError(`Error log at POST QSURE PAYMENTS Error:${error}`);
        return handleApiResponseError(error);
      }
    }),

  //Tigger: Lambda function
  //TODO: Get all active policies , check for debitFromSalary, id yes add it to telkomfile and send email
  postTelkomPayments: protectedProcedure
    .input(
      z.object({
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      logInfo(`Success LOG AT REQUEST POST TELKOM PAYMENTS`);
      try {
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
          },
          include: {
            policyholder: true,
            paymentMethod: true,
          },
        });
        let count = 0;
        const telkomCollectionData: ITelkomCollectionData[] = [];
        for (const policy of activePolicies) {
          const paymentMethod = policy?.paymentMethod[
            policy?.paymentMethod.length - 1
          ] as unknown as PaymentMethod;
          if (paymentMethod?.paymentMethodType === "DEBIT_FROM_SALARY") {
            telkomCollectionData.push({
              amount: Number(policy?.totalPremium),
              freeBenefit: Number(policy?.freeBenefitPremium),
              balance: Number(policy?.balance),
              policyNumber: policy?.policyNumber,
              actionDate: policy?.nextBillingDate as unknown as string,
              salaryReference: policy?.policyholder
                ?.salaryReferenceNo as string,
              ...(policy?.packageName && { packageName: policy?.packageName }),
              startDate: dateConversion(policy?.startDate),
              ...(policy?.createdAt && {
                createdDate: dateConversion(policy?.createdAt),
              }),
            });
            count++;
          }
        }
        const groupedPayments = activePolicies.reduce(
          (acc: any, payment: any) => {
            const paymentMethod = payment?.paymentMethod[
              payment?.paymentMethod.length - 1
            ] as unknown as PaymentMethod;
            if (
              payment.policyholder?.salaryReferenceNo &&
              paymentMethod?.paymentMethodType === "DEBIT_FROM_SALARY"
            ) {
              let salaryReferenceNo: any;
              salaryReferenceNo = payment?.policyholder.salaryReferenceNo;
              if (!acc[salaryReferenceNo]) {
                acc[salaryReferenceNo] = {
                  policyNumbers: [],
                  packageNames: [],
                  // amount: 0,
                  balance: 0,
                  motorCreditLife: 0,
                  motorCreditLifeFree: 0,
                  device: 0,
                  funeralFreeBenefit: 0,
                  funeralOptional: 0,
                  deviceCreditLife: 0,
                };
              }

              acc[salaryReferenceNo].policyNumbers.push(payment.policyNumber);
              acc[salaryReferenceNo].packageNames.push(payment.packageName);
              // acc[salaryReferenceNo].amount += payment.totalPremium;
              acc[salaryReferenceNo].balance += emplyoeePackageNames.includes(
                payment.packageName
              )
                ? payment.balance
                : 0;
              acc[salaryReferenceNo].firstName =
                payment?.policyholder?.firstName;
              acc[salaryReferenceNo].lastName = payment.policyholder.lastName;
              acc[salaryReferenceNo].funeralFreeBenefit +=
                payment.packageName === packageNames.funeral
                  ? payment?.freeBenefitPremium
                  : 0;
              acc[salaryReferenceNo].funeralOptional +=
                payment.packageName === packageNames.funeral
                  ? payment.balance
                  : 0;
              acc[salaryReferenceNo].motorCreditLife +=
                payment.packageName === packageNames.creditLifeMotor
                  ? payment.balance
                  : 0;
              acc[salaryReferenceNo].motorCreditLifeFree +=
                payment.packageName === packageNames.creditLifeMotor
                  ? payment?.freeBenefitPremium
                  : 0;
              acc[salaryReferenceNo].device +=
                payment.packageName === packageNames.device
                  ? payment.balance
                  : 0;
              acc[salaryReferenceNo].deviceCreditLife +=
                payment.packageName === packageNames.creditLifeDevice
                  ? payment.balance
                  : 0;
            }
            return acc;
          },
          {}
        );
        const formattedResult = Object.entries(groupedPayments).map(
          ([salaryRef, group]: any) => ({
            salaryReference: salaryRef,
            firstName: group?.firstName,
            lastName: group?.lastName,
            funeralFreeBenefit: group?.funeralFreeBenefit,
            funeralOptional: group?.funeralOptional,
            motorCreditLifeFree: group?.motorCreditLifeFree,
            motorCreditLife: group?.motorCreditLife,
            device: group?.device,
            deviceCreditLife: group?.deviceCreditLife,
            // amount: group?.amount,
            amount: group?.balance,
            policyNumber: group?.policyNumbers.join(", "),
            packageName: group?.packageNames.join(", "),
          })
        );
        async function separateEmployees(formattedEmplyoees: any) {
          const result: any = {
            telkomEmployees: [],
            bcxEmployees: [],
          };

          for (const item of formattedEmplyoees) {
            try {
              let response = await bcxEmplyoees(
                `/moto/employee_data/${item.salaryReference}`
              );
              if (response.status === 200 && response.data.data?.length > 0) {
                const cmsData = response.data.data[0];
                if (cmsData && cmsData.Rank === "BCX") {
                  result.bcxEmployees?.push(item);
                } else {
                  result.telkomEmployees?.push(item);
                }
              } else {
                result.telkomEmployees?.push(item);
              }
            } catch (err) {
              console.error(
                `Error fetching employee data for ${item.salaryReference}:`,
                err
              );
              result.telkomEmployees.push(item);
            }
          }
          return result;
        }
        const { telkomEmployees, bcxEmployees } = await separateEmployees(
          formattedResult
        );
        if (
          telkomCollectionData.length > 0 &&
          telkomEmployees.length > 0 &&
          bcxEmployees.length > 0
        ) {
          const telkomEmployeesCSV = await convertArrayToCSV(telkomEmployees);
          const telkomEmployeesCSVbase64 = btoa(telkomEmployeesCSV);
          const bcxEmployeesCSV = await convertArrayToCSV(bcxEmployees);
          const bcxEmployeesCSVbase64 = btoa(bcxEmployeesCSV);
          const csvData: any = await convertArrayToCSV(telkomCollectionData);
          // if (csvData) {
          const base64 = btoa(csvData);
          const toaddress = env.TELKOM_ADMIN_MAIL;
          const employeePaymentFiles = [
            {
              fileName: "payments.csv",
              base64: base64,
            },
            {
              fileName: "telkomEmployees.csv",
              base64: telkomEmployeesCSVbase64,
            },
            {
              fileName: "bcxEmployees.csv",
              base64: bcxEmployeesCSVbase64,
            },
          ];
          sendMailWithAttachment(
            toaddress,
            employeePaymentFiles,
            "Report to Telkom",
            new Date().getMonth() + 1
          );
          // }
        }
        return {
          count: count,
          updatedPolicies: telkomCollectionData,
        };
      } catch (error) {
        logError(`Error log at POST TELKOM PAYMENTS Error:${error}`);
        return handleApiResponseError(error);
      }
    }),

  updatePolicyTransactionPayments: protectedProcedure
    .input(
      z.object({
        formData: z.string(),
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const csvContent = validateCSVData(input.formData);
        const jsonArrayPolicies = await csvtojson().fromString(csvContent);
        const firstRow =
          jsonArrayPolicies.length > 0 ? jsonArrayPolicies[0] : null;
        const missingHeaders = csvPaymentHeaders?.filter(
          (header) => !firstRow || !firstRow.hasOwnProperty(header)
        );

        if (missingHeaders.length > 0) {
          logError(
            `Error log at UPDATE POLICY TRANSACTION PAYMENT Missing headers: ${missingHeaders.join(
              ", "
            )}`
          );
          return handleApiResponseError({
            statusCode: 422,
            message: `Missing headers: ${missingHeaders.join(", ")}`,
          });
        }
        const policyNumbers = jsonArrayPolicies
          ? jsonArrayPolicies
              ?.filter(
                (policy: { policyNumber: string; status: string }) =>
                  policy.status === paymentStatusObject?.successful
              )
              .map((policy) => policy.policyNumber)
          : [];
        if (policyNumbers?.length === 0) {
          return handleApiResponseError({
            message: `No record found from given file`,
          });
        }
        const activePolicies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
            policyNumber: {
              in: policyNumbers,
            },
          },
        });

        if (activePolicies?.length === 0) {
          logError(
            `Error log at UPDATE POLICY TRANSACTION PAYMENT :No active policies are there`
          );
          return handleApiResponseError({
            message: `No active policies are there`,
          });
        }

        const updatedPolicies = await Promise.all(
          activePolicies.map(async (policy) => {
            const { id, balance, totalPremium, packageName } = policy;
            const nonNullBalance = balance ?? 0;
            const updatedBalance = -nonNullBalance;

            const transactions = {
              paymentType: "policyPremium",
              amount: updatedBalance,
              balance: 0,
              packageName: packageName,
              billingDate: new Date(),
              // paymentDate:
            };

            const payload: any = {
              balance: 0,
              payments: convertToObjectWithCreate(transactions),
            };

            return await ctx.prisma.policy.update({
              where: {
                id: id,
              },
              data: {
                ...payload,
              },
              include: {
                payments: true,
              },
            });
          })
        );

        const count = updatedPolicies?.length;
        logError(
          `Success log at UPDATE TRANSACTION POLICY PAYMENT :${updatedPolicies}`
        );
        return {
          count: count,
          updatedPolicies: updatedPolicies,
        };
      } catch (error) {
        logError(`Error log at UPDATE TRANSACTION POLICY PAYMENT :${error}`);
        return handleApiResponseError(error);
      }
    }),

  updatePolicyHistoryPayments: protectedProcedure
    .input(
      z.object({
        formData: z.string(),
        startDateThreshold: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const csvContent = validateCSVData(input.formData);
        const jsonArrayPolicies = await csvtojson().fromString(csvContent);
        const firstRow =
          jsonArrayPolicies.length > 0 ? jsonArrayPolicies[0] : null;
        const missingHeaders = csvPaymentHeaders?.filter(
          (header) => !firstRow || !firstRow.hasOwnProperty(header)
        );

        if (missingHeaders.length > 0) {
          logError(
            `Error log at UPDATE POLICY HISTORY PAYMENT Missing headers: ${missingHeaders.join(
              ", "
            )}`
          );
          return handleApiResponseError({
            statusCode: 422,
            message: `Missing headers: ${missingHeaders.join(", ")}`,
          });
        }
        const policyNumbersWithStatus = jsonArrayPolicies
          ? jsonArrayPolicies
              ?.filter(
                (policy: { policyNumber: string; status: string }) =>
                  policy.status === paymentStatusObject?.successful ||
                  policy.status === paymentStatusObject?.failed
              )
              .reduce(
                (result, policy) => {
                  result.policyNumbers.push(policy.policyNumber);
                  result.status.push({
                    policyNo: policy.policyNumber,
                    status: policy.status,
                    failureReason: policy.failureReason ?? "",
                  });
                  return result;
                },
                { policyNumbers: [], status: [] }
              )
          : { policyNumbers: [], status: [] };
        if (
          policyNumbersWithStatus?.policyNumbers?.length === 0 ||
          policyNumbersWithStatus?.status?.length === 0
        ) {
          logError(
            `Error log at UPDATE POLICY HISTORY PAYMENT :No record found from given file`
          );
          return handleApiResponseError({
            message: `No record found from given file`,
          });
        }
        const policies = await ctx.prisma.policy.findMany({
          where: {
            status: "ACTIVE",
            isArchived: false,
            startDate: {
              lte: input.startDateThreshold
                ? input.startDateThreshold
                : new Date(),
            },
            policyNumber: {
              in: policyNumbersWithStatus?.policyNumbers,
            },
          },
          include: {
            policyPayments: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1, // Take only the latest payment
            },
          },
        });

        const activePolicies = policies.filter(
          (policy) =>
            policy?.policyPayments.length > 0 &&
            policy?.policyPayments[0]?.state === "NOT_POSTED"
        );

        if (activePolicies?.length === 0) {
          logError(
            `Error log at UPDATE POLICY HISTORY PAYMENT :No active policies are there`
          );
          return handleApiResponseError({
            message: `No active policies are there`,
          });
        }

        const updatedPolicies = await Promise.all(
          activePolicies.map(async (policy) => {
            const { id, policyNumber, policyPayments } = policy;
            const policyPaymentsId = policyPayments[0]?.id;
            const filteredPolicy = policyNumbersWithStatus?.status?.find(
              (item: any) => item.policyNo === policyNumber
            );

            const filteredPolicyStatus = filteredPolicy?.status;
            const filteredPolicyFailureReason =
              filteredPolicy?.failureReason ?? "";

            return await ctx.prisma.policyPayments.update({
              where: {
                id: policyPaymentsId,
              },
              data: {
                // paymentDate:,
                status: filteredPolicyStatus,
                state: PaymentState.POSTED,
                failureReason: filteredPolicyFailureReason,
              },
            });
          })
        );

        const count = updatedPolicies?.length;
        logError(
          `Success log at UPDATE POLICY HISTORY PAYMENT :${updatedPolicies}`
        );
        return {
          count: count,
          updatedPolicies: updatedPolicies,
        };
      } catch (error) {
        logError(`Error log at UPDATE POLICY HISTORY PAYMENT :${error}`);
        return handleApiResponseError(error);
      }
    }),

  updatePolicyPaymentManually: protectedProcedure
    .input(
      z.object({
        policyNumber: z.string(),
        status: z.string(),
        failureReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const activePolicies = await ctx.prisma.policy.findFirst({
          where: {
            // status: "ACTIVE",
            isArchived: false,
            policyNumber: input?.policyNumber,
            policyPayments: {
              every: {
                state: "NOT_POSTED",
              },
            },
          },
          include: {
            policyPayments: true,
          },
        });
        if (!activePolicies?.policyNumber) {
          logError(
            `Error log at UPDATE POLICY PAYMENT :No active policies are there`
          );
          return handleApiResponseError({
            message: `No active policies are there`,
          });
        }
        if (
          activePolicies?.policyPayments?.[0]?.id === null ||
          activePolicies?.policyPayments?.[0]?.id === undefined ||
          !activePolicies?.policyPayments?.[0]?.id
        ) {
          logError(
            `Error log at UPDATE POLICY PAYMENT :No active policies are there`
          );
          return handleApiResponseError({
            message: `No active policies are there in history`,
          });
        }
        const { id, balance, totalPremium, packageName, policyPayments } =
          activePolicies;
        const policyPaymentsId = policyPayments[0]?.id;
        const nonNullBalance = balance ?? 0;
        const updatedBalance = -nonNullBalance;
        const transactions = {
          paymentType: "policyPremium",
          amount: updatedBalance,
          balance: 0,
          packageName: packageName,
          billingDate: new Date(),
        };

        const payload: any = {
          balance: 0,
        };

        if (input.status === paymentStatusObject?.successful) {
          payload.payments = convertToObjectWithCreate(transactions);
          payload.policyPayments = {
            update: {
              where: {
                id: policyPaymentsId,
              },
              data: {
                status: paymentStatusObject.successful,
                state: paymentState.posted,
              },
            },
          };
        } else if (input.status === paymentStatusObject?.failed) {
          payload.policyPayments = {
            update: {
              where: {
                id: policyPaymentsId,
              },
              data: {
                status: paymentStatusObject.failed,
                state: paymentState.posted,
                failureReason: input.failureReason ?? "",
              },
            },
          };
        }
        const updatedPolicies = await ctx.prisma.policy.update({
          where: {
            id: id,
          },
          data: {
            ...payload,
          },
          include: {
            policyPayments: true,
          },
        });
        return updatedPolicies;
      } catch (error) {
        logError(`Error log at UPDATE POLICY PAYMENT :${error}`);
        return handleApiResponseError(error);
      }
    }),
});

const getAuthToken = async () => {
  try {
    let result = "";
    let data = qs.stringify({
      username: env.XCELERATEUSERNAME,
      password: env.XCELERATEPASSWORD,
      grant_type: "password",
      client_id: env.QSURECLIENTID,
    });
    logInfo(`SUCCESS REQUEST at GET REFRESH ROKEN ${JSON.stringify(data)}`);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${env.QSUREURL}/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
    logInfo(`SUCCESS REQUEST at GET REFRESH ROKEN ${JSON.stringify(config)}`);

    axios
      .request(config)
      .then((response: any) => {
        logInfo(
          `SUCCESS RESPONSE at GET REFRESH TOKEN ${JSON.stringify(response)}`
        );
        result = response;
      })
      .catch((error: any) => {
        logError(`ERROR LOG at GET REFRESH TOKEN ${error}`);
      });
    return result;
  } catch (error) {
    logError("ERROR LOG at GET REFRESH TOKEN");
  }
};

const submitCollectionFile = async (csvData: any, refreshToken: string) => {
  const authTokenUrl: string = `${env.QSUREURL}/submitcollectionfile`;
  try {
    const base64 = btoa(csvData);
    const postData = {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: env.QSURECLIENTID,
      file_name: "collectionFile.csv",
      file_contents: base64,
      file_integration_user: env.FILEINTEGRATIONUSERNAME,
      international_transactions: "false",
      header_first_row: "false",
      bucket_startdate: "",
      subaccount_unique_id: env.SUB_ACCOUNT_UNIQUE_ID,
      file_sequence_number: 1,
      autosave_transactions: "true",
    };
    const fileSUbmitted = await axios.post(authTokenUrl, postData);
    if (fileSUbmitted.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (Error) {
    logError(
      `ERROR RESPONSE IN SUBMIT COLLECTION FILE ${JSON.stringify(Error)}`
    );
  }
};

const getPreviousDayReport = async (refreshToken: string) => {
  try {
    const Report =
      await axios.get(`${env.QSUREURL}/getreportsforpreviousbusinessday?refreshtoken=${refreshToken}
        &fileintegrationuser=${env.FILEINTEGRATIONUSERNAME}`);
    return Report.data;
  } catch (Error) {
    logError(`Error log at GET PAYMENTS Error:${Error}`);
    return handleApiResponseError(Error);
  }
};

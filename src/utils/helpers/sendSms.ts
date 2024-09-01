import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const { convert } = require("html-to-text");
import { checkObjectValueInString } from "../constants";
import { IEventNotification } from "~/interfaces/eventNotification";
import { logError, logWarn } from "~/server/api/constants/logger";
import { env } from "~/env.mjs";

export const smsSendGenerator = async (
  reqData: any,
  phoneNumber: string,
  event: IEventNotification
): Promise<any> => {
  const smsConvert = checkObjectValueInString(event.smsTemplate, reqData);
  try {
    const client = new SNSClient(
      env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
        ? {
            region: env.AWS_REGION as string,
            credentials: {
              accessKeyId: env.AWS_KEY as string,
              secretAccessKey: env.AWS_SECRET as string,
            },
          }
        : {
            region: env.AWS_REGION as string,
          }
    );
    let phNumber = phoneNumber.split(",");
    const sendSMSCommand: any = new PublishCommand({
      Message: convert(smsConvert),
      PhoneNumber: phNumber[0],
    });
    const response: any = await client.send(sendSMSCommand);
    logWarn(
      `warning in smsSendGenerator for UserId:${
        reqData.createdById
      } for phone:${phNumber} eventCategory: ${
        event.eventCategory
      }  and response: ${JSON.stringify(response)}`
    );
    return {
      status: true,
      response: response.MessageId ?? null,
      phoneNumber: phNumber[0],
      eventName: event.eventCategory,
      smsConvert: smsConvert,
    };
  } catch (error: any) {
    logError(
      `error in emailSendGenerator for UserId:${
        reqData.createdById
      } for phone:${phoneNumber.split(",")} eventCategory: ${
        event.eventCategory
      }  and response: ${JSON.stringify(error)}`
    );
    return { status: false, response: error.Code };
  }
};

export const smsOTPGenerator = async (
  reqData: any,
  phoneNumber: string
): Promise<any> => {
  const smsConvert = `This is a TELKOM login OTP. Do not share the OTP with anyone. Your OTP ${reqData} to log into TELKOM ADMIN`;
  try {
    const client = new SNSClient(
      env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
        ? {
            region: env.AWS_REGION as string,
            credentials: {
              accessKeyId: env.AWS_KEY as string,
              secretAccessKey: env.AWS_SECRET as string,
            },
          }
        : {
            region: env.AWS_REGION as string,
          }
    );
    const sendSMSCommand: any = new PublishCommand({
      Message: convert(smsConvert),
      PhoneNumber: phoneNumber,
    });
    const response: any = await client.send(sendSMSCommand);
    console.log("response", response);
    logWarn(
      `warning in smsSendGenerator for UserId:${
        reqData.createdById
      } for phone:${phoneNumber}  and response: ${JSON.stringify(response)}`
    );
    return {
      status: true,
      response: response.MessageId ?? null,
      phoneNumber: phoneNumber,
      smsConvert: smsConvert,
      otp: reqData,
    };
  } catch (error: any) {
    logError(
      `error in emailSendGenerator for UserId:${
        reqData.createdById
      } for phone:${phoneNumber.split(",")}
      }  and response: ${JSON.stringify(error)}`
    );
    return { status: false, response: error.Code };
  }
};

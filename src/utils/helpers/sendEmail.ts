import { SES } from "aws-sdk";
import SignUpTemplate from "~/components/template/signupTemplate";
const mimemessage = require("mimemessage");
import { checkObjectValueInString, pageTitle } from "../constants";
import forgotPasswordTemplate from "~/components/template/forgotPasswordTemplate";
import complaintTemplate from "~/components/template/complaintTemplate";
import claimTemplate from "~/components/template/claimTemplate";
import { IEventNotification } from "~/interfaces/eventNotification";
import EmailConverterTemplate from "~/components/template/emailConverterTemplate";
import { logError, logInfo, logWarn } from "~/server/api/constants/logger";
import { env } from "~/env.mjs";
const { convert } = require("html-to-text");

import AWS from "aws-sdk";

export const sendEmail = async (
  email: string,
  firstName: string,
  subject: "signUp" | "forgotPassword" | "complaint" | "claim"
): Promise<any> => {
  let template;
  if (subject === "signUp") {
    template = SignUpTemplate(email, firstName);
  } else if (subject === "forgotPassword") {
    template = forgotPasswordTemplate(email, firstName);
  } else if (subject === "complaint") {
    template = complaintTemplate(firstName); /** password will be firstName */
  } else if (subject === "claim") {
    template = claimTemplate(firstName);
  } else {
    throw new Error("Invalid subject");
  }
  const mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [],
  });
  mailContent.header("From", `Telkom Insurance <${env.MAIL_FROM_ADDRESS}>`);
  mailContent.header("To", email);
  mailContent.header("Subject", `Telkom Insurance - ${subject} Details`);

  const alternateEntity = mimemessage.factory({
    contentType: "multipart/alternate",
    body: [],
  });
  const htmlEntity = mimemessage.factory({
    contentType: "text/html;charset=utf-8",
    body: template,
  });
  alternateEntity.body.push(htmlEntity);
  mailContent.body.push(alternateEntity);

  const client = new SES(
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

  const sendMail = client
    .sendRawEmail({
      RawMessage: { Data: Buffer.from(mailContent.toString()) },
    })
    .promise();

  return Promise.all([
    sendMail.then((data) => {
      logInfo(
        `Success log at SENDEMAIL, email:${email}, for SUBJECT ${subject}, firstName: ${firstName},  response:${JSON.stringify(
          data
        )} `
      );
      return data.MessageId;
    }),
    sendMail.catch((err) => {
      logError(
        `Error log at SENDEMAIL, email:${email}, for SUBJECT ${subject}, firstName: ${firstName}, response:${JSON.stringify(
          err
        )}`
      );
      return err.stack;
    }),
  ]);
};

export const emailSendGenerator = async (
  reqData: any,
  emails: string,
  event: IEventNotification,
  emailBody: any,
  packageKeyAttachments: any
): Promise<any> => {
  logInfo(
    `REQUEST for emailGenerator userId ${reqData.createdById} for email:${[
      emails,
    ]}, eventCategory:${event.eventCategory}`
  );
  let fact = false;
  const emailConvert = checkObjectValueInString(event.emailTemplate, reqData);
  const mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [],
  });
  if (event?.attachment) {
    const attachmentEntity = mimemessage.factory({
      contentType: "application/pdf",
      contentTransferEncoding: "base64",
      body: emailBody,
    });

    attachmentEntity.header(
      "Content-Disposition",
      `attachment; filename=policy-schedule.pdf`
    );
    mailContent.body.push(attachmentEntity);

    if (packageKeyAttachments) {
      const asyncOperations = packageKeyAttachments.map(async (item: any) => {
        if (item?.s3response && item?.s3response?.key) {
          try {
            const base64Data = await s3UrlToBase64(
              item.fileUrl,
              item?.s3response?.key
            );
            if (base64Data) {
              let packageBase64 = mimemessage.factory({
                contentType: item?.type,
                contentTransferEncoding: "base64",
                body: base64Data,
              });
              packageBase64.header(
                "Content-Disposition",
                `attachment; filename="${item.name}"`
              );
              mailContent.body.push(packageBase64);
              logInfo(
                `SUCCESS in emailSendGenerator for sending ${
                  item.name
                } package doc UserId:${reqData.createdById} for email:${[
                  emails,
                ]} eventCategory: ${event.eventCategory}`
              );
            } else {
              fact = true;
              logError(
                `Error in emailSendGenerator for getting ${
                  item.name
                } package doc UserId:${reqData.createdById} for email:${[
                  emails,
                ]} eventCategory: ${event.eventCategory}`
              );
            }
          } catch (error) {
            logError(
              `Error in emailSendGenerator for getting package documents for  UserId:${
                reqData.createdById
              } for email:${[emails]} eventCategory: ${
                event.eventCategory
              }  and response: ${JSON.stringify(error)}`
            );
          }
        }
      });
      await Promise.all(asyncOperations);
    }
  }

  mailContent.header("From", `Telkom Insurance <${env.MAIL_FROM_ADDRESS}>`);
  mailContent.header("To", [emails]);
  mailContent.header("Subject", `Telkom Insurance - ${event.eventCategory}`);
  let emailHeaderTemplate = EmailConverterTemplate(pageTitle, emailConvert);
  const alternateEntity = mimemessage.factory({
    contentType: "multipart/alternate",
    body: [],
  });

  const htmlEntity = mimemessage.factory({
    contentType: "text/html",
    body: emailHeaderTemplate,
  });
  mailContent.body.push(htmlEntity);
  const client = new SES(
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
  const sendMail = client
    .sendRawEmail({
      RawMessage: { Data: Buffer.from(mailContent.toString()) },
    })
    .promise();
  // const emailContent = convert(emailConvert);
  // const plainText = emailContent.replace(/['"\n]/g, "");

  try {
    const data = await sendMail;
    logWarn(
      `Success in emailSendGenerator for UserId:${
        reqData.createdById
      } for email:${[emails]} eventCategory: ${
        event.eventCategory
      } and response: ${JSON.stringify(data)}`
    );
    return {
      status: true,
      response: data.MessageId,
      email: emails,
      eventName: event.eventCategory,
      emailConvert: emailConvert,
      attachment: event.attachment ? reqData.policyScheduleKey : "",
      packageKeyAttachments: event.attachment
        ? fact
          ? ["failed to get package documents"]
          : packageKeyAttachments
        : [],
    };
  } catch (err) {
    logError(
      `Error in emailSendGenerator for  UserId:${
        reqData.createdById
      } for email:${[emails]} eventCategory: ${
        event.eventCategory
      }  and response: ${JSON.stringify(err)}`
    );
    return {
      status: false,
      response: err,
      email: emails,
      eventName: event.eventCategory,
      emailConvert: emailConvert,
      attachment: event.attachment ? reqData.policyScheduleKey : "",
      packageKeyAttachments: event.attachment
        ? fact
          ? ["failed to get package documents"]
          : packageKeyAttachments
        : [],
    };
  }
};

async function s3UrlToBase64(url: string, key: any) {
  try {
    const s3 = new AWS.S3(
      env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
        ? {
            accessKeyId: env.AWS_KEY as string,
            secretAccessKey: env.AWS_SECRET as string,
            region: env.AWS_LOG_REGION as string,
          }
        : {
            region: env.AWS_LOG_REGION as string,
          }
    );
    const params = {
      Bucket: env.AWS_BUCKET,
      Key: key,
    };
    const response: any = await s3.getObject(params).promise();
    const base64Data = Buffer.from(response.Body, "binary").toString("base64");
    return base64Data;
  } catch (error) {
    return false;
  }
}

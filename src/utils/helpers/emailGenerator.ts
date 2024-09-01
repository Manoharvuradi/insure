import { SES } from "aws-sdk";
import { env } from "~/env.mjs";
import { generatePDF } from "../constants";
import PdfTemplate from "~/components/template/pdfTemplate";
import ReactDOMServer from "react-dom/server";
const mimemessage = require("mimemessage");

export const emailGenerator = async (policy: any): Promise<any> => {
  const html = policy
    ? ReactDOMServer.renderToString(PdfTemplate(policy, false))
    : "<h1>Your policy holder details are empty</h1>";
  const pdfBuffer = await generatePDF(html as unknown as string);
  const b64 = Buffer.from(pdfBuffer).toString("base64");

  const mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [],
  });
  mailContent.header("From", `Telkom Insurance <${env.MAIL_FROM_ADDRESS}>`);
  mailContent.header("To", policy?.policyholder?.email);
  mailContent.header("Subject", "Telkom Insurance - Policy document");

  const alternateEntity = mimemessage.factory({
    contentType: "multipart/alternate",
    body: [],
  });
  const htmlEntity = mimemessage.factory({
    contentType: "text/html;charset=utf-8",
    body: `Please find the attachment for the policy number: ${policy.policyNumber} `,
  });
  alternateEntity.body.push(htmlEntity);
  mailContent.body.push(alternateEntity);

  const attachmentEntity = mimemessage.factory({
    contentType: "application/pdf",
    contentTransferEncoding: "base64",
    body: b64,
  });
  attachmentEntity.header(
    "Content-Disposition",
    `attachment; filename=policy-schedule.pdf`
  );
  mailContent.body.push(attachmentEntity);

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
    sendMail.then((data) => data.MessageId),
    sendMail.catch((err) => err.stack),
  ]);
};

export const sendMailWithAttachment = async (
  toAddress: string,
  attachments: Array<{ fileName: string; base64: string }>,
  reportType: string,
  currentMonth: number
) => {
  const mailContent = mimemessage.factory({
    contentType: "multipart/mixed",
    body: [],
  });
  mailContent.header("From", `Telkom Insurance <${env.MAIL_FROM_ADDRESS}>`);
  mailContent.header("To", toAddress);
  mailContent.header("Subject", reportType);
  const alternateEntity = mimemessage.factory({
    contentType: "multipart/alternate",
    body: [],
  });

  const htmlEntity = mimemessage.factory({
    contentType: "text/html;charset=utf-8",
    body: `Dear Admin,


    <p>Here is the Payment file for the month : ${currentMonth}</p> 

   <p>Please check and update your response in the same Sheet</p>
    `,
  });

  alternateEntity.body.push(htmlEntity);
  mailContent.body.push(alternateEntity);

  attachments?.forEach((file) => {
    const telkomEmployeesEntity = mimemessage.factory({
      contentType: "application/pdf",
      contentTransferEncoding: "base64",
      body: file.base64,
    });
    telkomEmployeesEntity.header(
      "Content-Disposition",
      `attachment; filename=${file.fileName}`
    );
    mailContent.body.push(telkomEmployeesEntity);
  });
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
    sendMail.then((data) => data.MessageId),
    sendMail.catch((err) => err.stack),
  ]);
};

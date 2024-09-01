import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  DescribeLogStreamsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

import { env } from "~/env.mjs";
/** * Describes stream */

async function describeLogStream() {
  try {
    const client = new CloudWatchLogsClient(
      env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
        ? {
            region: env.AWS_LOG_REGION as string,
            credentials: {
              accessKeyId: env.AWS_KEY as string,
              secretAccessKey: env.AWS_SECRET as string,
            },
          }
        : {
            region: env.AWS_LOG_REGION as string,
          }
    );
    const command = new DescribeLogStreamsCommand({
      logGroupName: env.LOG_GROUP_NAME,
    });
    const response = await client.send(command);
    return response;
  } catch (error) {
    return error;
  }
}
/** * Add logs with logGroup token * @param token * @param logMessage * @returns */
async function putLog(token: string, logMessage: string) {
  try {
    const putLog = {
      logGroupName: env.LOG_GROUP_NAME,
      logStreamName: env.LOG_STREAM_NAME,
      logEvents: [{ timestamp: Date.now(), message: logMessage }],
      sequenceToken: token,
    };
    const client = new CloudWatchLogsClient(
      env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL" && env.AWS_KEY && env.AWS_SECRET
        ? {
            region: env.AWS_LOG_REGION as string,
            credentials: {
              accessKeyId: env.AWS_KEY as string,
              secretAccessKey: env.AWS_SECRET as string,
            },
          }
        : {
            region: env.AWS_LOG_REGION as string,
          }
    );
    const command = new PutLogEventsCommand(putLog);
    const response = await client.send(command);
    return response;
  } catch (error) {
    //Catch silently... return false;
  }
}
/** * LogType: error * @param data */
export const logError = (data: any) => {
  describeLogStream()
    .then((res: any) => {
      const errorMessage = `{"type": "error", "data": ${JSON.stringify(
        data
      )} }`;
      putLog(res.logStreams[0].uploadSequenceToken, errorMessage);
    })
    .catch((error) => {
      //Catch silently...
    });
};
/** * LogType: info * @param data */
export const logInfo = (data: any) => {
  describeLogStream()
    .then((res: any) => {
      const errorMessage = `{"type": "info", "message": ${JSON.stringify(
        data
      )} }`;
      putLog(res.logStreams[0].uploadSequenceToken, errorMessage);
    })
    .catch((error) => {
      //Catch silently...
    });
};
/** * LogType: warn * @param data */
export const logWarn = (data: any) => {
  describeLogStream()
    .then((res: any) => {
      const errorMessage = `{"type": "warn", "message": ${JSON.stringify(
        data
      )} }`;
      putLog(res.logStreams[0].uploadSequenceToken, errorMessage);
    })
    .catch((error) => {
      //Catch silently...
    });
};

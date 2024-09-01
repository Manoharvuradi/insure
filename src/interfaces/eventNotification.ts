export interface IEventNotification {
  eventName: string;
  eventCategory: string;
  packageName: string;
  emailNotification: boolean;
  emailTemplate: string;
  smsNotification: boolean;
  smsTemplate: string;
  attachment: boolean;
}

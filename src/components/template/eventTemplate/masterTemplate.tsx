export const masterEmailTemplate = () => {
  const template = `<div>
      <p>Dear {{policyholder.firstName}},</p>
      <p>Your premium payment failed.</p>
      <p>
        We'll attempt to charge {{policyholder.firstName}} to your card on
        the 4th of this month. Please ensure we have the correct payment details
        and that you have sufficient funds in your account.
      </p>
      <p>
        Regards,
        <br />
        The Telkom Team
      </p>
    </div>`;
  return template;
};

export const masterSMSTemplate = () => {
  const template = `<div>
      <p>Dear {{policyholder.firstName}},</p>
      <p>Your premium payment failed.</p>
      <p>
        We'll attempt to charge {{policyholder.firstName}}  to your card on
        the 4th of this month. Please ensure we have the correct payment details
        and that you have sufficient funds in your account.
      </p>
      <p>
        Regards,
        <br />
        The Telkom Team
      </p>
    </div>`;

  return template;
};

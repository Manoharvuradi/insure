const forgotPasswordTemplate = (firstName = "", password = "") => {
  const fname = firstName ? `${firstName},` : "";
  const displayName = `Hi ${fname}`;
  const subText = `We received a request to reset your password for the Telkom Insurance Portal.<br/><br/>Please find the login password: <br/><b> ${password}</b>`;
  let email = emailHeader(
    "Forgot Password",
    "Welcome to Telkom Insurance",
    displayName,
    subText
  );
  return email;
};

export default forgotPasswordTemplate;

function emailHeader(
  title = "",
  headingText = "",
  firstName = "",
  headingSubText = ""
) {
  const pageTitle = title ? "Telkom Insurance | " + title : "Telkom Insurance";
  const header = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <meta name="viewport" content="width=device-width, initial-scale=1" /> <title>${pageTitle}</title> <style type="text/css"> body{ font-family: Arial, Helvetica, sans-serif; } /* Define styles for the header */ .header { background-color: #008fe0; padding: 20px; text-align: center; } .header img { display: inline-block; max-width: 100%; height: auto; } .contentHeader, .contentTrTd { background-color: #008fe0; padding: 20px 20px 0px 20px; text-align: center; } .contentTrTd{ background-color: #008fe0; padding: 0px 20px 0px 20px; } #heading_title { font-style: normal; font-weight: 700; font-size: 18px; line-height: 28px; color: #01272f; } .contentColor { color: #3c5564; } #heading_hi { font-size: 24px; line-height: 32px; padding-top: 24px; } #heading_text { padding-top: 20px; font-size: 24px; } #heading_sub_text { font-size: 16px; line-height: 24px; padding-top: 20px; } #headingContetn, .contentTrTdTable { padding-top: 60px; border-top-left-radius: 20px; border-top-right-radius: 20px; width: 90%; } .contentTrTdTable{ padding-top: 0px; border-top-left-radius: 0px; border-top-right-radius: 0px; } .content-bg-white { background: #ffffff; } /* Define styles for the footer */ .footer { background: #f3f7fa; } .socialIconsTr a { display: inline-block; margin: 0 10px; } .socialIconsTr td a img { display: block; max-width: 24px; height: auto; } .socialIconsTr td a:last-child img { max-width: 24px; } .contentHeader { background-color: #008fe0; padding: 20px 20px 0px 20px; text-align: center; } .footerHeader { background-color: #f3f7fa; padding: 0px 20px 20px 20px; text-align: center; } .contentFooter { background-color: #f3f7fa; text-align: center; } #footerContent { border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; width: 90%; } .hrLineWidth { padding-top: 20px; width: 80%; } .hrLine { border: 1px solid #e6ebf2; } .needHelp { font-size: 24px; line-height: 32px; padding: 10px 0px; } .socialIconsTrTable { padding: 20px 0px; } .contentAnchor { color: #de7d0b; } .callText { padding: 8px; } .callTextExtraPadding { padding-bottom: 40px; } .footerBottomText { font-style: normal; font-weight: 400; font-size: 8px; line-height: 14px; color: #7e939c; text-align: center; } #footerBottomTextTr{ padding-bottom: 40px; } .password{ font-size: 16px; color: #01272F; line-height: 36px; font-weight: 500; padding-top: 30px 0px; } .textCapitalize{ text-transform: capitalize; } .emailAnchor { background-color: #DE7D0B; color: white; border: none; border-radius: 5px; padding: 16px 30px; font-size: 14px; text-decoration: none; } .forgotTrTdTable{ padding-top: 40px; padding-bottom: 40px; } .signUpPasswordTable{ padding-top: 20px; padding-bottom: 30px; } /**/ @media only screen and (max-width: 600px) { #headingContetn, #footerContent, .contentTrTdTable { padding-top: 30px; width: 96%; } } </style> </head> <body> <table border="0" padding="0" cellspacing="0" width="100%"> <!-- Header section --> <tr> <td class="header" align="center"> <img src="https://www.telkominsurance.co.za/images/logo.svg" alt="Logo" /> </td> </tr> <!-- End header --> <!-- --> <tr> <td class="contentHeader"> <table id="headingContetn" border="0" cellpadding="0" cellspacing="0" align="center" class="content-bg-white" > <tr> <td id="heading_title" align="center">${headingText}</td> </tr> <tr> <td id="heading_text" align="center" class="contentColor textCapitalize"> ${firstName} </td> </tr> <tr> <td id="heading_sub_text" align="center" class="contentColor"> ${headingSubText} </td> </tr> </table> </td> </tr> <!-- --> `;
  return header;
}

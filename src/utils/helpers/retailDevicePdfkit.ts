import { capitalizedConvertion, dateConversion } from ".";
import { currencyLabels } from "../constants";

export async function retailDevicePdfkit(reqData: any) {
  const PDFDocument = require("pdfkit-table");
  const blue = "#008FE0";
  const personalDetails: any[] = [
    "firstName",
    "lastName",
    "citizenshipId",
    "dateOfBirth",
    "streetAddress1",
    "phone",
    "email",
    "city",
    "areaCode",
  ];

  const neccessaryFields = ["policyNumber", "basePremium", "monthlyPremium"];

  const pdfBuffer = await new Promise<string>((resolve) => {
    const doc = new PDFDocument();

    doc.fillColor(blue).rect(0, 0, doc.page.width, 50).fill();
    doc
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .fontSize(16)
      .text("Insured", 20, 10);
    doc.font("Helvetica").fontSize(12).text("Telkom Retail Device", 20, 30);
    doc.fillColor(blue).fontSize(8).text("Company Reg no :", 20, 60);
    doc.fillColor("black").text("1991/005476/30", 90, 60);
    doc.fillColor(blue).fontSize(8).text("FSP no :", 20, 70);
    doc.fillColor("black").text("46037", 90, 70);
    doc.fillColor(blue).fontSize(8).text("VAT Reg no :", 20, 80);
    doc.fillColor("black").text("4680101146", 90, 80);
    doc.fillColor(blue).fontSize(8).text("Claims Reg no :", 20, 90);
    doc.fillColor("black").text("0800 229 900", 90, 90);
    doc.fillColor(blue).fontSize(8).text("Amendments :", 20, 100);
    doc.fillColor("black").text("0800 229 900", 90, 100);
    doc.fillColor(blue).fontSize(8).text("Email address :", 20, 110);
    doc.fillColor("black").text("insure@telkominsurance.co.za", 90, 110);
    doc.strokeColor(blue).moveTo(210, 60).lineTo(210, 120).stroke();
    doc.fillColor(blue).text("Postal address", 220, 60);
    doc.fillColor("black").text("Telkom Park", 220, 70);
    doc.fillColor("black").text("The Hub", 220, 80);
    doc.fillColor("black").text("61 Oak Avenue", 220, 90);
    doc.fillColor("black").text("Highveld", 220, 100);
    doc.fillColor("black").text("Centurion 0157", 220, 110);
    doc.strokeColor(blue).moveTo(370, 60).lineTo(370, 120).stroke();
    doc.fillColor(blue).text("Physical address", 380, 60);
    doc.fillColor("black").text("Telkom Park", 380, 70);
    doc.fillColor("black").text("The Hub", 380, 80);
    doc.fillColor("black").text("61 Oak Avenue", 380, 90);
    doc.fillColor("black").text("Highveld", 380, 100);
    doc.fillColor("black").text("Centurion 0157", 380, 110);
    doc.font("Helvetica-Bold").text("Part A", 20, 130);
    doc
      .font("Helvetica")
      .text(
        "Part A is all about you and your personal insurance details. It is about the cover you have taken out, how much you pay in premium and what you and your dependents are covered for.",
        20,
        140
      );
    doc
      .fillColor(blue)
      .rect(20, 160, doc.page.width - 40, 30)
      .fill();
    doc
      .strokeColor(blue)
      .rect(20, 200, doc.page.width - 40, 160)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("POLICYHOLDER DETAILS", 30, 170);
    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(10)
      .text("Personal Details", 30, 210);

    personalDetails?.map((field: any, index: number = 1) => {
      let top = 230 + index * 10;

      if (field === "dateOfBirth") {
        doc
          .font("Helvetica")
          .fillColor("black")
          .fontSize(8)
          .text(capitalizedConvertion(field), 30, top);
        doc
          .fillColor("black")
          .fontSize(8)
          .text(
            `: ${dateConversion(reqData?.policyholder[field]?.toString())}`,
            202,
            top
          );
      } else {
        doc
          .font("Helvetica")
          .fillColor("black")
          .fontSize(8)
          .text(
            field == "citizenshipId" ? "SA-ID" : capitalizedConvertion(field),
            30,
            top
          );
        doc
          .fillColor("black")
          .fontSize(8)
          .text(
            `: ${reqData?.policyholder[field]?.toString() ?? "-"}`,
            202,
            top
          );
      }
    });

    neccessaryFields?.map((field: any, index: number = 1) => {
      let top = 320 + index * 10;

      if (
        field === "createdAt" ||
        field === "updatedAt" ||
        field === "dateOfBirth" ||
        field === "endDate" ||
        field === "claimDate" ||
        field === "startDate"
      ) {
        doc
          .font("Helvetica")
          .fillColor("black")
          .fontSize(8)
          .text(capitalizedConvertion(field), 30, top);
        doc
          .fillColor("black")
          .fontSize(8)
          .text(
            `: ${dateConversion(reqData?.policyholder[field]?.toString())}`,
            202,
            top
          );
      }
      if (field === "monthlyPremium") {
        doc
          .font("Helvetica")
          .fillColor("black")
          .fontSize(8)
          .text(capitalizedConvertion(field), 30, top);
        doc
          .fillColor("black")
          .fontSize(8)
          .text(`: R ${reqData.totalPremium.toFixed(2)}`, 200, top);
      } else {
        doc
          .font("Helvetica")
          .fillColor("black")
          .fontSize(8)
          .text(capitalizedConvertion(field), 30, top);
        doc
          .fillColor("black")
          .fontSize(8)
          .text(
            currencyLabels.includes(field)
              ? `: R ${reqData[field]?.toString().replace(/_/g, "")}`
              : `: ${reqData[field]?.toString().replace(/_/g, "")}`,
            200,
            top
          );
      }
    });

    doc
      .fillColor(blue)
      .rect(20, 370, doc.page.width - 40, 30)
      .fill();

    doc
      .strokeColor(blue)
      .rect(20, 410, doc.page.width - 40, 90)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("DEVICE DETAILS", 30, 380);

    const deviceInsuredFields = [
      "deviceType",
      "deviceBrand",
      "deviceModel",
      "devicePrice",
      // "deviceStorage",
      "deviceModelColor",
      "deviceUniqueNumber",
      // "premiumAmount",
    ];

    const createTableField = (field: string): any => ({
      label: capitalizedConvertion(field),
      property: field,
      width: 90,
      renderer: null,
    });
    let res: any = {};
    deviceInsuredFields.map((field) => {
      res[field] = reqData?.policyData?.deviceData[field];
    });
    const table = {
      headers: deviceInsuredFields.map(createTableField),
      datas: [res],
    };
    doc.y = 420;
    doc.table(table, {
      prepareHeader: () =>
        doc
          .moveTo(60, 60)
          .fillColor("black")
          .font("Helvetica-Bold")
          .fontSize(8),
      prepareRow: (row: any, indexColumn: number) => {
        doc.fillColor("black").font("Helvetica").fontSize(8);
      },
    });

    doc
      .fillColor("black")
      .font("Helvetica")
      .text("Telkom Retail DEVICE PLAN", 250, doc.page.height - 100);
    doc
      .fillColor("black")
      .font("Helvetica")
      .text(
        `UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76`,
        190,
        doc.page.height - 90
      );

    doc.end();

    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      let base64Data = pdfData.toString("base64");
      resolve(base64Data);
    });
  });

  return pdfBuffer;
}

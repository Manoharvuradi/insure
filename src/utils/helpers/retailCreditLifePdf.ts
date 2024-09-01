import { capitalizedConvertion, dateConversion } from ".";
import { currencyLabels } from "../constants";

export const retailCreditLifeDevicePdf = async (
  reqData: any,
  packageData: any
) => {
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
    doc
      .font("Helvetica")
      .fontSize(12)
      .text("Telkom Device credit life", 20, 30);
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
            200,
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
          .text(`: ${reqData?.policyholder[field]?.toString()}`, 200, top);
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
            200,
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
      .text("UNDERWRITER/ADMINISTRATOR", 30, 380);

    doc.y = 420;
    const top = 420;
    doc
      .fillColor("black")
      .fontSize(8)
      .font("Helvetica")
      .text("Scheme", 30, top);
    doc.text(": Credit Life", 200, top);
    doc.text("Underwritten By", 30, top + 10);
    doc.text(": Guardrisk Insurance", 200, top + 10);
    doc.text("Administered By", 30, top + 20);
    doc.text(": Agisang Administrators", 200, top + 20);
    doc.text("Phone", 30, top + 30);
    doc.text(": 0119186421", 200, top + 30);
    doc.text("FSP No", 30, top + 40);
    doc.text(": 27327", 200, top + 40);
    doc.text("Fax", 30, top + 50);
    doc.text(": 0866141036", 200, top + 50);
    doc.text("Address", 30, top + 60);
    doc.text(
      ": 17 Power Street, Rembrandt Ridge, Johannesburg 209",
      200,
      top + 60
    );
    doc.text("Email", 30, top + 70);
    doc.text(": allunderwriters@agisanang.net", 200, top + 70);
    doc
      .fillColor(blue)
      .rect(20, 510, doc.page.width - 40, 30)
      .fill();

    doc
      .strokeColor(blue)
      .rect(20, 550, doc.page.width - 40, 50)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("DEVICE", 30, 520);

    doc
      .fillColor("black")
      .fontSize(8)
      .font("Helvetica")
      .text(
        `Device Unique Number: ${
          reqData?.policyData?.deviceCreditLife?.deviceUniqueNumber
            ? reqData?.policyData?.deviceCreditLife?.deviceUniqueNumber
            : ""
        }`,
        30,
        560
      );

    doc
      .font("Helvetica")
      .fillColor("black")
      .text("Telkom DEVICE CREDIT LIFE PLAN", 250, doc.page.height - 100);
    doc
      .fillColor("black")
      .text(
        `UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76`,
        190,
        doc.page.height - 90
      );
    doc.addPage();

    doc
      .fillColor(blue)
      .rect(30, 30, doc.page.width - 60, 30)
      .fill();

    doc
      .strokeColor(blue)
      .rect(30, 70, doc.page.width - 60, 90)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("CREDIT PROTECTION - LIFE ONLY", 40, 40);

    doc.y = 150;

    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(10)
      .text("Sum Insured", doc.page.width / 2, 80);
    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(10)
      .text("Premium", (doc.page.width * 3) / 4, 80);
    doc
      .font("Helvetica")
      .fillColor("black")
      .fontSize(8)
      .text("(a) Standard Cover", 40, 100);
    doc
      .fillColor("black")
      .fontSize(8)
      .text(packageData[0]?.freeCoverBenefitAmount, doc.page.width / 2, 100);
    doc
      .fillColor("black")
      .fontSize(8)
      .text(
        reqData?.policyData?.deviceCreditLife?.freeCoverPremium,
        (doc.page.width * 3) / 4,
        100
      );
    doc
      .font("Helvetica")
      .fillColor("black")
      .fontSize(8)
      .text("(b) Volutary Cover", 40, 120);
    doc
      .fillColor("black")
      .fontSize(8)
      .text(
        reqData?.policyData?.deviceCreditLife?.sumAssured,
        doc.page.width / 2,
        120
      );
    doc
      .fillColor("black")
      .fontSize(8)
      .text(
        reqData?.policyData?.deviceCreditLife?.additionalPremium,
        (doc.page.width * 3) / 4,
        120
      );
    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(8)
      .text("Total", 40, 140);

    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(8)
      .text(
        reqData?.policyData?.deviceCreditLife?.totalPremium,
        (doc.page.width * 3) / 4,
        140
      );

    doc.font("Helvetica").fillColor("black").fontSize(8).text("", 30, 170);

    const benTableField = (field: string): any => ({
      label: field == "SA-ID" ? field : capitalizedConvertion(field),
      property: field,
      width: (doc.page.width - 60) / 6,
      renderer: null,
    });
    const NO_DATA_ROW = { noData: true };

    const beneficiariesDetails = [
      "Beneficiary Details",
      "SA-ID",
      "relation",
      "dateOfBirth",
      "percentage",
      "phone",
    ];

    const benTable = {
      title: "BENEFICIARY",
      headers: beneficiariesDetails.map(benTableField),
      datas:
        reqData?.beneficiaries && reqData?.beneficiaries?.length > 0
          ? reqData?.beneficiaries?.map((ben: any) => {
              let filteredData: any = {};
              beneficiariesDetails.forEach((detail) => {
                filteredData[detail] =
                  detail == "dateOfBirth"
                    ? ben[detail]
                      ? dateConversion(ben[detail])
                      : ""
                    : detail == "SA-ID"
                    ? ben.identification.said
                    : detail == "Beneficiary Details"
                    ? ben.firstName + " " + ben.lastName
                    : ben[detail]?.toString().replace(/_/g, "");
              });
              return filteredData;
            })
          : [NO_DATA_ROW],
    };
    doc
      .strokeColor(blue)
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke();

    doc.table(benTable, {
      prepareHeader: () =>
        doc
          .moveTo(60, 60)
          .fillColor("black")
          .font("Helvetica-Bold")
          .fontSize(8),
      prepareRow: (row: any, indexColumn: number) => {
        if (row === NO_DATA_ROW && indexColumn === 1) {
          const tableWidth = doc.page.width - 200;
          doc
            .text("No Beneficiary included", 100, doc.y, {
              width: tableWidth,
              align: "center",
            })
            .fillColor("black")
            .font("Helvetica")
            .fontSize(8);
          return;
        }
        doc.fillColor("black").font("Helvetica").fontSize(8);
      },
    });

    const policyCoverTable = {
      title: "Policy Cover",
      headers: ["Item", "Details"],
      rows: [
        ["1 Death", "Sum Insured"],
        ["2 Disability Cover", "12 months instalments"],
        ["3 Retrenchment Cover", "6 months instalments"],
        ["4 Pandemic Cover", "12 months instalments"],
        ["5 Dreaded Disease", "Sum Insured"],
      ],
    };
    doc.table(policyCoverTable, {
      columnsSize: [200, 100, 100],
    });

    doc
      .font("Helvetica")
      .fillColor("red")
      .fontSize(8)
      .text(
        "Note:In the event of my death I nominate the following person(s) to receive the proceeds of any benefit payable in terms of this policy."
      );

    doc
      .fillColor("black")
      .font("Helvetica")
      .text("Telkom DEVICE CREDIT PLAN", 250, doc.page.height - 100);
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
};

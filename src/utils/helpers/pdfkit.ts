import { capitalizedConvertion, dateConversion } from ".";
import { currencyLabels } from "../constants";

export async function pdfKit(reqData: any) {
  const PDFDocument = require("pdfkit-table");
  const blue = "#008FE0";
  const personalDetails: any[] = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "streetAddress1",
    "phone",
    "email",
    "city",
    "areaCode",
  ];
  const neccessaryFields = [
    "policyNumber",
    "basePremium",
    "additionalPremium",
    "freeBenefitPremium",
    "monthlyPremium",
  ];

  const pdfBuffer = await new Promise<string>((resolve) => {
    const doc = new PDFDocument();

    const stillBornPremiumAmounts: any = {
      "40000": "5000",
      "50000": "6250",
      "60000": "7500",
      "80000": "8750",
      "100000": "8750",
      "30000": "3750",
    };
    const stillborn: any = {
      firstName: "-",
      lastName: "-",
      age: "-",
      naturalDeathAmount: "",
      accidentalDeathAmount: "",
    };

    doc.fillColor(blue).rect(0, 0, doc.page.width, 50).fill();
    doc
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .fontSize(16)
      .text("Insured", 20, 10);
    doc.font("Helvetica").fontSize(12).text("Telkom Funeral Plan", 20, 30);
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
    doc.font("Helvetica-Bold").text("Part A ", 20, 130);
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
          .text(capitalizedConvertion(field), 30, top);
        doc
          .fillColor("black")
          .fontSize(8)
          .text(
            `: ${reqData?.policyholder[field]?.toString() ?? "-"}`,
            200,
            top
          );
      }
    });

    neccessaryFields?.map((field: any, index: number = 1) => {
      let top = 310 + index * 10;

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
      .rect(20, 410, doc.page.width - 40, 160)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("MAIN INSURED", 30, 380);

    const mainInsuredFields = [
      "firstName",
      "dateOfBirth",
      "startDate",
      "said",
      "accidentalDeathAmount",
      "naturalDeathAmount",
    ];

    const amountFields = ["accidentalDeathAmount", "naturalDeathAmount"];

    const specialFields = ["firstName", "dateOfBirth", "startDate"];
    const createTableField = (field: string): any => ({
      label: field == "said" ? "SAID" : capitalizedConvertion(field),
      property: field,
      width: specialFields.includes(field)
        ? 95
        : amountFields.includes(field)
        ? (doc.page.width - 60 * 6) / 3
        : 95,
      // width: 100,

      renderer: null,
    });
    let res: any = {};
    mainInsuredFields.map((field) => {
      if (field === "startDate") {
        res[field] = dateConversion(reqData?.startDate);
      } else if (field === "dateOfBirth") {
        res[field] = dateConversion(
          reqData?.policyData?.members?.mainMember.dateOfBirth
        );
      } else if (amountFields.includes(field)) {
        res[field] = `R ${reqData?.policyData?.members?.mainMember[field]}`;
      } else {
        res[field] = reqData?.policyData?.members?.mainMember[field];
      }
    });
    const table = {
      headers: mainInsuredFields.map(createTableField),
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
      .font("Helvetica-Bold")
      .fillColor("black")
      .text("Monthly total Premium:", doc.page.width / 2, 540);
    const total = (reqData?.totalPremium).toFixed(2);
    doc
      .fillColor("black")
      .text(` R ${total}`, 360 + (100 - doc.widthOfString(total)), 540);
    doc
      .font("Helvetica")
      .fillColor("black")
      .text("Telkom FUNERAL PLAN", 250, doc.page.height - 100);
    doc
      .fillColor("black")
      .text(
        `UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76`,
        190,
        doc.page.height - 90
      );
    doc.addPage();

    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("BENEFICIARY", 30, 40);
    const benTableField = (field: string): any => ({
      label: capitalizedConvertion(field),
      property: field,
      width: (doc.page.width - 60) / 5,
      renderer: null,
    });
    const NO_DATA_ROW = { noData: true };

    const beneficiariesDetails = [
      "firstName",
      "lastName",
      "relation",
      "dateOfBirth",
      "percentage",
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
                    ? dateConversion(ben[detail])
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
    const mainMemberfamilyDetails = [
      "firstName",
      "lastName",
      "age",
      "naturalDeathAmount",
      "accidentalDeathAmount",
    ];

    const familyAmountFields = ["accidentalDeathAmount", "naturalDeathAmount"];
    const familyTableFields = (field: string): any => ({
      label: capitalizedConvertion(field),
      property: field,
      width: specialFields.includes(field)
        ? 120
        : familyAmountFields.includes(field)
        ? (doc.page.width - 60 * 4) / 4
        : 120,
      renderer: null,
    });
    const spouseTable = {
      title: "SPOUSE",
      headers: mainMemberfamilyDetails.map(familyTableFields),
      datas:
        reqData?.policyData?.members?.spouse &&
        reqData?.policyData?.members?.spouse.length > 0
          ? reqData?.policyData?.members?.spouse.map((spouse: any) => {
              let filteredData: any = {};
              mainMemberfamilyDetails.forEach((detail) => {
                filteredData[detail] =
                  detail == "dateOfBirth"
                    ? dateConversion(spouse[detail])
                    : spouse[detail];
              });
              return filteredData;
            })
          : [NO_DATA_ROW],
    };

    doc.table(spouseTable, {
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
            .text("No Spouse  included", 100, doc.y, {
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

    const childrenTable = {
      title: "CHILDREN",
      headers: mainMemberfamilyDetails.map(familyTableFields),
      datas:
        reqData?.policyData?.members?.children &&
        reqData?.policyData?.members?.children.length > 0
          ? reqData?.policyData?.members?.children.map((child: any) => {
              let filteredData: any = {};
              mainMemberfamilyDetails.forEach((detail) => {
                filteredData[detail] =
                  detail == "dateOfBirth"
                    ? dateConversion(child[detail])
                    : child[detail];
              });
              return filteredData;
            })
          : [NO_DATA_ROW],
    };

    doc.table(childrenTable, {
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
            .text("No Children included", 100, doc.y, {
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

    const stillBornTable = {
      title: "STILL BORN",
      headers: mainMemberfamilyDetails.map(familyTableFields),
      datas: [
        {
          firstName: "",
          lastName: "",
          age: "",
          accidentalDeathAmount:
            stillBornPremiumAmounts[
              reqData?.policyData?.members?.mainMember?.accidentalDeathAmount
            ],
          naturalDeathAmount:
            stillBornPremiumAmounts[
              reqData?.policyData?.members?.mainMember?.naturalDeathAmount
            ],
        },
      ],
    };
    doc.table(stillBornTable, {
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

    const extendedTable = {
      title: "EXTENDED FAMILY",
      headers: mainMemberfamilyDetails.map(familyTableFields),
      datas:
        reqData?.policyData?.members?.extendedFamily &&
        reqData?.policyData?.members?.extendedFamily.length > 0
          ? reqData?.policyData?.members?.extendedFamily.map((ex: any) => {
              let filteredData: any = {};
              mainMemberfamilyDetails.forEach((detail) => {
                filteredData[detail] =
                  detail == "dateOfBirth"
                    ? dateConversion(ex[detail])
                    : ex[detail];
              });
              return filteredData;
            })
          : [NO_DATA_ROW],
    };

    doc.table(extendedTable, {
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
            .text("No Extended family included", 100, doc.y, {
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

    doc
      .fillColor("black")
      .font("Helvetica")
      .text("Telkom FUNERAL PLAN", 250, doc.page.height - 100);
    doc
      .fillColor("black")
      .font("Helvetica")
      .text(
        `UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76`,
        190,
        doc.page.height - 90
      );
    doc.addPage();
    doc
      .strokeColor(blue)
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .stroke();

    doc
      .fillColor(blue)
      .rect(30, 40, doc.page.width - 60, 30)
      .fill();
    doc
      .strokeColor(blue)
      .rect(30, 80, doc.page.width - 60, 160)
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fillColor("white")
      .fontSize(12)
      .text("SCHEDULE OF BENEFITS", 40, 50);

    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(10)
      .text(
        "The following structured benefits are applicable under this Funeral Plan:",
        40,
        110
      );
    doc
      .font("Helvetica-Bold")
      .fillColor("black")
      .fontSize(10)
      .text("Underwritten Benefits", 40, 130, { underline: true });
    doc
      .font("Helvetica")
      .fillColor("black")
      .fontSize(10)
      .text(
        "Total cash funeral benefit to the total of the cover amount",
        40,
        150
      );
    doc
      .font("Helvetica")
      .fillColor("black")
      .fontSize(10)
      .text("Repatriation of Mortal Remains Benefit", 40, 170);

    doc
      .fillColor("black")
      .fontSize(8)
      .font("Helvetica")
      .text("Telkom FUNERAL PLAN", 250, doc.page.height - 100);
    doc
      .fillColor("black")
      .fontSize(8)
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

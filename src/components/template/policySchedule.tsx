import { capitalizedConvertion, dateConversion } from "~/utils/helpers";
import React from "react";
import { GuardRiskManagementFee } from "~/utils/constants";

const PolicySchedule = (policy: any) => {
  const neccessaryFields = [
    "policyNumber",
    "basePremium",
    "freeBenefitPremium",
    "monthlyPremium",
  ];
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
  const mainInsuredFields = [
    "firstName",
    "dateOfBirth",
    "startDate",
    "said",
    "premiumAmount",
    "accidentalDeathAmount",
    "naturalDeathAmount",
  ];
  const mainMemberfamilyDetails = [
    "firstName",
    "lastName",
    "age",
    "premiumAmount",
    "naturalDeathAmount",
    "accidentalDeathAmount",
  ];
  const extendedFamilyDetails = [
    "firstName",
    "lastName",
    "age",
    "relation",
    "premiumAmount",
    "naturalDeathAmount",
    "accidentalDeathAmount",
  ];
  const beneficiariesDetails = [
    "firstName",
    "relation",
    "dateOfBirth",
    "percentage",
  ];

  return (
    <div
      style={{
        letterSpacing: 0.3,
        fontFamily: "Arial",
        maxWidth: "570px",
        minWidth: "570px",
        margin: "10px",
      }}
    >
      <div
        style={{
          height: "770px",
          maxWidth: "570px",
          minWidth: "570px",
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              backgroundColor: "#008FE0",
              maxHeight: "100px",
              padding: "8px",
              marginBottom: "3px",
            }}
          >
            <div>
              <div style={{}}>
                <p
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Insured
                </p>
              </div>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  color: "#FFFFFF",
                  fontSize: "8px",
                  fontWeight: "bold",
                }}
              >
                Telkom Funeral Plan
              </p>
            </div>
          </div>
        </div>
        <div style={{ padding: "4px 0" }}>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              display: "inline-block",
              width: "35%",
              maxHeight: "90px",
              verticalAlign: "top",
              padding: "5px ",
              borderRight: "1.5px solid #008FE0",
            }}
          >
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              Company Reg no :
              <span
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                1991/005476/30
              </span>
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              FSP no :
              <span
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                46037
              </span>
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              VAT Reg no :
              <span
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                4680101146
              </span>
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              Claims Reg no :
              <span
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                0800 229 900
              </span>
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              Amendments :
              <span
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                0800 229 900
              </span>
            </p>
            <p
              style={{
                fontFamily: "Arial",
                fontSize: "7px",
                color: "#008FE0",
              }}
            >
              Email address :
              <span
                style={{
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "black",
                  marginLeft: "3px",
                }}
              >
                insure@telkominsurance.co.za
              </span>
            </p>
          </div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              display: "inline-block",
              width: "25%",
              maxHeight: "90px",
              verticalAlign: "top",
              padding: "5px",
              textAlign: "start",
              borderRight: "1.5px solid #008FE0",
            }}
          >
            <div style={{}}>
              <h6
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "#008FE0",
                }}
              >
                Postal address
              </h6>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Telkom Park
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                The Hub
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                61 Oak Avenue
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Highveld
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Centurion 0157
              </p>
            </div>
          </div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              display: "inline-block",
              width: "30%",
              maxHeight: "75px",
              verticalAlign: "top",
              padding: "5px",
              textAlign: "start",
            }}
          >
            <div>
              <h6
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                  color: "#008FE0",
                }}
              >
                Physical address
              </h6>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Telkom Park
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                The Hub
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                61 Oak Avenue
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Highveld
              </p>
              <p
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  fontSize: "7px",
                }}
              >
                Centurion 0157
              </p>
            </div>
          </div>
        </div>
        <div
          style={{ letterSpacing: 0.3, fontFamily: "Arial", padding: "4px" }}
        >
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              fontWeight: "bold",
              fontSize: "7px",
              padding: "4px 0 0 4px",
            }}
          >
            PART A
          </div>
          <p
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              fontSize: "7px",
              paddingLeft: " 4px",
            }}
          >
            Part A is all about you and your personal insurance details. It is
            about the cover you have taken out, how much you pay in premium and
            what you and your dependents are covered for.
          </p>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              marginTop: "10px",
              maxWidth: "570px",
              minWidth: "570px",
            }}
          >
            <h2
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                marginBottom: "2px",
                backgroundColor: "#008FE0",

                color: "#FFFFFF",
                paddingLeft: "5px",
                paddingBottom: "12px",
                fontSize: "10px",
                fontWeight: "bold",
                width: "98.5%",
              }}
            >
              POLICYHOLDER DETAILS
            </h2>
          </div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              minHeight: "170px",
              border: "1px solid #008FE0",
              marginTop: "10px",
              paddingLeft: "8px",
            }}
          >
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontWeight: "bold",
                fontSize: "8px",
              }}
            >
              Personal Details
            </p>
            <table
              style={{ letterSpacing: 0.3, fontFamily: "Arial", width: "98%" }}
            >
              <tbody>
                {personalDetails?.map((field: any, index: number) =>
                  field === "dateOfBirth" ? (
                    <tr key={index}>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontWeight: "600",
                          fontSize: "7px",
                          paddingRight: "4px",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                        }}
                      >
                        :<span style={{ marginLeft: "3px" }} />
                        {dateConversion(
                          policy?.policyholder[field]?.toString()
                        )}
                      </td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontWeight: "600",
                          fontSize: "7px",
                          paddingRight: "4px",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                        }}
                      >
                        :<span style={{ marginLeft: "3px" }} />
                        {policy?.policyholder[field]}
                      </td>
                    </tr>
                  )
                )}
                {neccessaryFields.map((field: any, index: number) =>
                  field === "createdAt" ||
                  field === "updatedAt" ||
                  field === "dateOfBirth" ||
                  field === "endDate" ||
                  field === "claimDate" ||
                  field === "startDate" ? (
                    <tr key={index} className="">
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          paddingRight: "4px",
                          fontWeight: "600",
                          fontSize: "7px",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                        }}
                      >
                        :<span style={{ marginLeft: "3px" }} />
                        {dateConversion(policy[field]?.toString())}
                      </td>
                    </tr>
                  ) : field === "monthlyPremium" ? (
                    <tr key={index} className="">
                      <td
                        style={{
                          fontWeight: "600",
                          fontSize: "7px",
                          paddingRight: "4px",
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                        }}
                      >
                        :<span style={{ marginLeft: "3px" }} />
                        {(
                          policy.totalPremium +
                          (policy.totalPremium * GuardRiskManagementFee) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ) : (
                    <tr key={index} className="">
                      <td
                        style={{
                          fontWeight: "600",
                          fontSize: "7px",
                          paddingRight: "4px",
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                        }}
                      >
                        :<span style={{ marginLeft: "3px" }} />
                        {policy[field]?.toString().replace(/_/g, "")}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
        {policy?.policyData?.members?.mainMember && (
          <div style={{ marginTop: "10px", padding: "8px" }}>
            <div>
              <div
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  marginBottom: "2px",
                  backgroundColor: "#008FE0",

                  color: "#FFFFFF",
                  paddingLeft: "5px",
                  paddingBottom: "12px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                MAIN INSURED
              </div>
            </div>
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                border: "1px solid #008FE0",
                marginTop: "10px",
                padding: "5px",
                position: "relative",
                height: "150px",
              }}
            >
              <table
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  width: "100%",
                  left: "0",
                }}
              >
                <thead
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <tr>
                    {mainInsuredFields.map((field: any, index: any) => (
                      <th
                        key={index}
                        style={{
                          fontWeight: "bold",
                          fontSize: "7px",
                          paddingRight: "4px",
                          left: "0",
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                        }}
                      >
                        {field == "said"
                          ? "SAID"
                          : capitalizedConvertion(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {mainInsuredFields.map((field: any, index: number) => (
                      <>
                        {}
                        <td
                          key={index}
                          style={{
                            letterSpacing: 0.3,
                            fontFamily: "Arial",
                            fontSize: "7px",
                            left: "0",
                          }}
                        >
                          {field == "dateOfBirth"
                            ? dateConversion(
                                policy?.policyData?.members?.mainMember[field]
                              )
                            : field == "startDate"
                            ? dateConversion(policy?.startDate)
                            : policy?.policyData?.members?.mainMember[field]
                                ?.toString()
                                .replace(/_/g, "")}
                        </td>
                      </>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div
                style={{
                  position: "absolute",
                  left: "70%",
                }}
              >
                <table style={{ marginTop: "50px" }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          paddingRight: "4px",
                        }}
                      >
                        Monthly Premium (excl.VAT):
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          textAlign: "right",
                        }}
                      >
                        {policy.totalPremium.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          paddingRight: "2px",
                        }}
                      >
                        VAT included:
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          textAlign: "end",
                        }}
                      >
                        {(
                          (policy.totalPremium * GuardRiskManagementFee) /
                          100
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          paddingRight: "4px",
                        }}
                      >
                        Total Premium:
                      </td>
                      <td
                        style={{
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                          fontSize: "7px",
                          textAlign: "right",
                        }}
                      >
                        {(
                          policy.totalPremium +
                          (policy.totalPremium * GuardRiskManagementFee) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}{" "}
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
          letterSpacing: 0.3,
          fontFamily: "Arial",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            fontWeight: "bold",
            marginRight: "2px",
          }}
        >
          Telkom
        </span>
        <span
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            fontSize: "6px",
            marginLeft: "2px",
            marginBottom: 0,
          }}
        >
          FUNERAL PLAN
          <br />
          UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76
        </span>
      </div>
      <div
        style={{
          height: "770px",
          maxWidth: "570px",
          minWidth: "570px",
          position: "relative",
        }}
      >
        {policy?.beneficiaries && (
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              maxHeight: "75px",
            }}
          >
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                marginTop: "20px",
                padding: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    marginBottom: "2px",
                    backgroundColor: "#008FE0",

                    color: "#FFFFFF",
                    paddingLeft: "5px",
                    paddingBottom: "12px",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  BENEFICIARY
                </div>
              </div>
              <div
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  border: "1px solid #008FE0",
                  marginTop: "10px",
                  padding: "5px",
                }}
              >
                <table
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    textAlign: "start",
                    width: "100%",
                    textAlignLast: "start",
                  }}
                >
                  <thead
                    style={{
                      letterSpacing: 0.3,
                      fontFamily: "Arial",
                      textAlign: "left",
                      width: "100%",
                      left: "0",
                    }}
                  >
                    <tr>
                      {beneficiariesDetails.map((field: any, index: any) => (
                        <th
                          key={index}
                          style={{
                            letterSpacing: 0.3,
                            fontFamily: "Arial",
                            fontWeight: "bold",
                            fontSize: "7px",
                            paddingRight: "4px",
                            left: "0",
                            marginRight: "10px",
                          }}
                        >
                          {capitalizedConvertion(field)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {policy?.beneficiaries.map(
                      (beneficiary: any, index: any) => (
                        <tr key={index}>
                          {beneficiariesDetails.map(
                            (field: any, index: number) =>
                              field === "dateOfBirth" ? (
                                <td
                                  key={index}
                                  style={{
                                    letterSpacing: 0.3,
                                    fontFamily: "Arial",
                                    left: "0",
                                    fontSize: "7px",
                                    marginRight: "10px",
                                  }}
                                >
                                  {dateConversion(beneficiary[field])}
                                </td>
                              ) : (
                                <td
                                  key={index}
                                  style={{
                                    letterSpacing: 0.3,
                                    fontFamily: "Arial",
                                    fontSize: "7px",
                                    marginRight: "10px",
                                  }}
                                >
                                  {beneficiary[field]
                                    ?.toString()
                                    .replace(/_/g, "")}
                                </td>
                              )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            maxHeight: "200px",
            marginTop: "10px",
          }}
        >
          <div
            style={{ letterSpacing: 0.3, fontFamily: "Arial", padding: "8px" }}
          >
            <div>
              <div
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  marginBottom: "2px",
                  backgroundColor: "#008FE0",

                  color: "#FFFFFF",
                  paddingLeft: "5px",
                  paddingBottom: "12px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                SPOUSE
              </div>
            </div>
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                border: "1px solid #008FE0",
                marginTop: "10px",
                padding: "5px",
              }}
            >
              <table
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  width: "100%",
                  left: "0",
                }}
              >
                <thead
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <tr>
                    {mainMemberfamilyDetails.map((field: any, index: any) => (
                      <th
                        key={index}
                        style={{
                          fontWeight: "bold",
                          fontSize: "7px",
                          paddingRight: "4px",
                          left: "0",
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policy?.policyData?.members?.spouse ? (
                    policy?.policyData?.members?.spouse.map(
                      (child: any, index: any) => (
                        <tr key={index}>
                          {mainMemberfamilyDetails.map(
                            (field: any, index: number) => (
                              <td
                                key={index}
                                style={{
                                  letterSpacing: 0.3,
                                  fontFamily: "Arial",
                                  fontSize: "7px",
                                  left: "0",
                                }}
                              >
                                {child[field]?.toString().replace(/_/g, "")}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )
                  ) : (
                    <td
                      style={{
                        letterSpacing: 0.3,
                        fontFamily: "Arial",
                        fontSize: "7px",
                      }}
                    >
                      No spouse included
                    </td>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            maxHeight: "200px",
          }}
        >
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              marginTop: "10px",
              padding: "8px",
            }}
          >
            <div>
              <div
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  marginBottom: "2px",
                  backgroundColor: "#008FE0",

                  color: "#FFFFFF",
                  paddingLeft: "5px",
                  paddingBottom: "12px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                CHILDREN
              </div>
            </div>
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                border: "1px solid #008FE0",
                marginTop: "10px",
                padding: "5px",
              }}
            >
              <table
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  textAlign: "start",
                  width: "100%",
                  textAlignLast: "start",
                }}
              >
                <thead
                  style={{
                    letterSpacing: 0.3,
                    fontFamily: "Arial",
                    textAlign: "left",

                    width: "100%",
                  }}
                >
                  <tr>
                    {mainMemberfamilyDetails.map((field: any, index: any) => (
                      <th
                        key={index}
                        style={{
                          fontWeight: "bold",
                          fontSize: "7px",
                          paddingRight: "4px",
                          left: "0",
                          letterSpacing: 0.3,
                          fontFamily: "Arial",
                        }}
                      >
                        {capitalizedConvertion(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {policy?.policyData?.members?.children ? (
                    policy?.policyData?.members?.children.map(
                      (child: any, index: any) => (
                        <tr key={index}>
                          {mainMemberfamilyDetails.map(
                            (field: any, index: number) => (
                              <td
                                key={index}
                                style={{
                                  letterSpacing: 0.3,
                                  fontFamily: "Arial",
                                  fontSize: "7px",
                                  left: "0",
                                }}
                              >
                                {child[field]?.toString().replace(/_/g, "")}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )
                  ) : (
                    <td
                      style={{
                        letterSpacing: 0.3,
                        fontFamily: "Arial",
                        fontSize: "7px",
                      }}
                    >
                      No children included
                    </td>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            marginTop: "4px",
            padding: "8px",
          }}
        >
          <div>
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                marginBottom: "2px",
                backgroundColor: "#008FE0",

                color: "#FFFFFF",
                paddingLeft: "5px",
                paddingBottom: "12px",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              EXTENDED FAMILY
            </div>
          </div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              border: "1px solid #008FE0",
              marginTop: "10px",
              padding: "5px",
            }}
          >
            <table
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                textAlign: "start",
                width: "100%",
                textAlignLast: "start",
              }}
            >
              <thead
                style={{
                  letterSpacing: 0.3,
                  fontFamily: "Arial",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <tr>
                  {extendedFamilyDetails.map((field: any, index: any) => (
                    <th
                      key={index}
                      style={{
                        letterSpacing: 0.3,
                        fontFamily: "Arial",
                        fontWeight: "bold",
                        fontSize: "7px",
                        left: "0",

                        paddingRight: "4px",
                      }}
                    >
                      {capitalizedConvertion(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {policy?.policyData?.members?.includeExtendedFamily ? (
                  policy?.policyData?.members?.includeExtendedFamily.map(
                    (extendedFamily: any, index: any) => (
                      <tr key={index}>
                        {extendedFamilyDetails.map(
                          (field: any, index: number) => (
                            <td
                              key={index}
                              style={{
                                letterSpacing: 0.3,
                                fontFamily: "Arial",
                                fontSize: "7px",
                                left: "0",
                              }}
                            >
                              {extendedFamily[field]
                                ?.toString()
                                .replace(/_/g, "")}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )
                ) : (
                  <td
                    style={{
                      letterSpacing: 0.3,
                      fontFamily: "Arial",
                      fontSize: "7px",
                    }}
                  >
                    No Extended Family included
                  </td>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
          letterSpacing: 0.3,
          fontFamily: "Arial",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            fontWeight: "bold",
            marginRight: "2px",
          }}
        >
          Telkom
        </span>
        <span
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            fontSize: "6px",
            marginLeft: "2px",
          }}
        >
          FUNERAL PLAN
          <br />
          UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76
        </span>
      </div>
      <div
        style={{
          height: "770px",
          maxWidth: "570px",
          minWidth: "570px",
          position: "relative",
          marginTop: "10px",
        }}
      >
        {" "}
        <div
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            marginTop: "20px",
            padding: "8px",
          }}
        >
          <div>
            <div
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                marginBottom: "2px",
                backgroundColor: "#008FE0",

                color: "#FFFFFF",
                paddingLeft: "5px",
                paddingBottom: "12px",
                fontSize: "10px",
                fontWeight: "bold",
              }}
            >
              SCHEDULE OF BENEFITS
            </div>
          </div>
          <div
            style={{
              letterSpacing: 0.3,
              fontFamily: "Arial",
              border: "1px solid #008FE0",
              marginTop: "10px",
              padding: "5px",
            }}
          >
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontWeight: "bold",
                fontSize: "7px",
                marginBottom: "5px",
              }}
            >
              Main Member and/or Spouse and/or Children and/or Extended Family
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontWeight: "bold",
                fontSize: "7px",
                marginBottom: "5px",
              }}
            >
              The following structured benefits are applicable under this
              Funeral Plan:
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontWeight: "bold",
                fontSize: "7px",
                marginBottom: "5px",
                textDecoration: "underline",
              }}
            >
              Underwritten Benefits
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                marginBottom: "5px",
              }}
            >
              Total cash funeral benefit to the total of the cover amount
            </p>
            <p
              style={{
                letterSpacing: 0.3,
                fontFamily: "Arial",
                fontSize: "7px",
                marginBottom: "5px",
              }}
            >
              Repatriation of Mortal Remains Benefit
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginBottom: "10px",
          letterSpacing: 0.3,
          fontFamily: "Arial",
        }}
      >
        <span
          style={{
            fontSize: "8px",
            fontWeight: "bold",
            marginRight: "2px",
          }}
        >
          Telkom
        </span>
        <span
          style={{
            letterSpacing: 0.3,
            fontFamily: "Arial",
            fontSize: "6px",
            marginLeft: "2px",
          }}
        >
          FUNERAL PLAN
          <br />
          UNDERWRITTEN BY GUARDRISK LIFE LIMITED-FSP NO 76
        </span>
      </div>
    </div>
  );
};

export default PolicySchedule;

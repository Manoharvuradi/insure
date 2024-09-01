import React from "react";
import { IMember } from "~/interfaces/policy";
import ShowKeyValue from "./showKeyValue";
import { capitalizedConvertion, dateConversion } from "~/utils/helpers";
import { calculateAgeBasedOnSaid } from "~/utils/constants";
interface IMemberCardProps {
  member: IMember;
}

export default function memberCard({ member }: IMemberCardProps) {
  return (
    <div>
      <div className="grid grid-cols-2">
        {member.coverageOption && (
          <ShowKeyValue
            name={"Coverage option"}
            value={"Option " + member.coverageOption}
          />
        )}
        {member.said && <ShowKeyValue name={"SA ID"} value={member.said} />}
        {member.firstName && member.lastName && (
          <>
            <ShowKeyValue name={"First Name"} value={member.firstName} />
            <ShowKeyValue name={"Last Name"} value={member.lastName} />
          </>
        )}
        {member?.email && <ShowKeyValue name={"Email"} value={member?.email} />}
        {(member?.age || member?.age == 0) && (
          <ShowKeyValue name={"Age"} value={member?.age} />
        )}
        {member?.isStillBorn == true && (
          <ShowKeyValue name={"Stillborn"} value="true" />
        )}
        {member?.isStudying == true && (
          <ShowKeyValue name={"Studying"} value="true" />
        )}
        {member?.isDisabled == true && (
          <ShowKeyValue name={"Disabled"} value="true" />
        )}

        {member?.relation && (
          <ShowKeyValue name={"Relation"} value={member?.relation} />
        )}
        {member?.naturalDeathAmount && (
          <ShowKeyValue
            name={"Natural Death Amount"}
            value={"R " + member?.naturalDeathAmount}
          />
        )}
        {member?.accidentalDeathAmount && (
          <ShowKeyValue
            name={"Accidental Death Amount"}
            value={"R " + member?.accidentalDeathAmount}
          />
        )}
        {member?.telkomFreeBenefitAmount && (
          <ShowKeyValue
            name={"Telkom Free Benefit Amount"}
            value={"R " + member?.telkomFreeBenefitAmount}
          />
        )}
        {member?.createdAt && (
          <ShowKeyValue
            name={"Created At"}
            value={dateConversion(member.createdAt)}
          />
        )}
        {member?.updatedAt && (
          <ShowKeyValue
            name={"Updated At"}
            value={dateConversion(member.updatedAt)}
          />
        )}
      </div>
    </div>
  );
}

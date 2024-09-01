export const maxDaysForUnattendedLeads = 3;

export const getLeadsString = (leadsArray: any) => {
  return ` 
    <h3>Total Leads in Draft: ${leadsArray.length}</h3>
    <table border="">
      <thead>
        <tr>
          <th>Agent Name</th>
          <th>Lead Number</th>
        </tr>
      </thead>
      <tbody>
        ${leadsArray
          .map(
            (lead: any) =>
              `<tr><td style="padding: 5px">${
                lead?.createdBy?.firstName + " " + lead?.createdBy?.lastName
              }</td><td style="padding: 5px">${lead.leadNumber}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>`;
};

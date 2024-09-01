import { Menu } from "@headlessui/react";
import { ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { useSession } from "next-auth/react";
import React from "react";
import { menuItems } from "~/utils/constants";
import { roleValues } from "~/utils/constants/user";
import { classNames } from "~/utils/helpers";
import MenuItem from "../buttons/menuItem";
import { UserRole } from "@prisma/client";

export interface IButtonProps {
  isVisible?: boolean;
  onlyAddNotes?: boolean;
  onClick?: () => void;
  showAddNotes?: boolean;
  showIssuePolicy?: boolean;
  showRejectApplication?: boolean;
  onClickRejectApplication?: () => void;
  showCancelPolicy?: boolean;
  onClickCancelPolicy?: () => void;
  onClickIssuePolicy?: () => void;
  showIsArchive?: boolean;
  onClickIsArchived?: () => void;

  showIsArchiveInClaim?: boolean;
  onClickIsArchivedInClaim?: () => void;

  showIsArchiveInComplaint?: boolean;
  onClickIsArchivedInComplaint?: () => void;

  showPolicySchedule?: boolean;
  onClickPolicySchedule?: () => void;

  alterPolicy?: boolean;
  onClickAlterPolicy?: () => void;

  showReinstatePolicy?: boolean;
  onClickReinstatePolicy?: () => void;

  alterApplication?: boolean;
  onClickAlterApplication?: () => void;

  displayAlterComplaints?: boolean;
  onClickAlterComplaints?: () => void;

  displayClosedComplaints?: boolean;
  onClickClosedComplaints?: () => void;

  displayClosedClaim?: boolean;
  onClickClosedClaim?: () => void;

  displaySendToReview?: boolean;
  onClickSendToReview?: () => void;

  displaySendToApplication?: boolean;
  onClickSendToApplication?: () => void;

  displayApprove?: boolean;
  onClickApprove?: () => void;

  displayRepudiate?: boolean;
  onClickRepudiate?: () => void;

  displayPayoutProcessed?: boolean;
  onClickPayoutProcessed?: () => void;

  displayPayoutBlocked?: boolean;
  onClickPayoutBlocked?: () => void;

  showCreateClaim?: boolean;
  onClickCreateClaim?: () => void;

  showRejectClaim?: boolean;
  onClickRejectClaim?: () => void;

  showApplicationOnHold?: boolean;
  onClickApplicationOnHold?: () => void;

  showClaimOnHold?: boolean;
  onClickClaimOnHold?: () => void;

  alterLead?: boolean;
  onClickAlterLead?: () => void;

  displayRefuse?: boolean;
  onClickRefuseLead?: () => void;

  resubmitLead?: boolean;

  showRenewalePolicy?: boolean;
  onClickRenewalePolicy?: () => void;

  showCreateProspect?: boolean;
  onClickCreateProspect?: () => void;

  showCallScheduled?: boolean;
  onClickCallScheduled?: () => void;

  showInterested?: boolean;
  onClickInterested?: () => void;

  showNotInterested?: boolean;
  onClickNotInterested?: () => void;

  showExpired?: boolean;
  onClickExpired?: () => void;
}

const ActionButtons = (props: IButtonProps) => {
  const session = useSession();
  return (
    <div className="space-x-3">
      {props.isVisible == true && (
        <Menu as="div" className=" relative inline-block text-left">
          <div>
            <Menu.Button className="flex h-8 items-center justify-center gap-2 rounded-md bg-primary-blue px-2.5 text-sm text-white transition duration-300 hover:bg-hover-blue">
              Action
              <ChevronDownIcon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Menu.Items className="absolute right-0 z-10 mt-2 w-44 min-w-max origin-top-right rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div>
              {props.onlyAddNotes ? (
                <Menu.Item>
                  {({ active }) => (
                    <div className="flex w-full cursor-pointer items-center justify-start gap-3 px-6 py-3 hover:bg-[#F0F9FF]">
                      <PencilSquareIcon className="h-5 w-5" />
                      <button
                        className={classNames(
                          active
                            ? "text-gray-700"
                            : "text-black group-hover:text-white",
                          "flex justify-start  hover:text-primary-blue "
                        )}
                        onClick={props.onClick}
                      >
                        Add notes
                      </button>
                    </div>
                  )}
                </Menu.Item>
              ) : (
                <>
                  {props.showAddNotes && (
                    <MenuItem name="Add Notes" handleClick={props.onClick} />
                  )}

                  {props.displayClosedClaim && (
                    <MenuItem
                      name="Close Claim"
                      handleClick={props.onClickClosedClaim}
                    />
                  )}

                  {props.displayAlterComplaints && (
                    <MenuItem
                      name="Alter Complaint"
                      handleClick={props.onClickAlterComplaints}
                    />
                  )}
                  {props.displayClosedComplaints && (
                    <MenuItem
                      name="Close Complaint"
                      handleClick={props.onClickClosedComplaints}
                    />
                  )}

                  {props.showPolicySchedule && (
                    <MenuItem
                      name="Policy Schedule"
                      handleClick={props.onClickPolicySchedule}
                    />
                  )}
                  {props.showCancelPolicy && (
                    <MenuItem
                      name="Cancel Policy"
                      handleClick={props.onClickCancelPolicy}
                    />
                  )}
                  {props.showReinstatePolicy && (
                    <MenuItem
                      name="Re-initiate Policy"
                      handleClick={props.onClickReinstatePolicy}
                    />
                  )}
                  {props.showRejectApplication && (
                    <MenuItem
                      name="Reject"
                      handleClick={props.onClickRejectApplication}
                    />
                  )}
                  {props.alterPolicy && (
                    <MenuItem
                      name="Alter Policy"
                      handleClick={props.onClickAlterPolicy}
                    />
                  )}
                  {props.showCreateClaim && (
                    <MenuItem
                      name="Create Claim"
                      handleClick={props.onClickCreateClaim}
                    />
                  )}
                  {props.alterApplication && (
                    <MenuItem
                      name="Alter Application"
                      handleClick={props.onClickAlterApplication}
                    />
                  )}

                  {props.showIssuePolicy && (
                    <MenuItem
                      name="Issue Policy"
                      handleClick={props.onClickIssuePolicy}
                    />
                  )}
                  {props.showIsArchive && (
                    <MenuItem
                      name="Archive"
                      handleClick={props.onClickIsArchived}
                    />
                  )}
                  {props.showApplicationOnHold && (
                    <MenuItem
                      name="On Hold"
                      handleClick={props.onClickApplicationOnHold}
                    />
                  )}

                  {props.showClaimOnHold && (
                    <MenuItem
                      name="Claim On Hold"
                      handleClick={props.onClickAlterPolicy}
                    />
                  )}

                  {props.alterLead && (
                    <MenuItem
                      name="Alter Prospect"
                      handleClick={props.onClickAlterLead}
                    />
                  )}

                  {props.displayRefuse && (
                    <MenuItem
                      name="Refuse Prospect"
                      handleClick={props.onClickRefuseLead}
                    />
                  )}

                  {props.resubmitLead && (
                    <MenuItem
                      name="Resubmit Prospect"
                      handleClick={props.onClickAlterLead}
                    />
                  )}

                  {props.showIsArchiveInClaim &&
                    !session.data?.user.roles?.includes("CLAIM_SUPERVISOR") && (
                      <MenuItem
                        name="Archive"
                        handleClick={props.onClickIsArchivedInClaim}
                      />
                    )}
                  {props.displaySendToReview && (
                    <MenuItem
                      name="Send to review"
                      handleClick={props.onClickSendToReview}
                    />
                  )}
                  {props.displaySendToApplication && (
                    <MenuItem
                      name="Accept Prospect"
                      handleClick={props.onClickSendToApplication}
                    />
                  )}
                  {props.displayApprove &&
                    (session.data?.user.roles?.includes(
                      roleValues.claimSupervisor as UserRole
                    ) ||
                      session.data?.user.roles?.includes(
                        roleValues.superAdmin as UserRole
                      )) && (
                      <MenuItem
                        name="Approve"
                        handleClick={props.onClickApprove}
                      />
                    )}
                  {props.displayRepudiate &&
                    (session.data?.user.roles?.includes(
                      roleValues.claimSupervisor as UserRole
                    ) ||
                      session.data?.user.roles?.includes(
                        roleValues.superAdmin as UserRole
                      )) && (
                      <MenuItem
                        name="Repudiate"
                        handleClick={props.onClickRepudiate}
                      />
                    )}
                  {props.displayPayoutProcessed &&
                    (session.data?.user.roles?.includes(
                      roleValues.claimSupervisor as UserRole
                    ) ||
                      session.data?.user.roles?.includes(
                        roleValues.superAdmin as UserRole
                      )) && (
                      <MenuItem
                        name="Payout Processed"
                        handleClick={props.onClickPayoutProcessed}
                      />
                    )}
                  {props.displayPayoutBlocked &&
                    (session.data?.user.roles?.includes(
                      roleValues.claimSupervisor as UserRole
                    ) ||
                      session.data?.user.roles?.includes(
                        roleValues.superAdmin as UserRole
                      )) && (
                      <MenuItem
                        name="Block payout"
                        handleClick={props.onClickPayoutBlocked}
                      />
                    )}

                  {props.showIsArchiveInComplaint && (
                    <MenuItem
                      name="Archive"
                      handleClick={props.onClickIsArchivedInComplaint}
                    />
                  )}

                  {props.showRejectClaim && (
                    <MenuItem
                      name="Reject"
                      handleClick={props.onClickRejectClaim}
                    />
                  )}
                  {props.showRenewalePolicy && (
                    <MenuItem
                      name="Renewal Policy"
                      handleClick={props.onClickRenewalePolicy}
                    />
                  )}
                  {props.showCallScheduled && (
                    <MenuItem
                      name="Call Scheduled"
                      handleClick={props.onClickCallScheduled}
                    />
                  )}
                  {props.showInterested && (
                    <MenuItem
                      name="Interested"
                      handleClick={props.onClickInterested}
                    />
                  )}
                  {props.showNotInterested && (
                    <MenuItem
                      name="Not Interested"
                      handleClick={props.onClickNotInterested}
                    />
                  )}
                  {props.showExpired && (
                    <MenuItem
                      name="Expired"
                      handleClick={props.onClickExpired}
                    />
                  )}
                  {props.showCreateProspect && (
                    <MenuItem
                      name="Create prospect"
                      handleClick={props.onClickCreateProspect}
                    />
                  )}
                </>
              )}
            </div>
          </Menu.Items>
        </Menu>
      )}
    </div>
  );
};

export default ActionButtons;

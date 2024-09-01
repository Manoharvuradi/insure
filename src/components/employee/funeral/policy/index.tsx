import React from "react";
import PolicyForm from "~/components/employee/funeral/policy/policyForm";

export default function CreateForm({ title }: { title: string }) {
  return (
    <div>
      <div className="mx-4 my-8">
        <h1 className="p-2 text-4xl">Create new {title}</h1>
        <PolicyForm title={title} />
      </div>
    </div>
  );
}

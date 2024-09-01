import { CheckIcon } from "@heroicons/react/20/solid";
import { IStep } from "~/interfaces/common";
import { classNames } from "~/utils/helpers";

export default function Steps({ steps }: { steps: IStep[] }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step: IStep, stepIdx: number) => (
          <li
            key={step.name}
            className={classNames(
              stepIdx !== steps.length - 1 ? "pb-10" : "",
              "relative "
            )}
          >
            {step.status === "complete" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-primary-600 "
                    aria-hidden="true"
                  />
                ) : null}
                <a href={step.href} className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-primary-600 bg-primary-600 ">
                      <CheckIcon
                        className="h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                  <span className="ml-4 mt-2 flex min-w-0 flex-col">
                    <span className="text-large font-large">{step.name}</span>
                  </span>
                </a>
              </>
            ) : step.status === "current" ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-flow-grey"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex cursor-default items-start"
                  aria-current="step"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-primary-600 bg-primary-600 ">
                      <span className="text-white">{stepIdx + 1}</span>
                    </span>
                  </span>
                  <span className="ml-4 mt-2 flex min-w-0 flex-col">
                    <span className="text-large cursor-pointer font-medium text-primary-600">
                      {step.name}
                    </span>
                  </span>
                </a>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div
                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-flow-grey"
                    aria-hidden="true"
                  />
                ) : null}
                <a
                  href={step.href}
                  className="group relative flex cursor-default items-start"
                >
                  <span className="flex h-9 items-center" aria-hidden="true">
                    <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#E0E9EF] group-hover:border-gray-400">
                      <span className=" bg-transparent text-[#ACB4B9]">
                        {stepIdx + 1}
                      </span>
                    </span>
                  </span>
                  <span className="ml-4 mt-2 flex min-w-0 flex-col">
                    <span className="text-large font-large cursor-pointer text-gray-500">
                      {step.name}
                    </span>
                  </span>
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

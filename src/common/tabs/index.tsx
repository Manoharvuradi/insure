import { classNames } from "~/utils/helpers";

export interface ITabsProps {
  tabs: any;
  activeTab: string;
  setActiveTab: any;
  handleTabChange?: any;
  hide?: string[];
}

const TabsBar = (props: ITabsProps) => {
  return (
    <nav
      className="flex h-12 w-full gap-3 border-b border-flow-grey bg-white pl-3 pr-6"
      aria-label="Tabs"
    >
      {props.tabs.map(
        (tab: any) =>
          !props?.hide?.includes(tab.name) && (
            <a
              key={tab.name}
              onClick={() => props.handleTabChange(tab.name)}
              className={classNames(
                props.activeTab == tab.name
                  ? "border-primary-blue text-primary-blue"
                  : "border-transparent text-black  hover:text-primary-blue",
                "flex  cursor-pointer items-center justify-center whitespace-nowrap border-b-[4px] px-1 py-1.5 text-[15px] font-medium"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              <span>{tab.label}</span>
            </a>
          )
      )}
    </nav>
  );
};

export default TabsBar;

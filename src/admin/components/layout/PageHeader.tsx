import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
}

const PageHeader = ({ title, action }: PageHeaderProps) => (
  <div className="page-header mb-3 shrink-0 sm:mb-4">
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-xl font-bold tracking-tight text-app sm:text-2xl lg:text-3xl">
          {title}
        </h2>
      </div>
      {action ? <div className="page-header-action shrink-0">{action}</div> : null}
    </div>
  </div>
);

export default PageHeader;

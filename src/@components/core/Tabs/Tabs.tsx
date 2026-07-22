import React, { useState, ReactNode } from "react";

interface TabsProps {
  options: string[];
  defaultTab?: string;
  children: ReactNode[];
}

const Tabs: React.FC<TabsProps> = ({ options, defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || options[0]);

  return (
    <div className="w-full">
      <div className="flex  justify-between border-gray-300 w-full mb-4 bg-gray-200 rounded-full">
        {options.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`sm:px-4 px-1 py-1 font-medium capitalize w-full transition cursor-pointer sm:text-base text-sm ${
              activeTab === tab
                ? "bg-white text-black rounded-full"
                : " text-gray-600 border-transparent hover:bg-gray-200 rounded-full"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4 bg-white rounded-lg">
        {children[options.indexOf(activeTab)]}
      </div>
    </div>
  );
};

export default Tabs;

import React from "react";

interface FraudDataEntry {
  courier: string;
  delivered: number;
  returned: number;
  total: number;
  ratio: string;
}

interface FraudCheckProps {
  fraudData: FraudDataEntry[];
}

const FraudCheck: React.FC<FraudCheckProps> = ({ fraudData }) => {
  if (!fraudData || fraudData.length === 0) {
    return (
      <div className="ov-panel mt-3">
        <h3 className="ov-panel__title mb-4">Fraud Check</h3>
        <p className="text-sm text-center text-[var(--ov-muted)]">Loading...</p>
      </div>
    );
  }

  return (
      <div className="ov-panel">
        <h3 className="ov-panel__title mb-4">
          Fraud Check
        </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-blue-100 dark:bg-gray-700 dark:text-gray-400 h-[35px] shadow-sm border dark:border-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 border dark:border-gray-700  text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Courier
              </th>
              <th className="px-4 py-2 border dark:border-gray-700  text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Delivered
              </th>
              <th className="px-4 py-2 border dark:border-gray-700  text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Returned
              </th>
              <th className="px-4 py-2 border dark:border-gray-700  text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-2 border dark:border-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {fraudData.map((entry, index) => (
              <tr
                key={index}
                className="bg-white dark:bg-gray-800 hover:bg-gray-100 transition-colors"
              >
                <td className="px-4 py-2 border dark:border-gray-700 dark:text-gray-400 border-gray-200 text-sm text-gray-700">
                  {entry.courier}
                </td>
                <td className="px-4 py-2 border dark:border-gray-700 dark:text-gray-400 border-gray-200 text-sm text-gray-700">
                  {entry.delivered}
                </td>
                <td className="px-4 py-2 border dark:border-gray-700 dark:text-gray-400 border-gray-200 text-sm text-gray-700">
                  {entry.returned}
                </td>
                <td className="px-4 py-2 border dark:border-gray-700 dark:text-gray-400 border-gray-200 text-sm text-gray-700">
                  {entry.total}
                </td>
                <td className="px-4 py-2 border dark:border-gray-700 dark:text-gray-400 border-gray-200 text-sm text-gray-700">
                  {entry.ratio}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FraudCheck;

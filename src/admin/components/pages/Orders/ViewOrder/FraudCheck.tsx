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
      <h3 className="ov-panel__title mb-4">Fraud Check</h3>
      <div className="overflow-x-auto">
        <table className="ov-table">
          <thead>
            <tr>
              <th>Courier</th>
              <th>Delivered</th>
              <th>Returned</th>
              <th>Total</th>
              <th>Ratio</th>
            </tr>
          </thead>
          <tbody>
            {fraudData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.courier}</td>
                <td>{entry.delivered}</td>
                <td>{entry.returned}</td>
                <td>{entry.total}</td>
                <td>{entry.ratio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FraudCheck;

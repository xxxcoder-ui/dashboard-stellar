import React from "react";
import { Table, Icon } from "@stellar/design-system";

import { networkConfig } from "constants/settings";
import { useRedux } from "hooks/useRedux";
import { SectionCard } from "components/SectionCard";
import { LedgerClosedTime } from "components/LedgerClosedTime";
import { CircularChart } from "components/charts/CircularChart";
import { BatteryLikeChart } from "components/charts/BatteryLikeChart";
import { LedgerItem, Network } from "types";

import "./styles.scss";

export const LastLedgersInfo = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { ledgers } = useRedux("ledgers");
  const last10Ledgers = ledgers.lastLedgerRecords.slice(1, 11);

  const labels = [
    {
      id: "ledgerNumber",
      label: (
        <div key="LedgerNumber" className="CellIcon">
          <Icon.Box /> Ledger number
        </div>
      ),
    },
    {
      id: "transactions",
      label: "Transactions",
    },
    {
      id: "operations",
      label: "Operations",
    },
    {
      id: "closingTime",
      label: "Closing time",
    },
  ];

  const renderLedger = (ledger: LedgerItem) => (
    <React.Fragment key={ledger.sequenceNumber}>
      <td className="LastLedgersInfo__sequence">{ledger.sequenceNumber}</td>
      <td>
        <div className="LastLedgersInfo__chartWrapper">
          <div className="LastLedgersInfo__pieChart">
            <CircularChart
              data={[
                {
                  label: "Succeeded",
                  value: ledger.txCountSuccessful,
                },
                { label: "Failed", value: ledger.txCountFailed },
              ]}
              lineWidth={0.5}
              tooltipEnabled={false}
              colorType={CircularChart.ColorType.SECONDARY}
            />
          </div>
          {ledger.txCountSuccessful} succeeded / {ledger.txCountFailed} failed
        </div>
      </td>
      <td>
        <div className="LastLedgersInfo__chartWrapper">
          <div className="LastLedgersInfo__barChart">
            <BatteryLikeChart value={ledger.opCount / 10} />
          </div>
          {ledger.opCount}
        </div>
      </td>
      <td>
        <LedgerClosedTime closedTime={ledger.closedTime} />
      </td>
    </React.Fragment>
  );

  return (
    <SectionCard
      title="Last 10 Ledgers Info"
      titleLinkLabel="API"
      titleLink={`${networkConfig[network].url}/operations?order=desc&limit=20`}
    >
      <div className="LastLedgersInfo">
        <Table
          id="last-10-ledgers"
          data={last10Ledgers}
          columnLabels={labels}
          hideNumberColumn
          renderItemRow={renderLedger}
        />
      </div>
    </SectionCard>
  );
};

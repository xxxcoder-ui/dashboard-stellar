import { useEffect, useState, useCallback } from "react";
import { StatusBar, TextLink } from "@stellar/design-system";

import { STATUS_INCIDENTS_URL, STATUSPAGE_URL } from "constants/settings";

import { getLastMaintenanceMessage } from "helpers/getLastMaintenanceMessage";
import { getIncidentMessages } from "helpers/getIncidentMessages";
import { formatTimeAgo } from "helpers/formatTimeAgo";
import { formatFullDateTimeUtc } from "helpers/formatFullDateTimeUtc";

import { MaintenanceMessage, IncidentMessage } from "types";

// TODO: do we want to fetch every 30 sec?
const FETCH_INTERVAL = 30 * 1000;

export const AnnouncementsBanner = () => {
  const [maintenanceMessage, setMaintenanceMessage] =
    useState<MaintenanceMessage | null>(null);
  const [incidentMessages, setIncidentMessages] = useState<IncidentMessage[]>(
    [],
  );

  const formatMaintenanceMessage = (message: MaintenanceMessage) => (
    <>
      <div>
        Scheduled Maintenance:{" "}
        <TextLink
          variant={TextLink.variant.secondary}
          underline
          href={`${STATUS_INCIDENTS_URL}/${message.id}`}
        >
          {message.name}
        </TextLink>{" "}
        on {formatFullDateTimeUtc(message.scheduledFor)}
      </div>
      {message.details ? <div>{message.details}</div> : null}
    </>
  );

  const formatIncidentMessage = (message: IncidentMessage) => (
    <>
      <div>
        <TextLink
          variant={TextLink.variant.secondary}
          underline
          href={`${STATUS_INCIDENTS_URL}/${message.id}`}
        >
          {message.name}
        </TextLink>{" "}
        (started: {formatTimeAgo(message.startedAt)}
        {message.lastUpdatedAt
          ? `, last update: ${formatTimeAgo(message.lastUpdatedAt)}`
          : null}
        )
      </div>
      <div>
        <small>Affected: {message.affected}</small>
      </div>
      {message.details ? <div>{message.details}</div> : null}
    </>
  );

  const fetchStatusPage = useCallback(async () => {
    const fetchResponse = await fetch(`${STATUSPAGE_URL}/summary.json`);
    const statusPageData = await fetchResponse.json();
    const { scheduled_maintenances: maintenances, incidents } = statusPageData;

    setMaintenanceMessage(getLastMaintenanceMessage(maintenances));
    setIncidentMessages(getIncidentMessages(incidents));
  }, []);

  useEffect(() => {
    fetchStatusPage();

    const interval = setInterval(() => {
      fetchStatusPage();
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [fetchStatusPage]);

  if (!(maintenanceMessage && incidentMessages)) {
    return null;
  }

  return (
    <>
      {incidentMessages.length > 0
        ? incidentMessages.map((im) => (
            <StatusBar variant={StatusBar.variant.error}>
              {formatIncidentMessage(im)}
            </StatusBar>
          ))
        : null}
      {maintenanceMessage ? (
        <StatusBar variant={StatusBar.variant.warning}>
          {formatMaintenanceMessage(maintenanceMessage)}
        </StatusBar>
      ) : null}
    </>
  );
};

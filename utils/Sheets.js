import { registerSheet } from "react-native-actions-sheet";

import { PayoutViewSheet } from "./sheets/Payout";
import {
  EventAboutSheet,
  EventDateSheet,
  EventPhysicalTicketsSheet,
  EventTierSheet,
  EventVisibilitySheet,
  EventsShareSheet,
  EventTicketViewerSheet,
} from "./sheets/Events";
import { HelperSheet } from "./sheets/Helper";

registerSheet("payout-view-sheet", PayoutViewSheet);
registerSheet("events-share-sheet", EventsShareSheet);
registerSheet("helper-sheet", HelperSheet);
registerSheet("event-ticket-viewer", EventTicketViewerSheet);

registerSheet(
  "event-about-sheet",
  EventAboutSheet,
  "global",
  "local",
  "local-local",
);
registerSheet(
  "event-date-sheet",
  EventDateSheet,
  "global",
  "local",
  "local-local",
);
registerSheet(
  "event-visibility-sheet",
  EventVisibilitySheet,
  "global",
  "local",
  "local-local",
);

registerSheet(
  "event-physical-tickets-sheet",
  EventPhysicalTicketsSheet,
  "global",
  "local",
  "local-local",
);

registerSheet(
  "event-tier-sheet",
  EventTierSheet,
  "global",
  "local",
  "local-local",
);

export {};

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
  EventOfflineScannerSheet,
  EventNodeTierSheet,
} from "./sheets/Events";
import {
  HelperSheet,
  AuthenticateSheet,
  PaymentErrorSheet,
} from "./sheets/Helper";

registerSheet("payout-view-sheet", PayoutViewSheet);
registerSheet("events-share-sheet", EventsShareSheet);
registerSheet("helper-sheet", HelperSheet);
registerSheet("payment-error-sheet", PaymentErrorSheet);
registerSheet("event-ticket-viewer", EventTicketViewerSheet);

// global

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

registerSheet(
  "event-node-tier-sheet",
  EventNodeTierSheet,
  "global",
  "local",
  "local-local",
);

registerSheet(
  "offline-scanner",
  EventOfflineScannerSheet,
  "global",
  "local",
  "local-local",
);

registerSheet(
  "authentication",
  AuthenticateSheet,
  "global",
  "local",
  "local-local",
);

export {};

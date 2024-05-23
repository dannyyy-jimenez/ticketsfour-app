import React from "react";
import { useSession } from "../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { ScrollContainer } from "../../../utils/components/Layout";
import Style, { theme } from "../../../utils/Styles";
import { Feather } from "@expo/vector-icons";
import { useLocalization } from "../../../locales/provider";
import { ReplaceWithStyle } from "../../../utils/Formatters";
import { SheetManager } from "react-native-actions-sheet";

import EventModel from "../../../models/Event";
import Ticket from "../../../models/Ticket";
import Api from "../../../utils/Api";
import { EventPurchaseComponent } from "../../../utils/components/Event";

export default function TicketScreen() {
  const {
    auth,
    session,
    isGuest,
    signOut,
    name,
    organizations,
    setActiveOrganization,
    setOrganizerMode,
    organizerMode,
  } = useSession();
  const { i18n } = useLocalization();
  const { width, height } = Dimensions.get("window");
  const [isLoading, setIsLoading] = React.useState(true);

  const [events, setEvents] = React.useState([]);
  const [tickets, setTickets] = React.useState([]);
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [activeTicketIdx, setActiveTicketIdx] = React.useState(0);

  const [counts, setCounts] = React.useState({});

  const load = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/users/tickets", { auth });
      if (res.isError) throw "e";

      setEvents(res.data.events.map((ev) => new EventModel({ ...ev })));
      setTickets(
        res.data.tickets.map(
          (t) =>
            new Ticket({
              ...t,
              owner: res.data.owner,
              owner_age: res.data.age,
              ev: res.data.events.find((e) => e.id == t.ev),
            }),
        ),
      );

      let c = {};
      for (let ev of res.data.events) {
        c[ev.id] = res.data.tickets.filter((t) => t.ev == ev.id).length;
      }

      setCounts(c);

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  React.useEffect(() => {
    setActiveTicketIdx(0);
  }, [selectedEvent]);

  return (
    <ScrollContainer>
      <View>
        <View
          style={[Style.containers.row, { marginTop: 6, marginBottom: 20 }]}
        >
          <Text style={[Style.text.xxxl, Style.text.bold, Style.text.dark]}>
            {ReplaceWithStyle(
              i18n.t("purchaseHistory"),
              "{purchase}",
              <Text style={[Style.text.primary, Style.text.semibold]}>
                {i18n.t("purchase")}
              </Text>,
            )}
          </Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() =>
              SheetManager.show("helper-sheet", {
                payload: { text: "purchaseHistoryDesc" },
              })
            }
            style={{ padding: 10 }}
          >
            <Feather name="info" size={20} color={theme["color-basic-700"]} />
          </TouchableOpacity>
        </View>
        {isLoading && (
          <ActivityIndicator size="small" color={theme["color-primary-500"]} />
        )}
        {events.map((event, tbidx) => (
          <EventPurchaseComponent
            key={event.id + "-" + tbidx}
            i18n={i18n}
            _event={event}
            index={tbidx}
            ticketsAmount={counts[event.id]}
            tickets={tickets.filter((t) => t.event.id == event.id)}
          />
        ))}
      </View>
    </ScrollContainer>
  );
}

import React from "react";
import { useOfflineProvider, useSession } from "../../../../utils/ctx";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Platform,
  Linking,
  Alert,
} from "react-native";
import LayoutContainer, {
  LockedView,
  ScrollContainer,
} from "../../../../utils/components/Layout";
import Style, { theme } from "../../../../utils/Styles";
import {
  Feather,
  Ionicons,
  FontAwesome6,
  MaterialCommunityIcons,
  Octicons,
  Entypo,
} from "@expo/vector-icons";
import { useLocalization } from "../../../../locales/provider";
import Api from "../../../../utils/Api";
import { Link, router, useLocalSearchParams } from "expo-router";
import EventModel from "../../../../models/Event";
import Ticket from "../../../../models/Ticket";
import * as scale from "d3-scale";

import {
  Commasize,
  CurrencyFormatter,
  EmailValidator,
  PhoneFormatter,
  ReplaceWithStyle,
} from "../../../../utils/Formatters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Leaf from ".../../../../models/Leaf";
import Config from "../../../../utils/Config";
import SkeletonLoader from "expo-skeleton-loader";
import { ScrollView } from "react-native";
import Share from "react-native-share";
import {
  SheetManager,
  SheetProvider,
  registerSheet,
} from "react-native-actions-sheet";
import { Pressable } from "react-native";
import moment from "moment/moment";
import Purchase from "../../../../models/Purchase";
import { BarChart, PieChart, XAxis } from "react-native-svg-charts";
import { Text as SvgText } from "react-native-svg";
import { CameraView } from "expo-camera";
// import NfcManager, { NfcAdapter, NfcTech } from "react-native-nfc-manager";
import { Vibration } from "react-native";
import MapComponent from "../../../../utils/components/Map";

// NfcManager.start().catch((_) => {});

export default function EventScreen() {
  const { sql, isOfflineMode, validateOffloadScan } = useOfflineProvider();
  const { auth, defaultOrganization: oid, isGuest, signOut } = useSession();
  const { eid } = useLocalSearchParams();
  const { i18n } = useLocalization();
  const scrollContainer = React.useRef(null);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");
  const [hasPermission, setHasPermission] = React.useState(true);
  const [canViewDashboard, setCanViewDashboard] = React.useState(false);
  const [canViewTiers, setCanViewTiers] = React.useState(false);
  const [canEditEvent, setCanEditEvent] = React.useState(false);
  const [canEditTiers, setCanEditTiers] = React.useState(false);
  const [canViewSales, setCanViewSales] = React.useState(false);
  const [canViewScanner, setCanViewScanner] = React.useState(false);
  const [timezone, setTimezone] = React.useState();
  const [scannerShareLink, setScannerShareLink] = React.useState("");
  const [tierSales, setTierSales] = React.useState([]);

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);

  const [ev, setEvent] = React.useState(null);
  const [dataPoints, setDataPoints] = React.useState(null);
  const [physicalTickets, setPhysicalTickets] = React.useState([]);
  const [section, setSection] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = React.useState(true);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = React.useState(true);

  const [isLoadingBackground, setIsLoadingBackground] = React.useState(false);
  const [isLoadingHosts, setIsLoadingHosts] = React.useState(false);
  const [isLoadingVenues, setIsLoadingVenues] = React.useState(false);
  const [todos, setTodos] = React.useState([]);
  const [isEventOrganizer, setIsEventOrganizer] = React.useState(false);
  const TODOS = [
    {
      text: i18n.t("about"),
      edit: i18n.t("edit"),
      hideOnActive: false,
      section: 21,
      id: "about",
    },
    {
      text: i18n.t("visibility"),
      edit: i18n.t("edit"),
      section: 22,
      hideOnActive: false,
      id: "visibility",
    },
    {
      text: i18n.t("date"),
      edit: i18n.t("edit"),
      section: 23,
      hideOnActive: false,
      id: "date",
    },
    {
      text: i18n.t("venue"),
      edit: i18n.t("switch"),
      section: 24,
      hideOnActive: true,
      id: "venue",
    },
    {
      text: i18n.t("ticketing"),
      edit: i18n.t("edit"),
      section: 25,
      hideOnActive: false,
      id: "ticketing",
    },
    {
      text: i18n.t("venueConfirmation"),
      edit: null,
      section: 0,
      hideOnActive: true,
      id: "venue-conf",
    },
    {
      text: i18n.t("publish"),
      edit: null,
      section: 3,
      hideOnActive: true,
      id: "publish",
    },
    // {
    //   text: 'Marketing',
    //   section: null,
    //   id: 'marketing'
    // }
  ];
  const [openHostSuggest, setOpenHostSuggest] = React.useState(false);
  const [hostSuggestions, setHostSuggestions] = React.useState([]);
  const [venueSearchVisible, setVenueSearchVisible] = React.useState(false);
  const [pickedVenue, setPickedVenue] = React.useState(null);
  const [venueChangeMapPick, setVenueChangeMapPick] = React.useState(null);
  const [venueChangeMaps, setVenueChangeMaps] = React.useState([]);
  const [showVenueChangeMaps, setShowVenueChangeMaps] = React.useState(false);
  const [venueSuggestions, setVenueSuggestions] = React.useState([]);
  const [publishModalVisible, setPublishModalVisible] = React.useState(false);
  const [purchases, setPurchases] = React.useState([]);
  const [salesAmount, setSalesAmount] = React.useState(0);
  const [venueEarnings, setVenueEarnings] = React.useState(null);
  const [promoterEarnings, setPromoterEarnings] = React.useState(null);
  const [taxCollected, setTaxCollected] = React.useState(null);
  const [feesCharged, setFeesCharged] = React.useState(null);

  // artist lineup
  const [isLoadingArtist, setIsLoadingArtist] = React.useState(false);
  const [artists, setArtists] = React.useState([]);
  const [artist, setArtist] = React.useState("");
  const [openArtistSuggest, setOpenArtistSuggest] = React.useState(false);
  const [artistSuggestions, setArtistSuggestions] = React.useState([]);

  const [activeTierIdx, setActiveTierIdx] = React.useState(0);
  const [tierTasks, setTierTasks] = React.useState([]);
  const [scheduledTasks, setScheduledTasks] = React.useState([]);

  const [isLoadingScan, setIsLoadingScan] = React.useState(false);
  const [scannerResult, setScannerResult] = React.useState(null);

  const [scannedCode, setScannedCode] = React.useState(null);
  const [nfcMode, setNFCMode] = React.useState(null);

  const enoughSalesDataPoints = React.useMemo(() => {
    return (
      dataPoints?.sales?.map((p) => p.value).filter((v) => v != 0).length > 2
    );
  }, [ev, dataPoints]);

  const weekdaySales = React.useMemo(() => {
    if (!dataPoints?.salesCum) return;

    let weekdays = [0, 0, 0, 0, 0, 0, 0];

    for (let salePoint of dataPoints?.salesCum) {
      let parsedDate = moment(salePoint.date);
      let dow = parsedDate.weekday();

      weekdays[dow] += salePoint.value;
    }

    let joined = [...weekdays.slice(1), weekdays[0]];

    return joined.map((amount, weekday) => ({
      weekday: weekday,
      value: amount,
    }));
  }, [ev, dataPoints]);

  const enoughAgeDataPoints = React.useMemo(() => {
    if (ev?.draft) return false;

    return (
      !ev?.active ||
      dataPoints?.ages?.map((p) => p.value).filter((v) => v != 0).length > 3
    );
  }, [ev, dataPoints]);
  const enoughMapDataPoints = React.useMemo(() => {
    return !ev?.active || dataPoints?.views?.features?.length > 0;
  }, [ev, dataPoints]);

  // editables

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tags, setTags] = React.useState([]);
  const [privacy, setPrivacy] = React.useState("");
  const [startDateTime, setStartDateTime] = React.useState("");
  const [endDateTime, setEndDateTime] = React.useState("");
  const [startDate, setStartDate] = React.useState("");

  const availableHolds = React.useMemo(() => {
    if (!ev || !ev?.nodes) return 0;

    let holds = [];

    for (let node of ev?.nodes) {
      for (let i = 0; i < node.holdings; i++) {
        holds.push(new Leaf({ node: node }));
      }
    }

    return holds;
  }, [ev]);

  const [selectedHolds, setSelectedHolds] = React.useState([]);

  React.useEffect(() => {
    if (selectedHolds.join("") == "all")
      setSelectedHolds(availableHolds.map((a) => a.key));
  }, [selectedHolds]);

  const addonsGrouped = React.useMemo(() => {
    if (!ev) return [];

    let groups = {};
    let addons = ev.nodes.filter(
      (n) => !n.isDecorative && !n.isExposed && n.booked,
    );

    for (let addon of addons) {
      if (!groups[addon.price]) {
        groups[addon.price] = [];
      }

      groups[addon.price].push(addon);
    }

    return groups;
  }, [ev]);

  const [hostQuery, setHostQuery] = React.useState("");
  const [venueQuery, setVenueQuery] = React.useState("");
  const [deleteConfirmValue, setDeleteConfirmValue] = React.useState("Default");
  const [holdsTransferPhone, setHoldsTransferPhone] = React.useState("Default");
  const [scannerSearchQuery, setScannerSearchQuery] = React.useState("");

  const [scannerSearchResults, setScannerSearchResults] = React.useState([]);
  const [holdsTransferError, setHoldsTransferError] = React.useState("");

  const [scannerResultsDatum, setScannerResultsDatum] = React.useState(null);
  const [scanStamp, setScanStamp] = React.useState(null);

  const holdsTransferPhoneHelper = React.useMemo(() => {
    if (holdsTransferError === "USER_NOT_REGISTERED")
      return {
        color: "error",
        text: "The phone number must be registered to recieve the tickets transfer",
        valid: false,
      };

    if (holdsTransferPhone.replace(/[^0-9\.]+/g, "").length !== 10)
      return {
        color: "default",
        text: "Enter a valid 10 digit phone number",
        valid: false,
      };

    return {
      color: "default",
      valid: true,
    };
  }, [holdsTransferPhone, holdsTransferError]);

  React.useEffect(() => {
    if (hostQuery.trim().length < 3) return;

    Api.get("/organizations/search", { auth, oid, query: hostQuery }).then(
      (res) => {
        if (res.isError) throw "e";

        setHostSuggestions(
          res.data.organizations.map((o) => new Organization({ ...o })),
        );
        setOpenHostSuggest(true);
      },
    );
  }, [hostQuery]);

  React.useEffect(() => {
    setPickedVenue(null);
    setVenueSuggestions([]);
    if (venueQuery.trim().length == 0) return;

    setIsLoadingVenues(true);
    Api.get("/venues/search", {
      auth,
      oid,
      query: venueQuery,
      extensive: true,
    }).then((res) => {
      if (res.isError) throw "e";
      setIsLoadingVenues(false);
      setVenueSuggestions(
        res.data.venues.map((venue) => new Venue({ ...venue })),
      );
    });
  }, [venueQuery]);

  React.useEffect(() => {
    if (!auth || !oid || !eid) return;
    load();
  }, [eid]);

  React.useEffect(() => {
    onScan();
  }, [scannedCode]);

  React.useEffect(() => {
    if (!scannerResult) return;

    if (scannerResult != "VALID") {
      Vibration.vibrate([500, 1000, 500, 1000, 500]);
    }

    setTimeout(
      () => {
        setScannerResultsDatum(null);
        setScannerResult(null);
        setIsLoadingScan(false);
        setScannedCode(null);

        // if (nfcMode) {
        //   initNFC();
        // }
      },
      nfcMode ? 4500 : 1500,
    );
  }, [scannerResult]);

  React.useEffect(() => {
    setHoldsTransferPhone(PhoneFormatter(holdsTransferPhone));
    setHoldsTransferError("");
  }, [holdsTransferPhone]);

  React.useEffect(() => {
    if (artist.trim().length < 2) return;

    Api.get("/organizations/events/artists/search", {
      auth,
      oid,
      query: artist,
    }).then((res) => {
      if (res.isError) throw "e";

      setArtistSuggestions(res.data.artists);
      setOpenArtistSuggest(true);
    });
  }, [artist]);

  const onRemoveArtist = (idx) => {
    setArtists((prev) => {
      let updated = prev.slice();
      updated.splice(idx, 1);
      return updated;
    });
  };

  const onArtistPick = async (suggestion, remove = false, idx) => {
    setIsLoadingArtist(true);

    try {
      if (remove) {
        let c = [...artists];
        c.splice(idx, 1);
        setArtists(c);
      } else {
        let exists = artists.find((a) => a.id == suggestion.id);

        if (!exists) {
          setArtists([...artists, suggestion]);
        }
      }
      setOpenArtistSuggest(false);
      setArtist("");
      setIsLoadingArtist(false);
    } catch (e) {
      setIsLoadingArtist(false);
    }
  };

  const onHostPick = async (suggestion, remove = false, idx) => {
    setIsLoadingHosts(true);

    try {
      let updatedEv = remove
        ? ev.removeHost(suggestion, idx)
        : ev.addHost(suggestion);

      if (!updatedEv) {
        setOpenHostSuggest(false);
        setHostQuery("");
        setIsLoadingHosts(false);
        return;
      }
      const res = await Api.post("/organizations/events/host", {
        auth,
        oid,
        eid,
        remove,
        host: suggestion.identifier,
      });
      if (res.isError) throw "e";

      setEvent(updatedEv);
      setOpenHostSuggest(false);
      setHostQuery("");
      setIsLoadingHosts(false);
    } catch (e) {
      setIsLoadingHosts(false);
    }
  };

  const onHoldsTransfer = async (tidx) => {
    setIsLoadingBackground(true);

    try {
      if (selectedHolds.length == 0 || !holdsTransferPhoneHelper.valid) {
        throw "e";
      }

      let leaves = availableHolds
        .filter((l) => selectedHolds.includes(l.key))
        .map((l) => l.requestify());

      const res = await Api.post("/organizations/events/holds", {
        auth,
        oid,
        eid,
        leaves,
        holdsTransferPhone,
      });
      if (res.isError) throw res.data.message;

      await load();
      setHoldsTransferPhone("");
      setSelectedHolds([]);
      setIsLoadingBackground(false);
    } catch (e) {
      setHoldsTransferError(e);
      setIsLoadingBackground(false);
    }
  };

  const loadDetails = async () => {
    setIsLoading(true);

    try {
      const res = await Api.get("/organizations/event/details", {
        auth,
        oid,
        eid,
      });

      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setCanViewDashboard(
        res.data.permissions.includes("EVENT_DASHBOARD_VIEW"),
      );
      setCanViewSales(res.data.permissions.includes("EVENT_SALES_VIEW"));
      setCanEditEvent(res.data.permissions.includes("EVENT_EDIT"));
      setCanViewTiers(res.data.permissions.includes("EVENT_TIERS_VIEW"));
      setCanEditTiers(res.data.permissions.includes("EVENT_TIERS_EDIT"));
      setCanViewScanner(res.data.permissions.includes("EVENT_SCANNER_VIEW"));
      setIsEventOrganizer(res.data.isEventOrganizer);
      setEvent(new EventModel({ ...res.data.ev }));
      setScannerShareLink(res.data.scanner_share);

      setTodos(res.data.todos);
      setScheduledTasks(res.data.tasks);

      setSalesAmount(res.data.sales);
      setVenueEarnings(res.data.venue_earnings);
      setPromoterEarnings(res.data.promoter_earnings);
      setTaxCollected(res.data.taxes_collected);
      setFeesCharged(res.data.fees_charged);
      setArtists(res.data.ev.lineup);

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      //setIsLoading(false);
    }
  };

  const loadBreakdown = async () => {
    setIsLoadingBreakdown(true);
    try {
      const res = await Api.get("/organizations/event/breakdown", {
        auth,
        oid,
        eid,
      });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setTierSales(res.data.tierSales);

      let physical = {};

      res.data.physical_tickets.forEach((ticket, i) => {
        let id = ticket.node.name + ticket.total;

        if (physical[id]) {
          physical[id].push(new Ticket({ ev: res.data.ev, ...ticket }));
        } else {
          physical[id] = [];
          physical[id].push(new Ticket({ ev: res.data.ev, ...ticket }));
        }
      });

      setPhysicalTickets(physical);
      setPurchases(
        res.data.purchases.map((purchase) => new Purchase({ ...purchase })),
      );
      setIsLoadingBreakdown(false);
    } catch (e) {
      console.log(e);
      setIsLoadingBreakdown(false);
      //setIsLoading(false);
    }
  };

  const loadAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const res = await Api.get("/organizations/event/analyze", {
        auth,
        oid,
        eid,
      });
      if (res.isError) throw "e";

      if (!res.data.has_permission) {
        setHasPermission(false);
        throw "NO_PERMISSION";
      }

      setDataPoints(res.data.dataPoints);
      setIsLoadingAnalysis(false);
    } catch (e) {
      console.log(e);
      setIsLoadingAnalysis(false);
      //setIsLoading(false);
    }
  };

  const load = async () => {
    const localres = await sql.get(`
      SELECT *
        FROM GENESIS
        WHERE
          oid = '${oid}'
          AND
          id = '${eid}'
        LIMIT 1
    `);

    if (localres.length == 1) {
      let _offloaded = localres[0];

      setEvent(new EventModel({ ..._offloaded }));
    }

    loadDetails();
  };

  React.useEffect(() => {
    if (isLoading) return;

    loadBreakdown();
    loadAnalysis();
  }, [isLoading]);

  React.useEffect(() => {
    if (!ev) return;

    // set editables
    setName(ev.name);
    setDescription(ev.description);
    setTags(ev.tags);
    setPrivacy(ev.privacy);

    //setStartDate(ev.start.tz(ev.timezone).format("YYYY-MM-DD"));
    //setStartTime(ev.start.tz(ev.timezone).format("HH:mm"));
    //setStartDateTime(ev.start.tz(ev.timezone).format());

    // setEndTime(ev.end.tz(ev.timezone).format("HH:mm"));
    // setEndDate(ev.end.tz(ev.timezone).format("YYYY-MM-DD"));
    // setEndDateTime(ev.end.tz(ev.timezone).format());
    setTimezone(ev.timezone);
  }, [ev]);

  const onScan = async () => {
    if (isLoadingScan || scannerResult || scannerResultsDatum == null) return;
    setIsLoadingScan(true);

    try {
      if (isOfflineMode) {
        let offloaded_ticket = await validateOffloadScan(eid, scannedCode);

        if (offloaded_ticket) {
          if (offloaded_ticket.attended) {
            setScannerResult("USED_VALID_TICKET");
            setScanStamp(
              moment(offloaded_ticket.timeAttended).format("hh:mm A"),
            );

            setIsLoadingScan(false);
            return;
          }

          setScanStamp(null);
          setScannerResult("VALID");

          await sql.post(
            `
            REPLACE INTO APOCALYPSE (
              id,
              attended,
              timeAttended,
              offloaded
            ) VALUES (
              $id,
              $attended,
              $timeAttended,
              $offloaded
            );
            `,
            {
              $id: offloaded_ticket.id,
              $attended: 1,
              $timeAttended: moment().valueOf(),
              $offloaded: 1,
            },
          );

          let scanned = (
            await sql.get(`
            SELECT *
              FROM APOCALYPSE
              WHERE attended = 1
          `)
          ).length;

          let updatedEv = ev.updateScanned(scanned);
          setEvent(updatedEv);
          setIsLoadingScan(false);
          return;
        }
      }

      const res = await Api.post("/organizations/events/scan", {
        auth,
        oid,
        eid,
        tid: scannedCode,
      });
      if (res.isError) throw res.data.message;

      setScannerResult(res.data.status);

      if (res.data.timestamp) {
        setScanStamp(moment(res.data.timestamp).format("hh:mm A"));
      } else {
        setScanStamp(null);
      }
      let updatedEv = ev.updateScanned(res.data.scanned);
      setEvent(updatedEv);
      setIsLoadingScan(false);
    } catch (e) {
      if (e === "NO_EVENT") load();
      setScannerResult("INVALID_TICKET");
      setScanStamp(null);

      setIsLoadingScan(false);
    }
  };

  const handleScannerResponse = async (res) => {
    if (isLoadingScan || scannerResultsDatum != null) return;

    let { bounds, data, cornerPoints } = res;

    // tl, tr, bl, br = cornerPoints

    setScannerResultsDatum(res);
    setScannedCode(data);
  };

  const onValidateTickets = async (tickets) => {
    if (isLoadingScan || scannerResult) return;
    setIsLoadingScan(true);

    try {
      const res = await Api.post("/organizations/events/scan/validate", {
        auth,
        oid,
        eid,
        tids: tickets.map((t) => t.token),
      });
      if (res.isError) throw res.data.message;

      setScannerResult(res.data.status);
      setScannerSearchQuery("");
      setScannerSearchResults([]);
      let updatedEv = ev.updateScanned(res.data.scanned);
      setEvent(updatedEv);
    } catch (e) {
      if (e === "NO_EVENT") load();
      setIsLoadingScan(false);
    }
  };

  const onDeactivate = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/deactivate", {
        auth,
        oid,
        eid,
      });
      if (res.isError) throw res.data.message;

      load();
    } catch (e) {
      setIsLoading(false);
    }
  };

  const onSearchScan = async () => {
    setIsLoadingScan(true);

    Api.post("/organizations/events/scan/search", {
      auth,
      oid,
      eid,
      query: scannerSearchQuery,
    })
      .then((res) => {
        if (res.isError) throw res.data.message;

        setScannerSearchResults(
          res.data.queries.map((result) => {
            return {
              person: result.person,
              card4: result.card4,
              receipt: result.receipt,
              tickets: result.tickets.map(
                (ticket) => new Ticket({ ev: ev, ...ticket }),
              ),
            };
          }),
        );
        setIsLoadingScan(false);
      })
      .catch((e) => {
        setIsLoadingScan(false);
      });
  };

  const onVenueChange = async (
    venue = pickedVenue,
    venueMap = venueChangeMapPick,
  ) => {
    if (venueMap == null || venue == null) return;

    setIsLoading(true);
    setIsLoadingVenues(true);
    setVenueQuery("");
    setVenueSearchVisible(false);

    try {
      const res = await Api.post("/organizations/events/venue", {
        auth,
        oid,
        eid,
        vid: venue.identifier,
        venueMap: venueMap?.identifier,
      });
      if (res.isError) throw "e";

      setIsLoadingVenues(true);
      load();
    } catch (e) {
      console.log(e);
      setVenueSearchVisible(true);
      setIsLoadingVenues(false);
      setIsLoading(false);
    }
  };

  const onVenuePick = async (pickedVenue) => {
    let pickedId = pickedVenue.identifier;

    setPickedVenue(pickedVenue);

    if (pickedVenue.maps.length == 1) {
      setVenueChangeMapPick(pickedVenue.maps[0]);
      onVenueChange(pickedVenue, pickedVenue.maps[0]);
    } else {
      setVenueChangeMaps(pickedVenue.maps);
      setShowVenueChangeMaps(true);
    }
  };

  React.useEffect(() => {
    if (pickedVenue == null) {
      setVenueChangeMapPick(null);
      setVenueChangeMaps([]);
      setShowVenueChangeMaps(false);
    }
  }, [pickedVenue]);

  const onTierEdit = (tidx) => {
    SheetManager.show("event-tier-sheet", {
      payload: {
        event: ev,
        edit: true,
        name: ev.tiers[tidx].name,
        amount: (ev.tiers[tidx].amount / 100).toFixed(2),
        tierEditIdx: tidx,
      },
      onClose: load,
    });
  };

  const onNodeEdit = (node, nidx) => {
    SheetManager.show("event-node-tier-sheet", {
      payload: {
        event: ev,
        node: node,
        nodeIdx: nidx,
      },
      onClose: load,
    });
  };

  const onTierAdd = () => {
    SheetManager.show("event-tier-sheet", {
      payload: {
        event: ev,
        edit: false,
        name: "Default",
        amount: "",
        tierEditIdx: null,
      },
      onClose: load,
    });
  };

  const onTierTaskAdd = (node) => {
    setTierTasks([
      ...tierTasks,
      {
        identifier: tierTasks.length,
        node: node.identifier,
        amount: null,
        date: "",
        tier: "",
        valid: false,
      },
    ]);
  };

  const onTierTaskChange = (task, tier) => {
    let c = [...tierTasks];

    c.splice(task.identifier, 1, {
      identifier: task.identifier,
      node: task.node,
      date: task.date,
      amount: task.amount,
      tier: tier.identifier,
      valid: validateTaskDate(task) && tier.identifier !== "",
    });

    setTierTasks(c);
  };

  const onTaskTypeSwitch = (task, type) => {
    let c = [...tierTasks];

    if (type == "tickets") {
      c.splice(task.identifier, 1, {
        identifier: task.identifier,
        node: task.node,
        date: "2000-01-01",
        amount: 1,
        tier: task.tier,
        valid: false,
      });
    } else {
      c.splice(task.identifier, 1, {
        identifier: task.identifier,
        node: task.node,
        date: "",
        amount: null,
        tier: task.tier,
        valid: false,
      });
    }

    setTierTasks(c);
  };

  const onTaskRemove = (task) => {
    let c = [...tierTasks];
    let idx = c.findIndex((t) => t.identifier == task.identifier);
    c.splice(idx, 1);

    setTierTasks(c);
  };

  const validateTaskDate = (task) => {
    let today = moment().format("YYYY-MM-DD");
    return moment(task.date, "YYYY-MM-DD").isBetween(today, startDate);
  };

  const onDateTaskChange = (task, date) => {
    let c = [...tierTasks];

    c.splice(task.identifier, 1, {
      identifier: task.identifier,
      node: task.node,
      date: date,
      amount: null,
      tier: task.tier,
      valid: validateTaskDate({ ...task, date }) && task.tier !== "",
    });

    setTierTasks(c);
  };

  const onAmountTaskChange = (task, amount) => {
    let c = [...tierTasks];

    c.splice(task.identifier, 1, {
      identifier: task.identifier,
      node: task.node,
      date: "2000-01-01",
      amount: amount,
      tier: task.tier,
      valid: amount > 0 && task.tier !== "",
    });

    setTierTasks(c);
  };

  const onDeleteTask = async (tid) => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/tasks/delete", {
        auth,
        oid,
        eid,
        tid,
      });
      if (res.isError) throw "e";

      load();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const placeHold = async (identifier) => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/node/hold", {
        auth,
        oid,
        eid,
        identifier: identifier,
      });
      if (res.isError) throw "e";

      load();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const removeHold = async (identifier) => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/node/hold/remove", {
        auth,
        oid,
        eid,
        identifier: identifier,
      });
      if (res.isError) throw "e";

      load();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onPublish = async () => {
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/publish", {
        auth,
        oid,
        eid,
      });
      if (res.isError) throw "e";

      setPublishModalVisible(false);
      load();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    setDeleteModalVisible(false);
    setIsLoading(true);

    try {
      const res = await Api.post("/organizations/events/delete", {
        auth,
        oid,
        eid,
      });
      if (res.isError) throw "e";

      router.push({ pathname: "/organizations/[oid]/events", query: { oid } });
    } catch (e) {
      setIsLoading(false);
      setDeleteModalVisible(true);
    }
  };

  const handleSectionChange = (sec) => {
    if (sec == 24) {
      // venue
      setVenueSearchVisible(true);
      return;
    } else if (sec == 3) {
      // publish
      setPublishModalVisible(true);
      return;
    } else if (sec == 999) {
      setDeleteModalVisible(true);
      return;
    } else if (sec == 21) {
      SheetManager.show("event-about-sheet", {
        payload: {
          event: ev,
        },
        onClose: load,
      });

      return;
    } else if (sec == 22) {
      SheetManager.show("event-visibility-sheet", {
        payload: {
          event: ev,
        },
        onClose: load,
      });

      return;
    } else if (sec == 23) {
      SheetManager.show("event-date-sheet", {
        payload: {
          event: ev,
        },
        onClose: load,
      });

      return;
    }

    setSection(sec);
  };

  const onShare = async (type) => {
    try {
      if (type === "facebook") {
        Share.shareSingle({
          title: ev?.name,
          message: ev?.description,
          url: ev?.getShareables(type),
          social: Share.Social.FACEBOOK,
          type: "url",
        })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            err && console.log(err);
          });
      } else if (type === "messenger") {
        Share.shareSingle({
          title: ev?.name,
          message: ev?.description,
          url: ev?.getShareables(type),
          social: Share.Social.MESSENGER,
          type: "url",
        })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            err && console.log(err);
          });
      } else if (type === "twitter") {
        Share.shareSingle({
          title: ev?.name,
          message: ev?.description,
          url: ev?.getShareables(type),
          social: Share.Social.TWITTER,
          type: "url",
        })
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            err && console.log(err);
          });
      } else if (type === "whatsapp") {
        Linking.openURL("https://wa.me/?text=" + ev?.getShareables("whatsapp"));
      } else if (type === "email") {
        Linking.openURL(ev?.getShareables(type), "_blank");
      } else if (type === "qr") {
        let blob = await ev?.getShareables(type);
        const element = document.createElement("a");
        element.download = ev?.id + "-qr.svg";
        element.href = window.URL.createObjectURL(blob);
        element.click();
        element.remove();
      } else if (type === "copy") {
        try {
          await navigator.clipboard.writeText(ev?.getShareables());
        } catch (err) {
          console.error("Failed to copy: ", err);
        }
      }
    } catch (e) {}
  };

  const onShareScanner = async () => {
    let shareLink = {
      title: i18n.t("eventLinkSubject", { name: ev?.name }),
      url: scannerShareLink,
      subject: i18n.t("eventLinkSubject", { name: ev?.name }), //  for email
    };
    try {
      Share.open(shareLink);
    } catch (e) {}
  };

  const onOfflineScanner = async () => {
    SheetManager.show("offline-scanner", {
      payload: {
        eid,
      },
    });
  };

  const AgeLabels = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, pieCentroid, data } = slice;
      return (
        <SvgText
          key={index}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill={
            data.svg.opacity < 0.6
              ? theme["color-organizer-500"]
              : theme["color-basic-100"]
          }
          textAnchor={"middle"}
          alignmentBaseline={"middle"}
          fontSize={data.svg.opacity < 0.6 ? 12 : 20}
          stroke={
            data.svg.opacity < 0.6
              ? theme["color-organizer-500"]
              : theme["color-basic-100"]
          }
          strokeWidth={0.4}
          adjustsFontSizeToFit
        >
          {data.label}
        </SvgText>
      );
    });
  };

  const onShowPhysicalTicketsGenerator = async () => {
    SheetManager.show("event-physical-tickets-sheet", {
      payload: {
        event: ev,
      },
      onClose: load,
    });
  };

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("(organization)/events");
    }
  };

  // const initNFC = async () => {
  //   try {
  //     // register for the NFC tag with NDEF in it
  //     await NfcManager.requestTechnology(NfcTech.Ndef, {
  //       readerModeFlags: NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
  //       isReaderModeEnabled: false,
  //       alertMessage: i18n.t("nfcTicketScan", {
  //         remaining: ev.attendees - ev.scanned,
  //       }),
  //     });
  //     // the resolved tag object will contain `ndefMessage` property
  //     const tag = await NfcManager.getTag();

  //     setScannerResult("INVALID_TICKET");
  //     setScannerResultsDatum("2434553");
  //   } catch (ex) {
  //     //setNFCMode(false);
  //     NfcManager.cancelTechnologyRequest();
  //   } finally {
  //     NfcManager.cancelTechnologyRequest();
  //   }
  // };

  React.useEffect(() => {
    // if (ev?.promptScanner) {
    //   if (section == 4) {
    //     initNFC();
    //   } else {
    //     NfcManager.cancelTechnologyRequest();
    //   }
    // }
    // if (section == 4 && nfcMode) {
    //   initNFC();
    // } else {
    //   NfcManager.cancelTechnologyRequest();
    // }
  }, [section, nfcMode]);

  if (!isLoading && !hasPermission) {
    return <LockedView />;
  }

  if (isLoading || !ev)
    return (
      <LayoutContainer paddingHorizontal={10}>
        <TouchableOpacity
          style={[
            Style.button.round,
            Style.elevated,
            { zIndex: 100, padding: 0, position: "absolute", left: 0 },
          ]}
          onPress={onClose}
        >
          <Feather name="x" size={20} color={theme["color-basic-700"]} />
        </TouchableOpacity>

        <View
          style={[
            Style.containers.row,
            Style.button.disabled,
            { alignItems: "flex-start", justifyContent: "flex-end" },
          ]}
        >
          <View style={[{ padding: 14 }, Style.containers.column]}>
            <Feather
              color={
                section == 0
                  ? theme["color-organizer-500"]
                  : theme["color-basic-700"]
              }
              name="bar-chart-2"
              size={26}
            />
            {section == 0 && (
              <Text style={[Style.text.organizer, Style.text.semibold]}>
                {i18n.t("overview")}
              </Text>
            )}
          </View>
          <View style={[{ padding: 14 }, Style.containers.column]}>
            <Ionicons
              color={
                section == 1
                  ? theme["color-organizer-500"]
                  : theme["color-basic-700"]
              }
              name="wallet-outline"
              size={26}
            />
            {section == 1 && (
              <Text style={[Style.text.organizer, Style.text.semibold]}>
                {i18n.t("sales")}
              </Text>
            )}
          </View>
          <View style={[{ padding: 14 }, Style.containers.column]}>
            <Feather
              color={
                section == 25
                  ? theme["color-organizer-500"]
                  : theme["color-basic-700"]
              }
              name="octagon"
              size={26}
            />
            {section == 25 && (
              <Text style={[Style.text.organizer, Style.text.semibold]}>
                {i18n.t("holds")}
              </Text>
            )}
          </View>
          <View style={[{ padding: 14 }, Style.containers.column]}>
            <Feather
              color={
                section == 3
                  ? theme["color-organizer-500"]
                  : theme["color-basic-700"]
              }
              name="file-text"
              size={26}
            />
            {section == 3 && (
              <Text style={[Style.text.organizer, Style.text.semibold]}>
                {i18n.t("reports")}
              </Text>
            )}
          </View>
          {ev?.promptScanner && (
            <View style={[{ padding: 14 }, Style.containers.column]}>
              <MaterialCommunityIcons
                color={
                  section == 4
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="qrcode-scan"
                size={26}
              />
              {section == 4 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("scanner")}
                </Text>
              )}
            </View>
          )}
        </View>
        <View
          style={[
            Style.containers.row,
            { justifyContent: "flex-start", marginTop: 20 },
          ]}
        >
          {ev != null ? (
            <Text style={[Style.text.dark, Style.text.normal]}>
              {ev?.getStart("dddd - MMM Do, YYYY")}
            </Text>
          ) : (
            <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
              <SkeletonLoader.Container
                style={[
                  {
                    backgroundColor: "transparent",
                    width: 120,
                    borderRadius: 4,
                    overflow: "hidden",
                    height: 30,
                  },
                ]}
              >
                <SkeletonLoader.Item
                  style={[
                    {
                      backgroundColor: "transparent",
                      width: 120,
                      height: 30,
                    },
                  ]}
                />
              </SkeletonLoader.Container>
            </SkeletonLoader>
          )}
        </View>
        {ev != null ? (
          <Text
            style={[
              Style.text.organizer,
              Style.text.bold,
              Style.text.xxl,
              { paddingVertical: 8 },
            ]}
          >
            {ev.name}
          </Text>
        ) : (
          <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
            <SkeletonLoader.Container
              style={[
                {
                  backgroundColor: "transparent",
                  width: 250,
                  borderRadius: 4,
                  overflow: "hidden",
                  height: 45,
                  marginTop: 12,
                  marginBottom: 14,
                },
              ]}
            >
              <SkeletonLoader.Item
                style={[
                  {
                    backgroundColor: "transparent",
                    width: 250,
                    height: 45,
                  },
                ]}
              />
            </SkeletonLoader.Container>
          </SkeletonLoader>
        )}
        <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
          <SkeletonLoader.Container
            style={[
              {
                backgroundColor: "transparent",
                width: 200,
                borderRadius: 4,
                overflow: "hidden",
                height: 30,
              },
            ]}
          >
            <SkeletonLoader.Item
              style={[
                {
                  backgroundColor: "transparent",
                  width: 200,
                  height: 30,
                },
              ]}
            />
          </SkeletonLoader.Container>
        </SkeletonLoader>
        <View style={[Style.containers.row, { height: 150, marginTop: 25 }]}>
          <View
            style={[
              Style.containers.column,
              {
                flex: 1,
                marginHorizontal: 10,
                paddingHorizontal: 15,
                paddingTop: 5,
                borderRadius: 8,
                backgroundColor: theme["color-basic-400"],
                justifyContent: "flex-start",
              },
            ]}
          >
            <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
              <SkeletonLoader.Container
                style={[
                  {
                    backgroundColor: "transparent",
                    width: 80,
                    borderRadius: 4,
                    overflow: "hidden",
                    height: 40,
                    marginTop: 12,
                    marginBottom: 14,
                  },
                ]}
              >
                <SkeletonLoader.Item
                  style={[
                    {
                      backgroundColor: "transparent",
                      width: 250,
                      height: 40,
                    },
                  ]}
                />
              </SkeletonLoader.Container>
            </SkeletonLoader>

            <MaterialCommunityIcons
              name="wallet-outline"
              size={26}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.dark,
                Style.text.lg,
                Style.text.semibold,
                {
                  paddingVertical: 10,
                  flex: 1,
                },
              ]}
            >
              {i18n.t("sales")}
            </Text>
          </View>
        </View>
        <View style={[Style.containers.row, { height: 150, marginTop: 10 }]}>
          <View
            style={[
              Style.containers.column,
              {
                flex: 1,
                marginHorizontal: 10,
                paddingHorizontal: 15,
                paddingTop: 5,
                borderRadius: 8,
                backgroundColor: theme["color-basic-400"],
              },
            ]}
          >
            <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
              <SkeletonLoader.Container
                style={[
                  {
                    backgroundColor: "transparent",
                    width: 80,
                    borderRadius: 4,
                    overflow: "hidden",
                    height: 40,
                    marginTop: 10,
                    marginBottom: 14,
                  },
                ]}
              >
                <SkeletonLoader.Item
                  style={[
                    {
                      backgroundColor: "transparent",
                      width: 250,
                      height: 40,
                    },
                  ]}
                />
              </SkeletonLoader.Container>
            </SkeletonLoader>

            <Octicons
              name="verified"
              size={26}
              color={theme["color-basic-700"]}
            />
            <Text
              numberOfLines={2}
              style={[
                Style.text.dark,
                Style.text.lg,
                Style.text.semibold,
                {
                  flex: 1,
                  textAlign: "center",
                  paddingVertical: 10,
                },
              ]}
            >
              {i18n.t("verifiedAttendees")}
            </Text>
          </View>
          <View
            style={[
              Style.containers.column,
              {
                flex: 1,
                marginHorizontal: 10,
                paddingHorizontal: 15,
                paddingTop: 5,
                borderRadius: 8,
                justifyContent: "flex-start",
                backgroundColor: theme["color-basic-400"],
              },
            ]}
          >
            <SkeletonLoader highlightColor="#DDD" boneColor="#EEE">
              <SkeletonLoader.Container
                style={[
                  {
                    backgroundColor: "transparent",
                    width: 80,
                    borderRadius: 4,
                    overflow: "hidden",
                    height: 40,
                    marginTop: 10,
                    marginBottom: 14,
                  },
                ]}
              >
                <SkeletonLoader.Item
                  style={[
                    {
                      backgroundColor: "transparent",
                      width: 250,
                      height: 40,
                    },
                  ]}
                />
              </SkeletonLoader.Container>
            </SkeletonLoader>

            <Feather
              name="bar-chart"
              size={26}
              color={theme["color-basic-700"]}
            />
            <Text
              style={[
                Style.text.dark,
                Style.text.lg,
                Style.text.semibold,
                {
                  paddingVertical: 10,
                  flex: 1,
                },
              ]}
            >
              {i18n.t("views")}
            </Text>
          </View>
        </View>

        <View style={[Style.containers.row, { marginTop: 30 }]}>
          <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
            {i18n.t("salesBreakdown")}
          </Text>
          <View style={{ flex: 1 }} />
          <Ionicons
            name="layers-outline"
            size={22}
            color={theme["color-basic-700"]}
          />
        </View>
        <Text
          style={[Style.text.dark, Style.text.normal, { marginVertical: 6 }]}
        >
          {i18n.t("salesBreakdownDesc")}
        </Text>

        <ActivityIndicator
          size={20}
          color={theme["color-organizer-500"]}
          style={{ alignSelf: "center", marginTop: 6 }}
        />

        <View style={[Style.containers.row, { marginTop: 30 }]}>
          <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
            {i18n.t("salesAnalyticsX", { amount: salesAmount })}
          </Text>
          <View style={{ flex: 1 }} />
          <Entypo
            name="line-graph"
            size={22}
            color={theme["color-basic-700"]}
          />
        </View>
        <Text
          style={[Style.text.dark, Style.text.normal, { marginVertical: 6 }]}
        >
          {i18n.t("salesAnalyticsDesc")}
        </Text>

        <ActivityIndicator
          size={20}
          color={theme["color-organizer-500"]}
          style={{ alignSelf: "center", marginTop: 10 }}
        />

        <View style={[Style.containers.row, { marginTop: 30 }]}>
          <Text style={[Style.text.dark, Style.text.bold, Style.text.xxl]}>
            {i18n.t("ageDist", { amount: salesAmount })}
          </Text>
          <View style={{ flex: 1 }} />
          <MaterialCommunityIcons
            name="cake-variant-outline"
            size={28}
            color={theme["color-basic-700"]}
          />
        </View>

        <ActivityIndicator
          size={20}
          color={theme["color-organizer-500"]}
          style={{ alignSelf: "center", marginTop: 10 }}
        />
      </LayoutContainer>
    );

  if (
    (section == 0 && !canViewDashboard) ||
    (section == 25 && !canViewTiers) ||
    (section == 2 && !canViewSales) ||
    (section == 3 && !canViewSales) ||
    (section == 4 && !canViewScanner)
  )
    return (
      <>
        <LayoutContainer>
          <TouchableOpacity
            style={[
              Style.button.round,
              Style.elevated,
              { zIndex: 100, padding: 0, position: "absolute", left: 0 },
            ]}
            onPress={onClose}
          >
            <Feather name="x" size={20} color={theme["color-basic-700"]} />
          </TouchableOpacity>
          <View
            style={[
              Style.containers.row,
              { alignItems: "flex-start", justifyContent: "flex-end" },
            ]}
          >
            {canViewDashboard && (
              <TouchableOpacity
                onPress={() => setSection(0)}
                style={[{ padding: 14 }, Style.containers.column]}
              >
                <Feather
                  color={
                    section == 0
                      ? theme["color-organizer-500"]
                      : theme["color-basic-700"]
                  }
                  name="bar-chart-2"
                  size={26}
                />
                {section == 0 && (
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("overview")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {canViewSales && (
              <TouchableOpacity
                onPress={() => setSection(1)}
                style={[{ padding: 14 }, Style.containers.column]}
              >
                <Ionicons
                  color={
                    section == 1
                      ? theme["color-organizer-500"]
                      : theme["color-basic-700"]
                  }
                  name="wallet-outline"
                  size={26}
                />
                {section == 1 && (
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("sales")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {canViewTiers && (
              <TouchableOpacity
                onPress={() => setSection(25)}
                style={[{ padding: 14 }, Style.containers.column]}
              >
                <MaterialCommunityIcons
                  color={
                    section == 25
                      ? theme["color-organizer-500"]
                      : theme["color-basic-700"]
                  }
                  name="ticket-percent-outline"
                  size={26}
                />
                {section == 25 && (
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("ticketing")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {canViewSales && (
              <TouchableOpacity
                onPress={() => setSection(3)}
                style={[{ padding: 14 }, Style.containers.column]}
              >
                <Feather
                  color={
                    section == 3
                      ? theme["color-organizer-500"]
                      : theme["color-basic-700"]
                  }
                  name="file-text"
                  size={26}
                />
                {section == 3 && (
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("reports")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {canViewScanner && ev?.promptScanner && (
              <TouchableOpacity
                onPress={() => setSection(4)}
                style={[{ padding: 14 }, Style.containers.column]}
              >
                <MaterialCommunityIcons
                  color={
                    section == 4
                      ? theme["color-organizer-500"]
                      : theme["color-basic-700"]
                  }
                  name="qrcode-scan"
                  size={26}
                />
                {section == 4 && (
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("scanner")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          <LockedView />
        </LayoutContainer>
      </>
    );

  return (
    <SheetProvider>
      <ScrollContainer
        _ref={scrollContainer}
        style={{ paddingBottom: 0 }}
        paddingHorizontal={0}
      >
        <TouchableOpacity
          style={[
            Style.button.round,
            Style.elevated,
            { zIndex: 100, padding: 0, position: "absolute", left: 0 },
          ]}
          onPress={onClose}
        >
          <Feather name="x" size={20} color={theme["color-basic-700"]} />
        </TouchableOpacity>

        <View
          style={[
            Style.containers.row,
            { alignItems: "flex-start", justifyContent: "flex-end" },
          ]}
        >
          {canViewDashboard && (
            <TouchableOpacity
              onPress={() => setSection(0)}
              style={[{ padding: 14 }, Style.containers.column]}
            >
              <Feather
                color={
                  section == 0
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="bar-chart-2"
                size={26}
              />
              {section == 0 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("overview")}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {canViewSales && (
            <TouchableOpacity
              onPress={() => setSection(1)}
              style={[{ padding: 14 }, Style.containers.column]}
            >
              <Ionicons
                color={
                  section == 1
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="wallet-outline"
                size={26}
              />
              {section == 1 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("sales")}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {canViewTiers && (
            <TouchableOpacity
              onPress={() => setSection(25)}
              style={[{ padding: 14 }, Style.containers.column]}
            >
              <MaterialCommunityIcons
                color={
                  section == 25
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="ticket-percent-outline"
                size={26}
              />
              {section == 25 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("ticketing")}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {canViewSales && (
            <TouchableOpacity
              onPress={() => setSection(3)}
              style={[{ padding: 14 }, Style.containers.column]}
            >
              <Feather
                color={
                  section == 3
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="file-text"
                size={26}
              />
              {section == 3 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("reports")}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {canViewScanner && ev?.promptScanner && (
            <TouchableOpacity
              onPress={() => setSection(4)}
              style={[{ padding: 14 }, Style.containers.column]}
            >
              <MaterialCommunityIcons
                color={
                  section == 4
                    ? theme["color-organizer-500"]
                    : theme["color-basic-700"]
                }
                name="qrcode-scan"
                size={26}
              />
              {section == 4 && (
                <Text style={[Style.text.organizer, Style.text.semibold]}>
                  {i18n.t("scanner")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <View style={[Style.containers.row]}>
            <Text style={[Style.text.dark, Style.text.normal]}>
              {ev.getStart("dddd - MMM Do, YYYY")}
            </Text>
            <View style={{ flex: 1 }} />

            <View
              style={[
                Style.badge,
                {
                  backgroundColor: theme["color-organizer-500"],
                  shadowColor: theme["color-organizer-500"],
                },
              ]}
            >
              <Text style={[Style.text.basic, Style.text.bold, Style.text.sm]}>
                {ev.status}
              </Text>
            </View>
          </View>
          <Text
            style={[
              Style.text.organizer,
              Style.text.bold,
              Style.text.xxl,
              { paddingVertical: 8 },
            ]}
          >
            {ev.name}
          </Text>
          {ev.venue && (
            <Text style={[Style.text.dark, Style.text.normal]}>
              {ev.venue.city}, {ev.venue.region_ab} -{" "}
              {ev.venue ? ev.venue.name : ""}
            </Text>
          )}
          {section == 0 && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginVertical: 15,
                  left: -20,
                  width,
                }}
                contentContainerStyle={{
                  paddingHorizontal: 10,
                }}
              >
                {ev.promptScanner && (
                  <View
                    style={[
                      Style.cardBlank,
                      {
                        width: width * 0.8,
                        maxWidth: 350,
                        marginHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          Style.text.organizer,
                          Style.text.bold,
                          Style.text.xxl,
                          { paddingVertical: 20, textAlign: "center" },
                        ]}
                      >
                        {i18n.t("scannerAvailable")}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setSection(4)}
                        style={[
                          Style.button.container,
                          Style.elevated,
                          {
                            backgroundColor: theme["color-organizer-500"],
                            shadowColor: theme["color-organizer-500"],
                          },
                        ]}
                      >
                        <Text style={[Style.button.text, Style.text.semibold]}>
                          {i18n.t("scan")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {ev.promptDeactivate && (
                  <View
                    style={[
                      Style.cardBlank,
                      {
                        width: width * 0.8,
                        maxWidth: 350,
                        marginHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          Style.text.danger,
                          Style.text.bold,
                          Style.text.xl,
                          { paddingBottom: 4, textAlign: "center" },
                        ]}
                      >
                        {i18n.t("readyToEnd")}
                      </Text>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.normal,
                          { paddingBottom: 20, textAlign: "center" },
                        ]}
                      >
                        {i18n.t("readyToEndDesc")}
                      </Text>

                      <TouchableOpacity
                        onPress={onDeactivate}
                        style={[
                          Style.button.container,
                          Style.elevated,
                          {
                            backgroundColor: theme["color-danger-500"],
                            shadowColor: theme["color-danger-500"],
                          },
                        ]}
                      >
                        <Text style={[Style.button.text, Style.text.semibold]}>
                          {i18n.t("endSales")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {!ev?.draft && !ev?.active && (
                  <View
                    style={[
                      Style.cardBlank,
                      {
                        width: width * 0.8,
                        maxWidth: 350,
                        marginHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 20,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Style.text.organizer,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "center" },
                      ]}
                    >
                      {i18n.t("eventFinished")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.semibold,
                        { paddingVertical: 15 },
                      ]}
                    >
                      {ReplaceWithStyle(
                        i18n.t("eventFinishedDesc"),
                        "{overview}",
                        <Text
                          style={[Style.text.organizer, Style.text.semibold]}
                        >
                          {i18n.t("overview")}
                        </Text>,
                      )}
                    </Text>
                    {ev?.payoutStatus == "PAID" && (
                      <Text
                        style={[
                          Style.text.success,
                          Style.text.semibold,
                          Style.text.lg,
                          { textAlign: "center" },
                        ]}
                      >
                        {i18n.t("payoutSent")}
                      </Text>
                    )}
                  </View>
                )}

                <View
                  style={[
                    Style.cardBlank,
                    {
                      width: width * 0.8,
                      maxWidth: 350,
                      marginHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "center" },
                      ]}
                    >
                      {i18n.t("shareEvent")}
                    </Text>
                    {ev.shortLink !== "" && (
                      <Text
                        selectable
                        selectionColor={theme["color-organizer-200"]}
                        style={[
                          Style.text.organizer,
                          Style.text.semibold,
                          { textAlign: "center", paddingVertical: 15 },
                        ]}
                      >
                        {ev.shortLink}
                        {"  "}
                        <Feather
                          name="copy"
                          size={18}
                          color={theme["color-basic-700"]}
                        />
                      </Text>
                    )}
                    {ev.shortLink == "" && (
                      <Text
                        selectable
                        selectionColor={theme["color-organizer-200"]}
                        style={[
                          Style.text.organizer,
                          Style.text.semibold,
                          { textAlign: "center", paddingVertical: 15 },
                        ]}
                      >
                        {Config.basePath}/events/{eid}
                        {"  "}
                        <Feather
                          name="copy"
                          size={18}
                          color={theme["color-basic-700"]}
                        />
                      </Text>
                    )}
                    <View style={[Style.containers.row]}>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 15 }}
                          onPress={() => onShare("qr")}
                        >
                          <MaterialCommunityIcons
                            name="qrcode"
                            size={26}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 15 }}
                          onPress={() => onShare("facebook")}
                        >
                          <Feather
                            name="facebook"
                            size={26}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ padding: 15 }}
                          onPress={() => onShare("messenger")}
                        >
                          <MaterialCommunityIcons
                            name="facebook-messenger"
                            size={26}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 15 }}
                          onPress={() => onShare("whatsapp")}
                        >
                          <MaterialCommunityIcons
                            name="whatsapp"
                            size={26}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 15 }}
                          onPress={() => onShare("twitter")}
                        >
                          <FontAwesome6
                            name="x-twitter"
                            size={26}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={[Style.containers.column]}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 15 }}
                          onPress={() => onShare("email")}
                        >
                          <MaterialCommunityIcons
                            name="email-fast-outline"
                            size={32}
                            color={theme["color-basic-700"]}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                {(ev?.draft || ev?.active) && (
                  <View
                    style={[
                      Style.cardBlank,
                      {
                        width: width * 0.8,
                        maxWidth: 350,
                        marginHorizontal: 10,
                        marginTop: 10,
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.bold,
                          Style.text.xl,
                          { textAlign: "center", paddingBottom: 15 },
                        ]}
                      >
                        {i18n.t("eventChecklist")}
                      </Text>
                      {TODOS.filter((t) =>
                        ev?.active ? !t.hideOnActive : true,
                      ).map((todo, tidx) => (
                        <Pressable
                          onPress={() => handleSectionChange(todo.section)}
                          key={todo.id}
                          style={[
                            Style.containers.row,
                            {
                              width: "100%",
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                            },
                          ]}
                        >
                          {todos.includes(todo.id) ? (
                            <Feather
                              name="check"
                              size={20}
                              color={theme["color-basic-700"]}
                            />
                          ) : (
                            <Text>{"         "}</Text>
                          )}
                          <Text
                            style={[
                              Style.text.semibold,
                              Style.text.lg,
                              {
                                color: todos.includes(todo.id)
                                  ? theme["color-basic-700"]
                                  : theme["color-organizer-500"],
                              },
                            ]}
                          >
                            {"  "}
                            {todo.text}
                          </Text>
                          <View style={{ flex: 1 }} />
                          <Text
                            style={[
                              Style.text.semibold,
                              { color: theme["color-organizer-500"] },
                            ]}
                          >
                            {todo.edit}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={[Style.containers.row]}>
                <View
                  style={[
                    Style.containers.column,
                    {
                      flex: 1,
                      marginHorizontal: 2,
                      marginBottom: 10,
                      paddingHorizontal: 15,
                      paddingTop: 5,
                      borderRadius: 8,
                      backgroundColor: theme["color-basic-400"],
                      justifyContent: "flex-start",
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      Style.text.dark,
                      Style.text.xxxl,
                      Style.text.semibold,
                      {
                        paddingVertical: 10,
                      },
                    ]}
                  >
                    {ev.getSales()}
                  </Text>

                  <MaterialCommunityIcons
                    name="wallet-outline"
                    size={32}
                    color={theme["color-basic-700"]}
                  />
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.text.semibold,
                      {
                        paddingVertical: 10,
                        flex: 1,
                      },
                    ]}
                  >
                    {i18n.t("sales")}
                  </Text>
                </View>
              </View>
              <View style={[Style.containers.row]}>
                <View
                  style={[
                    Style.containers.column,
                    {
                      flex: 1,
                      marginRight: 4,
                      paddingHorizontal: 15,
                      paddingTop: 5,
                      borderRadius: 8,
                      backgroundColor: theme["color-basic-400"],
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      Style.text.dark,
                      Style.text.xxxl,
                      Style.text.semibold,
                      {
                        paddingVertical: 10,
                      },
                    ]}
                  >
                    {ev.getAttendees()}
                  </Text>

                  <Octicons
                    name="verified"
                    size={26}
                    color={theme["color-basic-700"]}
                  />
                  <Text
                    numberOfLines={2}
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.text.semibold,
                      {
                        flex: 1,
                        textAlign: "center",
                        paddingVertical: 10,
                      },
                    ]}
                  >
                    {i18n.t("verifiedAttendees")}
                  </Text>
                </View>
                <View
                  style={[
                    Style.containers.column,
                    {
                      flex: 1,
                      marginLeft: 4,
                      paddingHorizontal: 15,
                      paddingTop: 5,
                      borderRadius: 8,
                      justifyContent: "flex-start",
                      backgroundColor: theme["color-basic-400"],
                    },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={[
                      Style.text.dark,
                      Style.text.xxxl,
                      Style.text.semibold,
                      {
                        textAlign: "center",
                        paddingVertical: 10,
                      },
                    ]}
                  >
                    {ev.getViews()}
                  </Text>

                  <Feather
                    name="bar-chart"
                    size={26}
                    color={theme["color-basic-700"]}
                  />
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.text.semibold,
                      {
                        paddingVertical: 10,
                        flex: 1,
                      },
                    ]}
                  >
                    {i18n.t("views")}
                  </Text>
                </View>
              </View>

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("salesBreakdown")}
                </Text>
                <View style={{ flex: 1 }} />
                <Ionicons
                  name="layers-outline"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("salesBreakdownDesc")}
              </Text>
              {isLoadingBreakdown && (
                <ActivityIndicator
                  size={20}
                  color={theme["color-organizer-500"]}
                  style={{ alignSelf: "center", paddingVertical: 10 }}
                />
              )}
              {!isLoadingBreakdown &&
                tierSales.map((tier, tidx) => (
                  <View
                    key={"tier-" + tidx}
                    style={[Style.containers.row, { paddingVertical: 15 }]}
                  >
                    <View
                      style={[
                        Style.badge,
                        {
                          backgroundColor: theme["color-organizer-500"],
                          shadowColor: theme["color-organizer-500"],
                          marginRight: 6,
                          alignSelf: "center",
                        },
                      ]}
                    >
                      <Text style={[Style.text.basic, Style.text.bold]}>
                        Tier - {tier.name}
                      </Text>
                    </View>

                    <View
                      style={[
                        Style.containers.column,
                        { alignItems: "flex-start", marginLeft: 8 },
                      ]}
                    >
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.semibold,
                          Style.text.lg,
                        ]}
                      >
                        {Commasize(tier.sold)}
                      </Text>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.transparency.md,
                          Style.text.normal,
                        ]}
                      >
                        {i18n.t("ticketsSold")}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }} />

                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.lg,
                        Style.text.normal,
                        {
                          marginHorizontal: 8,
                          maxWidth: "35%",
                        },
                      ]}
                    >
                      ${CurrencyFormatter(tier.price)}
                    </Text>
                  </View>
                ))}
              {/* {Object.keys(addonsGrouped).map((price, pidx) => (
                <Table.Row key={"ADDON" + pidx}>
                  <Table.Cell>
                    <Badge enableShadow disableOutline color="primary">
                      Table Group #{pidx + 1}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Text align="center">{addonsGrouped[price].length}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text align="center">
                      ${CurrencyFormatter(addonsGrouped[price][0].price)}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              ))} */}

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("salesAnalyticsX", { amount: ev.getSales() })}
                </Text>
                <View style={{ flex: 1 }} />
                <Entypo
                  name="line-graph"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("salesAnalyticsDesc")}
              </Text>
              {isLoadingAnalysis && (
                <ActivityIndicator
                  size={20}
                  color={theme["color-organizer-500"]}
                  style={{ alignSelf: "center", paddingVertical: 10 }}
                />
              )}
              {!isLoadingAnalysis && !enoughSalesDataPoints && (
                <>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginTop: 10, marginBottom: 6 },
                    ]}
                  >
                    {i18n.t("waitingForData")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("waitingDataAttendees")}
                  </Text>
                </>
              )}
              {!isLoadingAnalysis && enoughSalesDataPoints && (
                <>
                  <View style={{ height: 200, padding: 0, marginTop: 20 }}>
                    <BarChart
                      style={{ flex: 1 }}
                      data={dataPoints?.sales.map((s) => s.value)}
                      gridMin={0}
                      svg={{ fill: theme["color-organizer-500"] }}
                    />
                    <XAxis
                      style={{ marginTop: 10 }}
                      data={dataPoints?.sales.map((s) => s.value)}
                      scale={scale.scaleBand}
                      formatLabel={(value, index) =>
                        moment(dataPoints?.sales[index].date).format("MMM DD")
                      }
                      labelStyle={{ color: theme["color-basic-700"] }}
                    />
                  </View>
                </>
              )}

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("ageDist", { amount: salesAmount })}
                </Text>
                <View style={{ flex: 1 }} />
                <MaterialCommunityIcons
                  name="cake-variant-outline"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("ageDistDesc")}
              </Text>

              {isLoadingAnalysis && (
                <ActivityIndicator
                  size={20}
                  color={theme["color-organizer-500"]}
                  style={{ alignSelf: "center", paddingVertical: 10 }}
                />
              )}
              {!isLoadingAnalysis && !enoughAgeDataPoints && (
                <>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginTop: 6, marginBottom: 6 },
                    ]}
                  >
                    {i18n.t("waitingForData")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("waitingDataAge")}
                  </Text>
                </>
              )}

              {!isLoadingAnalysis && enoughAgeDataPoints && (
                <>
                  <PieChart
                    style={{ height: 200, marginTop: 20 }}
                    valueAccessor={({ item }) => item.value}
                    data={
                      dataPoints?.ages?.map((dp, dpidx) => {
                        return {
                          key: dpidx + 1,
                          value: dp.value * 100,
                          label: dp.label,
                          svg: {
                            fill: theme["color-organizer-500"],
                            opacity: dp.color,
                          },
                        };
                      }) || []
                    }
                    spacing={0}
                    innerRadius={10}
                    outerRadius={"96%"}
                  >
                    <AgeLabels />
                  </PieChart>
                </>
              )}

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("viewsMap", { amount: ev.getSales() })}
                </Text>
                <View style={{ flex: 1 }} />
                <Feather
                  name="map-pin"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("viewsMapDesc")}
              </Text>

              {isLoadingAnalysis && (
                <ActivityIndicator
                  size={20}
                  color={theme["color-organizer-500"]}
                  style={{ alignSelf: "center", paddingVertical: 10 }}
                />
              )}
              {!isLoadingAnalysis && !enoughMapDataPoints && (
                <>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginTop: 10, marginBottom: 6 },
                    ]}
                  >
                    {i18n.t("waitingForData")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("waitingDataMapView")}
                  </Text>
                </>
              )}
              {!isLoadingAnalysis && enoughMapDataPoints && (
                <>
                  <View
                    style={{
                      height: height * 0.5,
                      borderRadius: 8,
                      overflow: "hidden",
                      padding: 0,
                      marginTop: 20,
                    }}
                  >
                    <MapComponent
                      isOrganizer
                      heatmap={dataPoints.views}
                      zoom={6}
                      center={ev?.venue?.center}
                    />
                  </View>
                </>
              )}
            </View>
          )}

          {section == 1 && (
            <View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginVertical: 15,
                  left: -20,
                  width,
                }}
                contentContainerStyle={{
                  paddingHorizontal: 10,
                }}
              >
                <View
                  style={[
                    Style.cardBlank,
                    {
                      width: width * 0.8,
                      maxWidth: 350,
                      marginHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View style={{ width: "100%" }}>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("grossSales")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.transparency.md,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("grossSalesDesc")}
                    </Text>
                    <View style={[Style.containers.row, { marginTop: 20 }]}>
                      <Text
                        style={[
                          Style.text.xxl,
                          Style.text.dark,
                          Style.text.bold,
                        ]}
                      >
                        ${CurrencyFormatter(salesAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Style.cardBlank,
                    {
                      width: width * 0.8,
                      maxWidth: 350,
                      marginHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View style={{ width: "100%" }}>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("promoterEarnings")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.transparency.md,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("promoterEarningsDesc")}
                    </Text>
                    <View style={[Style.containers.row, { marginTop: 20 }]}>
                      <Text
                        style={[
                          Style.text.xxl,
                          Style.text.dark,
                          Style.text.bold,
                        ]}
                      >
                        ${CurrencyFormatter(promoterEarnings)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Style.cardBlank,
                    {
                      width: width * 0.8,
                      maxWidth: 350,
                      marginHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View style={{ width: "100%" }}>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("bumpEarnings")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.transparency.md,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("bumpEarningsDesc")}
                    </Text>
                    <View style={[Style.containers.row, { marginTop: 20 }]}>
                      <Text
                        style={[
                          Style.text.xxl,
                          Style.text.dark,
                          Style.text.bold,
                        ]}
                      >
                        ${CurrencyFormatter(venueEarnings)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    Style.cardBlank,
                    {
                      width: width * 0.8,
                      maxWidth: 350,
                      marginHorizontal: 10,
                      marginTop: 10,
                      marginBottom: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View style={{ width: "100%" }}>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.bold,
                        Style.text.xl,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("taxesCollected")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.transparency.md,
                        { textAlign: "left" },
                      ]}
                    >
                      {i18n.t("taxesCollectedDesc")}
                    </Text>
                    <View style={[Style.containers.row, { marginTop: 20 }]}>
                      <Text
                        style={[
                          Style.text.xxl,
                          Style.text.dark,
                          Style.text.bold,
                        ]}
                      >
                        ${CurrencyFormatter(taxCollected)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={[Style.containers.row, { marginTop: 10 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("availability")}
                </Text>
                <View style={{ flex: 1 }} />
                <MaterialCommunityIcons
                  name="view-grid-plus-outline"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("availabilityDesc")}
              </Text>

              {ev.nodes
                .filter((n) => !n.isDecorative && n.isExposed)
                .map((node, nidx) => (
                  <View
                    key={"node-" + nidx}
                    style={[Style.containers.row, { paddingVertical: 15 }]}
                  >
                    <View
                      style={[
                        Style.badge,
                        {
                          backgroundColor: theme["color-organizer-500"],
                          shadowColor: theme["color-organizer-500"],
                          marginRight: 6,
                          alignSelf: "center",
                        },
                      ]}
                    >
                      <Text style={[Style.text.basic, Style.text.bold]}>
                        {node.type == "ga-sec" && (
                          <>
                            {node.text} - {node.getIdentifier()}
                          </>
                        )}
                        {node.type == "seat" && <>{node.getTitle(ev.nodes)}</>}
                      </Text>
                    </View>

                    <View
                      style={[
                        Style.containers.column,
                        { alignItems: "flex-start", marginLeft: 8 },
                      ]}
                    >
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.semibold,
                          Style.text.lg,
                        ]}
                      >
                        {Commasize(node.capacity - node.booked - node.holdings)}
                      </Text>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.transparency.md,
                          Style.text.normal,
                        ]}
                      >
                        {i18n.t("ticketsAvailable")}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }} />

                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.lg,
                        Style.text.normal,
                        {
                          marginHorizontal: 8,
                          maxWidth: "35%",
                        },
                      ]}
                    >
                      {Commasize(node.booked)}
                    </Text>
                  </View>
                ))}

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("salesByPrice")}
                </Text>
                <View style={{ flex: 1 }} />
                <MaterialCommunityIcons
                  name="ballot-outline"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {i18n.t("salesByPriceDesc")}
              </Text>

              {tierSales.map((tier, nidx) => (
                <View
                  key={"tier-sa-" + nidx}
                  style={[Style.containers.row, { paddingVertical: 15 }]}
                >
                  <View
                    style={[
                      Style.badge,
                      {
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                        marginRight: 6,
                        alignSelf: "center",
                      },
                    ]}
                  >
                    <Text style={[Style.text.basic, Style.text.bold]}>
                      {tier.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      Style.containers.column,
                      { alignItems: "flex-start", marginLeft: 8 },
                    ]}
                  >
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.semibold,
                        Style.text.lg,
                      ]}
                    >
                      {tier.sold}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.transparency.md,
                        Style.text.normal,
                      ]}
                    >
                      {i18n.t("ticketsSold")}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }} />

                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.text.normal,
                      {
                        marginHorizontal: 8,
                        maxWidth: "35%",
                      },
                    ]}
                  >
                    ${CurrencyFormatter(tier.price)}
                  </Text>
                </View>
              ))}

              <View style={[Style.containers.row, { marginTop: 30 }]}>
                <Text style={[Style.text.dark, Style.text.bold, Style.text.xl]}>
                  {i18n.t("purchases")}
                </Text>
                <View style={{ flex: 1 }} />
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={22}
                  color={theme["color-basic-700"]}
                />
              </View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 6 },
                ]}
              >
                {ReplaceWithStyle(
                  i18n.t("purchasesDesc"),
                  "{overview}",
                  <Text style={[Style.text.organizer, Style.text.semibold]}>
                    {i18n.t("overview")}
                  </Text>,
                )}
              </Text>

              {purchases.length == 0 && (
                <>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginTop: 10, marginBottom: 6 },
                    ]}
                  >
                    {i18n.t("waitingForSale")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.transparency.lg,
                      { textAlign: "center", marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("waitingDataPurchases")}
                  </Text>
                </>
              )}

              {purchases.map((purchase, pidx) => {
                return (
                  <View
                    key={"purchase-" + pidx}
                    style={[Style.containers.row, { paddingVertical: 15 }]}
                  >
                    <View
                      style={[
                        Style.badge,
                        {
                          backgroundColor: theme["color-organizer-500"],
                          shadowColor: theme["color-organizer-500"],
                          marginRight: 6,
                          alignSelf: "center",
                        },
                      ]}
                    >
                      <Text style={[Style.text.basic, Style.text.bold]}>
                        ${purchase.getTotal()}
                      </Text>
                    </View>

                    <View
                      style={[
                        Style.containers.column,
                        { alignItems: "flex-start", flex: 1, marginLeft: 8 },
                      ]}
                    >
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.semibold,
                          Style.text.lg,
                        ]}
                        adjustsFontSizeToFit
                      >
                        {purchase.getBuyer()}
                      </Text>
                      {purchase.buyer_age !== 0 && (
                        <Text
                          style={[
                            Style.text.dark,
                            Style.transparency.md,
                            Style.text.normal,
                          ]}
                        >
                          {i18n.t("xYearsOld", { age: purchase.getBuyerAge() })}
                        </Text>
                      )}
                    </View>

                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.sm,
                        Style.text.normal,
                        {
                          marginHorizontal: 8,
                          maxWidth: "35%",
                        },
                      ]}
                    >
                      {purchase.getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {section == 25 && (
            <>
              {!ev.venue && !ev?.venueSetup && (
                <View style={[Style.containers.column, { marginVertical: 30 }]}>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.xl,
                      { marginBottom: 10 },
                    ]}
                  >
                    {i18n.t("noVenue")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.transparency.md,
                    ]}
                  >
                    {i18n.t("noVenueChosenDesc")}
                  </Text>
                </View>
              )}
              {ev?.venue && (
                <>
                  <View
                    style={[
                      Style.containers.column,
                      { alignItems: "flex-start", marginVertical: 30 },
                    ]}
                  >
                    <View style={[Style.containers.row]}>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.bold,
                          Style.text.xl,
                        ]}
                      >
                        {i18n.t("ticketTiers")}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <MaterialCommunityIcons
                        name="layers-triple-outline"
                        size={22}
                        color={theme["color-basic-700"]}
                      />
                    </View>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.normal,
                        { marginVertical: 6 },
                      ]}
                    >
                      {i18n.t("ticketTiersDesc")}
                    </Text>

                    {ev?.tiers.map((tier, tidx) => (
                      <TouchableOpacity
                        key={"tier-view-" + tidx}
                        onPress={() => onTierEdit(tidx)}
                        style={[Style.containers.row, { paddingVertical: 15 }]}
                      >
                        <View
                          style={[
                            Style.containers.column,
                            { alignItems: "flex-start", marginLeft: 8 },
                          ]}
                        >
                          <Text
                            style={[
                              Style.text.dark,
                              Style.text.semibold,
                              Style.text.lg,
                            ]}
                          >
                            {tier.name}
                          </Text>
                          <Text
                            style={[
                              Style.text.dark,
                              Style.transparency.md,
                              Style.text.normal,
                            ]}
                          >
                            {i18n.t("tierName")}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }} />

                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.lg,
                            Style.text.normal,
                            {
                              marginHorizontal: 8,
                              maxWidth: "35%",
                              marginRight: 20,
                            },
                          ]}
                        >
                          {"$" + CurrencyFormatter(tier.amount)}
                        </Text>
                        <Feather
                          name="edit-3"
                          size={20}
                          color={theme["color-organizer-500"]}
                        />
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      onPress={onTierAdd}
                      style={[
                        Style.button.container,
                        {
                          flex: 1,
                          marginTop: 10,
                          marginBottom: 40,
                          backgroundColor: theme["color-organizer-500"],
                        },
                      ]}
                    >
                      <Text style={[Style.button.text, Style.text.semibold]}>
                        {i18n.t("createTier")}
                      </Text>
                    </TouchableOpacity>

                    <View style={[Style.containers.row]}>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.bold,
                          Style.text.xl,
                        ]}
                      >
                        {i18n.t("ticketPrices")}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <MaterialCommunityIcons
                        name="ticket-percent-outline"
                        size={22}
                        color={theme["color-basic-700"]}
                      />
                    </View>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.normal,
                        { marginVertical: 6 },
                      ]}
                    >
                      {i18n.t("ticketPricesDesc")}
                    </Text>
                    {ev.nodes
                      .filter((n) => !n.isDecorative && n.isExposed)
                      .map((node, nodeidx) => (
                        <TouchableOpacity
                          key={"node-tiers-" + nodeidx}
                          onPress={() => onNodeEdit(node, nodeidx)}
                          style={[
                            Style.containers.row,
                            { paddingVertical: 15, width: "100%" },
                          ]}
                        >
                          <View
                            style={[
                              Style.badge,
                              {
                                backgroundColor: theme["color-organizer-500"],
                                shadowColor: theme["color-organizer-500"],
                                marginRight: 6,
                                alignSelf: "center",
                                maxWidth: width * 0.25,
                              },
                            ]}
                          >
                            <Text
                              allowFontScaling
                              style={[Style.text.basic, Style.text.bold]}
                            >
                              {node.type == "ga-sec" && (
                                <>{node.getIdentifier()}</>
                              )}
                              {node.type == "seat" && (
                                <>{node.getTitle(ev.nodes)}</>
                              )}
                            </Text>
                          </View>

                          <View
                            style={[
                              Style.containers.column,
                              { alignItems: "flex-start", marginLeft: 8 },
                            ]}
                          >
                            <Text
                              style={[
                                Style.text.dark,
                                Style.text.semibold,
                                Style.text.lg,
                              ]}
                              allowFontScaling
                            >
                              {i18n.t("xOutOfy", {
                                x: node.booked,
                                y: Commasize(node.capacity),
                              })}
                            </Text>
                            <Text
                              style={[
                                Style.text.dark,
                                Style.transparency.md,
                                Style.text.normal,
                              ]}
                            >
                              {i18n.t("ticketsBooked")}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }} />

                          <Text
                            style={[
                              Style.text.dark,
                              Style.text.lg,
                              Style.text.normal,
                              {
                                marginHorizontal: 8,
                                maxWidth: "35%",
                                marginRight: 20,
                              },
                            ]}
                          >
                            ${CurrencyFormatter(node.price)}
                          </Text>
                          {canEditTiers && (
                            <Feather
                              name="edit-3"
                              size={20}
                              color={theme["color-organizer-500"]}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    <View style={[Style.containers.row, { marginTop: 30 }]}>
                      <Text
                        style={[
                          Style.text.dark,
                          Style.text.bold,
                          Style.text.xl,
                        ]}
                      >
                        {i18n.t("physicalTickets")}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <MaterialCommunityIcons
                        name="ticket-confirmation-outline"
                        size={22}
                        color={theme["color-basic-700"]}
                      />
                    </View>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.normal,
                        { marginVertical: 10 },
                      ]}
                    >
                      {i18n.t("physicalTicketsDesc")}
                    </Text>
                    {Object.keys(physicalTickets).length == 0 && (
                      <View style={[Style.containers.column]}>
                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.semibold,
                            Style.transparency.lg,
                            {
                              textAlign: "center",
                              marginTop: 10,
                              marginBottom: 6,
                            },
                          ]}
                        >
                          {i18n.t("noPhysTicks")}
                        </Text>
                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.semibold,
                            Style.transparency.lg,
                            { textAlign: "center", marginBottom: 10 },
                          ]}
                        >
                          {i18n.t("noPhysTicksDesc")}
                        </Text>
                      </View>
                    )}
                    {Object.keys(physicalTickets).map((node, nodeidx) => (
                      <TouchableOpacity
                        key={"node-physticks-" + nodeidx}
                        onPress={() =>
                          Linking.openURL(
                            `${Config.apiUrl}api/organizations/events/physical_tickets/download?auth=${auth}&oid=${oid}&eid=${eid}&node=${physicalTickets[node][0].node.identifier}`,
                          )
                        }
                        style={[Style.containers.row, { paddingVertical: 15 }]}
                      >
                        <View
                          style={[
                            Style.badge,
                            {
                              backgroundColor: theme["color-organizer-500"],
                              shadowColor: theme["color-organizer-500"],
                              marginRight: 6,
                              alignSelf: "center",
                            },
                          ]}
                        >
                          <Text style={[Style.text.basic, Style.text.bold]}>
                            {physicalTickets[node][0].node.name}
                          </Text>
                        </View>

                        <View
                          style={[
                            Style.containers.column,
                            { alignItems: "flex-start", marginLeft: 8 },
                          ]}
                        >
                          <Text
                            style={[
                              Style.text.dark,
                              Style.text.semibold,
                              Style.text.lg,
                            ]}
                          >
                            {Commasize(physicalTickets[node].length)}
                          </Text>
                          <Text
                            style={[
                              Style.text.dark,
                              Style.transparency.md,
                              Style.text.normal,
                            ]}
                          >
                            {i18n.t("ticketsCreated")}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }} />

                        <Text
                          style={[
                            Style.text.dark,
                            Style.text.lg,
                            Style.text.normal,
                            {
                              marginHorizontal: 8,
                              maxWidth: "35%",
                              marginRight: 20,
                            },
                          ]}
                        >
                          ${CurrencyFormatter(physicalTickets[node][0].total)}
                        </Text>
                        <Feather
                          name="printer"
                          size={20}
                          color={theme["color-organizer-500"]}
                        />
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={onShowPhysicalTicketsGenerator}
                      style={[
                        Style.button.container,
                        {
                          flex: 1,
                          marginTop: 20,
                          backgroundColor: theme["color-organizer-500"],
                        },
                      ]}
                    >
                      <Text style={[Style.button.text, Style.text.semibold]}>
                        {i18n.t("addPhysTicks")}
                      </Text>
                    </TouchableOpacity>
                    {/* {typeof venueEarnings != null &&
                      typeof venueEarnings != "string" &&
                      ev.nodes.filter((n) => !n.isDecorative && !n.isExposed)
                        .length > 0 && (
                        <>
                          <Spacer y={2}></Spacer>
                          <Text h4 weight="semibold">
                            Add-ons
                          </Text>
                          <Text>
                            To manage add-on's prices and tiers, click here
                          </Text>
                          <Spacer y={1}></Spacer>
                          <Table
                            aria-label="tiers and holds table"
                            containerCss={{ width: "100%" }}
                            css={{ height: "auto", width: "100%" }}
                            selectionMode="none"
                            shadow
                          >
                            <Table.Header>
                              <Table.Column hideHeader>identifier</Table.Column>
                              <Table.Column
                                css={{ minWidth: 100 }}
                                align="center"
                              >
                                Status
                              </Table.Column>
                              <Table.Column
                                css={{ minWidth: 120 }}
                                align="center"
                                hideHeader
                              >
                                Actions
                              </Table.Column>
                            </Table.Header>
                            <Table.Body>
                              {ev.nodes
                                .filter((n) => !n.isDecorative && !n.isExposed)
                                .map((node, nodeidx) => (
                                  <Table.Row
                                    key={ev.nodes
                                      .findIndex(
                                        (n) => n.identifier == node.identifier,
                                      )
                                      .toString()}
                                  >
                                    <Table.Cell>
                                      <Badge
                                        enableShadow={node.available !== 0}
                                        disableOutline
                                        color={
                                          node.holdings == 1 ||
                                          node.available == 0
                                            ? "default"
                                            : "primary"
                                        }
                                      >
                                        {node.getIdentifier()} (
                                        {Pluralize(node.seatsAvailable, "seat")}
                                        )
                                      </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                      {node.holdings == 0 &&
                                        node.available == 0 && (
                                          <Text
                                            align="center"
                                            color="grey"
                                            weight="semibold"
                                          >
                                            Already purchased
                                          </Text>
                                        )}
                                      {node.holdings == 1 && (
                                        <Text
                                          align="center"
                                          color="grey"
                                          weight="semibold"
                                        >
                                          Currently being held
                                        </Text>
                                      )}
                                      {node.holdings == 0 &&
                                        node.available == 1 && (
                                          <Text
                                            align="center"
                                            color="grey"
                                            weight="semibold"
                                          >
                                            Available to purchase or hold
                                          </Text>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                      {canEditTiers && node.holdings == 1 && (
                                        <Button
                                          onPress={() =>
                                            removeHold(node.identifier)
                                          }
                                          align="center"
                                          auto
                                          light
                                          ripple={false}
                                          color="error"
                                          weight="semibold"
                                        >
                                          Remove hold
                                        </Button>
                                      )}
                                      {canEditTiers &&
                                        node.holdings == 0 &&
                                        node.available == 1 && (
                                          <Button
                                            onPress={() =>
                                              placeHold(node.identifier)
                                            }
                                            align="center"
                                            auto
                                            light
                                            ripple={false}
                                            color="primary"
                                            weight="semibold"
                                          >
                                            Place hold
                                          </Button>
                                        )}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                            </Table.Body>
                            <Table.Pagination
                              shadow
                              noMargin
                              align="center"
                              rowsPerPage={5}
                              onPageChange={(page) => {}}
                            />
                          </Table>
                        </>
                      )}
                    {scheduledTasks.length > 0 && (
                      <>
                        <Spacer y={2}></Spacer>
                        <Text h4 css={{ m: 0 }}>
                          Active Automatic Tier Changes
                        </Text>
                        <Spacer y={1} />
                        <Table
                          aria-label="tiers and holds table"
                          containerCss={{ width: "100%" }}
                          css={{ height: "auto", width: "100%" }}
                          shadow
                        >
                          <Table.Header>
                            <Table.Column>Date</Table.Column>
                            <Table.Column>Jobs</Table.Column>
                            <Table.Column hideHeader>Actions</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            {scheduledTasks.map((task) => (
                              <Table.Row
                                key={task.id}
                                css={{ mb: "$5" }}
                                align="center"
                              >
                                <Table.Cell>
                                  {task.tasks[0]?.amount != 0 && (
                                    <Text weight="semibold">
                                      Tickets Sold &ge; {task.tasks[0].amount}
                                    </Text>
                                  )}
                                  {task.tasks[0]?.amount == 0 && (
                                    <Text weight="semibold">
                                      {moment(task.date)
                                        .utc()
                                        .format("dddd, MMM Do")}
                                    </Text>
                                  )}
                                </Table.Cell>
                                <Table.Cell>
                                  <Row>
                                    <Col>
                                      {task.tasks.map((job, jidx) => {
                                        return (
                                          <Text key={"J-" + jidx}>
                                            {
                                              ev?.nodes.find(
                                                (n) => n.identifier == job.node,
                                              )?.text
                                            }{" "}
                                            <Text span color="primary">
                                              {
                                                ev?.nodes.find(
                                                  (n) =>
                                                    n.identifier == job.node,
                                                )?.name
                                              }
                                            </Text>
                                            's tier will become{" "}
                                            <Text span color="primary">
                                              {
                                                ev?.tiers.find(
                                                  (t) =>
                                                    t.identifier == job.tier,
                                                )?.name
                                              }
                                            </Text>
                                          </Text>
                                        );
                                      })}
                                    </Col>
                                  </Row>
                                </Table.Cell>
                                <Table.Cell>
                                  <Row justify="center">
                                    {canEditTiers && (
                                      <Button
                                        onPress={() => onDeleteTask(task.id)}
                                        ripple={false}
                                        color="error"
                                        auto
                                        light
                                      >
                                        Delete
                                      </Button>
                                    )}
                                  </Row>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </>
                    )} */}
                    {/* {ev?.active && availableHolds.length > 0 && (
                      <>
                        <Spacer y={2}></Spacer>
                        <Text h4 weight="semibold">
                          Available Holds
                        </Text>
                        <Text>
                          These are the holds you have placed, you can transfer
                          these tickets to anyone you'd like. Whoever you're
                          transfering tickets to must have an account created.
                          You can ask them to create an account by sending them
                          this link,{" "}
                          <Link
                            href="https://www.ticketsfour.com/register"
                            color="primary"
                            target="_blank"
                          >
                            https://www.ticketsfour.com/register
                          </Link>
                          .{" "}
                          <Text span b>
                            All ticket transfers are final.
                          </Text>
                        </Text>
                        <Spacer y={1}></Spacer>
                        <Table
                          aria-label="holds available table"
                          containerCss={{ width: "100%" }}
                          css={{ height: "auto", width: "100%" }}
                          selectionMode={canEditTiers ? "multiple" : "none"}
                          shadow
                          onSelectionChange={(e) =>
                            setSelectedHolds(Array.from(e))
                          }
                        >
                          <Table.Header>
                            <Table.Column>Section</Table.Column>
                            <Table.Column>Information</Table.Column>
                            <Table.Column hideHeader>Actions</Table.Column>
                          </Table.Header>
                          <Table.Body>
                            {availableHolds.map((hold, holdidx) => (
                              <Table.Row key={hold.key}>
                                <Table.Cell
                                  css={{ cursor: "pointer", pl: "$4" }}
                                >
                                  <Badge
                                    enableShadow
                                    disableOutline
                                    color="primary"
                                  >
                                    {hold.node.text} -{" "}
                                    {hold.node.getIdentifier()}
                                  </Badge>
                                </Table.Cell>
                                <Table.Cell css={{ cursor: "pointer" }}>
                                  {hold.selected} ticket transferable, no
                                  designated spot
                                </Table.Cell>
                                <Table.Cell css={{ cursor: "pointer" }}>
                                  {canEditTiers &&
                                    selectedHolds.includes("H-" + holdidx) && (
                                      <Text color="primary" weight="semibold">
                                        Selected
                                      </Text>
                                    )}
                                  {canEditTiers &&
                                    !selectedHolds.includes("H-" + holdidx) && (
                                      <Text color="primary" weight="semibold">
                                        Select
                                      </Text>
                                    )}
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                          <Table.Pagination
                            shadow
                            noMargin
                            align="center"
                            rowsPerPage={5}
                            onPageChange={(page) => {}}
                          />
                        </Table>
                        {canEditTiers && (
                          <>
                            <Container
                              css={{
                                opacity: selectedHolds.length > 0 ? 1 : 0.3,
                                cursor:
                                  selectedHolds.length > 0
                                    ? "default"
                                    : "not-allowed",
                              }}
                            >
                              <Spacer y={2}></Spacer>
                              <Text h4 weight="semibold">
                                Attendee's Phone Number
                              </Text>
                              <Text>
                                Enter the phone number of the person to who we
                                should send the tickets.
                              </Text>
                              <Spacer y={1}></Spacer>
                              <Row>
                                <Col>
                                  <Input
                                    disabled={
                                      isLoadingBackground ||
                                      selectedHolds.length == 0
                                    }
                                    aria-label="phone number"
                                    color={holdsTransferPhoneHelper.color}
                                    status={holdsTransferPhoneHelper.color}
                                    helperColor={holdsTransferPhoneHelper.color}
                                    helperText={holdsTransferPhoneHelper.text}
                                    {...holdsTransferPhoneBindings}
                                    placeholder="Enter phone number..."
                                    width="100%"
                                    size="xl"
                                  />
                                </Col>
                              </Row>
                              <Spacer y={2}></Spacer>
                              <Row justify="center">
                                <Button
                                  onPress={onHoldsTransfer}
                                  disabled={
                                    isLoadingBackground ||
                                    selectedHolds.length == 0 ||
                                    !holdsTransferPhoneHelper.valid
                                  }
                                  color="primary"
                                  shadow
                                  size="lg"
                                >
                                  Send Tickets
                                </Button>
                              </Row>
                            </Container>
                          </>
                        )}
                      </>
                    )} */}
                  </View>
                </>
              )}
            </>
          )}

          {section == 3 && (
            <View>
              <Text
                style={[
                  Style.text.dark,
                  Style.text.normal,
                  { marginVertical: 10 },
                ]}
              >
                {i18n.t("reportsDesc")}
              </Text>

              <View
                style={[
                  Style.cardBlank,
                  Style.containers.column,
                  { marginTop: 20 },
                ]}
              >
                <View style={[Style.containers.row, { marginBottom: 20 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xxl]}
                  >
                    {i18n.t("purchasers")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View
                    style={[
                      Style.badge,
                      {
                        alignSelf: "center",
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                      },
                    ]}
                  >
                    <Text style={[Style.text.basic, Style.text.bold]}>csv</Text>
                  </View>
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    Style.text.lg,
                    { textAlign: "center" },
                  ]}
                >
                  {i18n.t("purchasersRepDesc")}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `${Config.apiUrl}api/organizations/events/reports/purchasers/download?auth=${auth}&oid=${oid}&eid=${eid}`,
                    )
                  }
                  style={[
                    Style.button.container,
                    {
                      backgroundColor: theme["color-organizer-500"],
                      marginTop: 20,
                    },
                  ]}
                >
                  <Text style={[Style.button.text, Style.text.semibold]}>
                    {i18n.t("download")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  Style.cardBlank,
                  Style.containers.column,
                  Style.transparency.sm,
                  { marginTop: 20 },
                ]}
              >
                <View style={[Style.containers.row, { marginBottom: 20 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xxl]}
                  >
                    {i18n.t("eventReport")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View
                    style={[
                      Style.badge,
                      {
                        alignSelf: "center",
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                      },
                    ]}
                  >
                    <Text style={[Style.text.basic, Style.text.bold]}>
                      xlsx
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    Style.text.lg,
                    { textAlign: "center" },
                  ]}
                >
                  {i18n.t("eventRepDesc")}
                </Text>

                {venueEarnings != null && (
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(
                        `${Config.apiUrl}api/organizations/events/reports/statement/download?auth=${auth}&oid=${oid}&eid=${eid}&hideBump=true`,
                      )
                    }
                    style={[
                      Style.button.container,
                      {
                        backgroundColor: theme["color-organizer-500"],
                        marginTop: 20,
                      },
                    ]}
                  >
                    <Text style={[Style.button.text, Style.text.semibold]}>
                      Statement - {i18n.t("download")}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `${Config.apiUrl}api/organizations/events/reports/statement/download?auth=${auth}&oid=${oid}&eid=${eid}`,
                    )
                  }
                  style={[
                    Style.button.container,
                    {
                      backgroundColor: theme["color-organizer-500"],
                      marginTop: 20,
                    },
                  ]}
                >
                  <Text style={[Style.button.text, Style.text.semibold]}>
                    Report - {i18n.t("download")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  Style.cardBlank,
                  Style.containers.column,
                  Style.transparency.sm,
                  { marginTop: 20 },
                ]}
              >
                <View style={[Style.containers.row, { marginBottom: 20 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xxl]}
                  >
                    {i18n.t("purchases")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View
                    style={[
                      Style.badge,
                      {
                        alignSelf: "center",
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                      },
                    ]}
                  >
                    <Text style={[Style.text.basic, Style.text.bold]}>csv</Text>
                  </View>
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    Style.text.lg,
                    { textAlign: "center" },
                  ]}
                >
                  {i18n.t("purchasesRepDesc")}
                </Text>

                <TouchableOpacity
                  disabled
                  style={[
                    Style.button.disabled,
                    Style.button.container,
                    {
                      backgroundColor: theme["color-organizer-500"],
                      marginTop: 20,
                    },
                  ]}
                >
                  <Text style={[Style.button.text, Style.text.semibold]}>
                    {i18n.t("download")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  Style.cardBlank,
                  Style.containers.column,
                  Style.transparency.sm,
                  { marginTop: 20 },
                ]}
              >
                <View style={[Style.containers.row, { marginBottom: 20 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xxl]}
                  >
                    {i18n.t("sales")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <View
                    style={[
                      Style.badge,
                      {
                        alignSelf: "center",
                        backgroundColor: theme["color-organizer-500"],
                        shadowColor: theme["color-organizer-500"],
                      },
                    ]}
                  >
                    <Text style={[Style.text.basic, Style.text.bold]}>pdf</Text>
                  </View>
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    Style.text.lg,
                    { textAlign: "center" },
                  ]}
                >
                  {i18n.t("salesRepDesc")}
                </Text>

                <TouchableOpacity
                  disabled
                  style={[
                    Style.button.disabled,
                    Style.button.container,
                    {
                      backgroundColor: theme["color-organizer-500"],
                      marginTop: 20,
                    },
                  ]}
                >
                  <Text style={[Style.button.text, Style.text.semibold]}>
                    {i18n.t("download")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {section == 4 && (
            <>
              {!ev.venue && !ev?.venueSetup && (
                <>
                  <View
                    style={[Style.containers.column, { marginVertical: 30 }]}
                  >
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.semibold,
                        Style.text.xl,
                        { marginBottom: 10 },
                      ]}
                    >
                      {i18n.t("noVenue")}
                    </Text>
                    <Text
                      style={[
                        Style.text.dark,
                        Style.text.lg,
                        Style.transparency.md,
                      ]}
                    >
                      {i18n.t("noVenueEventDesc")}
                    </Text>
                  </View>
                </>
              )}
              {ev?.venue && !ev?.venueSetup && (
                <View style={[Style.containers.column, { marginVertical: 30 }]}>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.xl,
                      { marginBottom: 10, textAlign: "center" },
                    ]}
                  >
                    {i18n.t("awaitingXconfirm", { venue: ev.venue.name })}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.transparency.md,
                    ]}
                  >
                    {i18n.t("awaitingXconfirmDesc", { venue: ev.venue.name })}
                  </Text>
                </View>
              )}
              {((ev?.venueSetup && ev.draft) ||
                (ev.active && !ev.promptScanner)) && (
                <View style={[Style.containers.column, { marginVertical: 30 }]}>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.xl,
                      { marginBottom: 10, textAlign: "center" },
                    ]}
                  >
                    {i18n.t("scannerUnavailable")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.transparency.md,
                    ]}
                  >
                    {i18n.t("scannerUnavailableDesc")}
                  </Text>
                </View>
              )}
              {!ev.draft && !ev.active && !ev.promptScanner && (
                <View style={[Style.containers.column, { marginVertical: 30 }]}>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.xl,
                      { marginBottom: 10, textAlign: "center" },
                    ]}
                  >
                    {i18n.t("scannerNotAvailable")}
                  </Text>
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.lg,
                      Style.transparency.md,
                    ]}
                  >
                    {i18n.t("scannerUnavailableDesc")}
                  </Text>
                </View>
              )}
              {/* {!nfcMode && (
                <TouchableOpacity
                  onPress={() => setNFCMode(true)}
                  style={[
                    Style.containers.row,
                    {
                      paddingHorizontal: 6,
                      alignSelf: "flex-end",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    size={32}
                    color={theme["color-organizer-500"]}
                    name="contactless-payment-circle-outline"
                  />
                  <Text
                    style={[
                      Style.text.organizer,
                      Style.text.lg,
                      Style.text.semibold,
                      {
                        marginHorizontal: 6,
                      },
                    ]}
                  >
                    {i18n.t("tapToScanMode")}
                  </Text>
                </TouchableOpacity>
              )} */}
              {/* {nfcMode && (
                <>
                  <TouchableOpacity
                    onPress={() => setNFCMode(false)}
                    style={[
                      Style.containers.row,
                      {
                        paddingHorizontal: 6,
                        alignSelf: "flex-end",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      size={32}
                      color={theme["color-organizer-500"]}
                      name="qrcode-scan"
                    />
                    <Text
                      style={[
                        Style.text.organizer,
                        Style.text.lg,
                        Style.text.semibold,
                        {
                          marginHorizontal: 6,
                        },
                      ]}
                    >
                      {i18n.t("scanner")}
                    </Text>
                  </TouchableOpacity>
                  <Pressable onPress={initNFC}>
                    <MaterialCommunityIcons
                      style={{ alignSelf: "center", padding: 10 }}
                      size={124}
                      color={
                        scannerResult == null
                          ? theme["color-basic-700"]
                          : scannerResult == "INVALID_TICKET"
                            ? theme["color-danger-500"]
                            : theme["color-organizer-500"]
                      }
                      name="contactless-payment-circle-outline"
                    />
                  </Pressable>
                  {scannerResultsDatum != null && (
                    <View
                      style={[
                        Style.badge,
                        {
                          backgroundColor: isLoadingScan
                            ? theme["color-basic-700"]
                            : scannerResult == "VALID"
                              ? theme["color-success-500"]
                              : theme["color-primary-500"],
                          shadowColor: isLoadingScan
                            ? theme["color-basic-700"]
                            : scannerResult == "VALID"
                              ? theme["color-success-500"]
                              : theme["color-primary-500"],
                          alignSelf: "center",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Style.text.basic,
                          Style.text.lg,
                          Style.text.semibold,
                        ]}
                      >
                        {i18n.t(scannerResult, { stamp: scanStamp })}
                      </Text>
                    </View>
                  )}
                  {scannerResultsDatum == null && (
                    <View
                      style={[
                        Style.badge,
                        {
                          backgroundColor: theme["color-basic-700"],
                          shadowColor: theme["color-basic-700"],
                          alignSelf: "center",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          Style.text.basic,
                          Style.text.lg,
                          Style.text.semibold,
                        ]}
                      >
                        {i18n.t("xTicketsRemaining", {
                          x: ev.attendees + -ev.scanned,
                        })}
                      </Text>
                    </View>
                  )}
                </>
              )} */}
              <View style={[Style.containers.column, { marginVertical: 30 }]}>
                {!nfcMode && (
                  <CameraView
                    onBarcodeScanned={handleScannerResponse}
                    barcodeScannerSettings={{
                      barcodeTypes: ["qr"],
                      isHighlightingEnabled: true,
                    }}
                    style={{ height: height * 0.65, width }}
                  >
                    {scannerResultsDatum != null && (
                      <View
                        style={[
                          Style.badge,
                          {
                            backgroundColor: isLoadingScan
                              ? theme["color-basic-700"]
                              : scannerResult == "VALID"
                                ? theme["color-success-500"]
                                : theme["color-primary-500"],
                            shadowColor: isLoadingScan
                              ? theme["color-basic-700"]
                              : scannerResult == "VALID"
                                ? theme["color-success-500"]
                                : theme["color-primary-500"],
                            position: "absolute",
                            alignSelf: "center",
                            top: 100,
                          },
                        ]}
                      >
                        {isLoadingScan && (
                          <ActivityIndicator
                            size={10}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 20,
                            }}
                            color={theme["color-basic-100"]}
                          />
                        )}
                        {!isLoadingScan && scannerResult && (
                          <Text
                            style={[
                              Style.text.basic,
                              Style.text.xxl,
                              Style.text.semibold,
                            ]}
                          >
                            {i18n.t(scannerResult, { stamp: scanStamp })}
                          </Text>
                        )}
                      </View>
                    )}
                    {scannerResultsDatum == null && (
                      <View
                        style={[
                          Style.badge,
                          {
                            backgroundColor: theme["color-basic-700"],
                            shadowColor: theme["color-basic-700"],
                            position: "absolute",
                            alignSelf: "center",
                            bottom: 50,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Style.text.basic,
                            Style.text.xl,
                            Style.text.semibold,
                          ]}
                        >
                          {i18n.t("xTicketsRemaining", {
                            x: ev.attendees + -ev.scanned,
                          })}
                        </Text>
                      </View>
                    )}
                  </CameraView>
                )}
                <View style={[Style.containers.row, { marginTop: 30 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xl]}
                  >
                    {i18n.t("issueScanning")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <MaterialCommunityIcons
                    name="magnify-scan"
                    size={22}
                    color={theme["color-basic-700"]}
                  />
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    { marginVertical: 10 },
                  ]}
                >
                  {i18n.t("issueScanningDesc")}
                </Text>
                <View style={[Style.input.container, { marginVertical: 10 }]}>
                  <TextInput
                    placeholder="ex. Lucas, Rebecca"
                    style={[Style.input.text, { width: "100%" }]}
                    onSubmitEditing={onSearchScan}
                    value={scannerSearchQuery}
                    onChangeText={(val) => setScannerSearchQuery(val)}
                  />
                </View>
                {isLoadingScan && (
                  <ActivityIndicator
                    style={{ marginVertical: 20, alignSelf: "center" }}
                    color={theme["color-organizer-500"]}
                    size={22}
                  />
                )}
                {!isLoadingScan &&
                  scannerSearchResults.map((result, pidx) => {
                    return (
                      <View
                        key={"scanner-result-" + pidx}
                        style={[Style.containers.row, { paddingVertical: 15 }]}
                      >
                        <View
                          style={[
                            Style.badge,
                            {
                              backgroundColor: theme["color-organizer-500"],
                              shadowColor: theme["color-organizer-500"],
                              marginRight: 6,
                              alignSelf: "center",
                            },
                          ]}
                        >
                          <Text style={[Style.text.basic, Style.text.bold]}>
                            {i18n.t("Xtickets", { x: result.tickets.length })}
                          </Text>
                        </View>

                        <View
                          style={[
                            Style.containers.column,
                            {
                              alignItems: "flex-start",
                              flex: 1,
                              marginLeft: 8,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              Style.text.dark,
                              Style.text.semibold,
                              Style.text.lg,
                            ]}
                            adjustsFontSizeToFit
                          >
                            {result.person.first_name} {result.person.last_name}
                          </Text>
                          <Text
                            style={[
                              Style.text.dark,
                              Style.transparency.md,
                              Style.text.normal,
                            ]}
                          >
                            Phone (***) ***-{result.person.phone} • Receipt #
                            {result.receipt} • Card #{result.card4}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => onValidateTickets(result.tickets)}
                          style={{ padding: 10 }}
                        >
                          <MaterialCommunityIcons
                            size={22}
                            name="skull-scan-outline"
                            color={theme["color-danger-500"]}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                <View style={[Style.containers.row, { marginTop: 30 }]}>
                  <Text
                    style={[Style.text.dark, Style.text.bold, Style.text.xl]}
                  >
                    {i18n.t("scannerTips")}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <MaterialCommunityIcons
                    name="scan-helper"
                    size={22}
                    color={theme["color-basic-700"]}
                  />
                </View>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.normal,
                    { marginVertical: 10, alignSelf: "flex-start" },
                  ]}
                >
                  {i18n.t("scannerTipsDesc")}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.text.lg,
                    { marginTop: 20, marginBottom: 10, textAlign: "left" },
                  ]}
                >
                  <Text style={[Style.text.organizer]}>
                    {i18n.t("validTicket")}
                  </Text>{" "}
                  {i18n.t("validTicketDesc")}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.text.lg,
                    {
                      marginTop: 10,
                      marginBottom: 10,
                      textAlign: "left",
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text style={[Style.text.danger]}>
                    {i18n.t("ticketScanned")}
                  </Text>{" "}
                  {i18n.t("ticketScannedDesc")}
                </Text>
                <Text
                  style={[
                    Style.text.dark,
                    Style.text.semibold,
                    Style.text.lg,
                    {
                      marginTop: 10,
                      marginBottom: 10,
                      textAlign: "left",
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text style={[Style.text.danger]}>
                    {i18n.t("invalidTicket")}
                  </Text>{" "}
                  {i18n.t("invalidTicketDesc")}
                </Text>
                <TouchableOpacity
                  onPress={onShareScanner}
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.lg,
                      { textAlign: "left" },
                    ]}
                  >
                    {i18n.t("shareScanner")}{" "}
                    <Text style={[Style.text.organizer]}>
                      {i18n.t("shareScannerDesc")}
                    </Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onOfflineScanner}
                  style={{
                    marginTop: 10,
                    marginBottom: 10,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={[
                      Style.text.dark,
                      Style.text.semibold,
                      Style.text.lg,
                      { textAlign: "left" },
                    ]}
                  >
                    {i18n.t("badConnection")}{" "}
                    <Text style={[Style.text.organizer]}>
                      {i18n.t("offlineMode")}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollContainer>
    </SheetProvider>
  );
}

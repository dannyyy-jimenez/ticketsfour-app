import moment from "moment";
import Organization from "./Organization";
import Venue from "./Venue";
import { GASection, Table, Misc, Seat } from "./Seat";
import {
  Commasize,
  CurrencyFormatter,
  NumFormatter,
} from "../utils/Formatters";
import Config from "../utils/Config";
import QRCode from "qrcode";
const Buffer = require("buffer").Buffer;

const AgeRequirement = {
  overage: "18+",
  overage_legal: "21+",
};

export default class Ev {
  constructor({
    id,
    cover,
    name,
    description,
    tags,
    start,
    end,
    lineup = [],
    privacy = "public",
    ageRequirement = false,
    timezone = "America/Chicago",
    status = "DRAFT",
    draft = true,
    active = false,
    cancelled = false,
    venue = null,
    layout = null,
    venueConfirmed = false,
    venueNote = "",
    hosts = [],
    nodes = [],
    tiers = [],
    sales = 0,
    views = 0,
    attendees = 0,
    shares = 0,
    basePrice = 0,
    dataPoints = {},
    available = 9999,
    soldOut = false,
    paidOut = false,
    payoutStatus = null,
    scanned = 0,
    shortLink = "",
  }) {
    this.id = id;
    this.cover = cover ? cover : null;
    this.coverT = "";
    if (this.cover) {
      this.coverT = Config.cloudUri + this.cover;
    }
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.lineup = lineup;
    this.start = moment(start);
    this.end = moment(end);
    this.timezone = timezone;
    this.draft = draft;
    this.active = active;
    this.cancelled = cancelled;
    this.status = status;
    this.privacy = privacy;
    this.ageRequirement = ageRequirement;
    this.venue = venue ? new Venue({ ...venue }) : null;
    this.venueNote = venueNote;
    this.layout = layout;
    this.shortLink = shortLink;
    this.venueSetup = venueConfirmed;
    this.tiers = tiers;
    this.nodes = nodes.map((node) => {
      if (node.type == "ga-sec") return new GASection({ ...node });
      if (node.type == "table") return new Table({ ...node });
      if (node.type == "seat") return new Seat({ ...node });

      return new Misc({ ...node });
    });
    this.hosts = hosts?.map((org) => new Organization({ ...org }));
    this.sales = sales;
    this.views = views;
    this.shares = shares;
    this.attendees = attendees;
    this.scanned = scanned;
    this.basePrice = basePrice;
    this.dataPoints = dataPoints;
    this.available = available;
    this.soldOut = soldOut;
    this.promptScanner = false;
    this.promptDeactivate = false;
    this.payoutStatus = payoutStatus;
    this.paidOut = paidOut;

    let today = moment();

    let diff = this.start.diff(moment(today), "h");

    this.isInPast = diff < 0;

    if (diff < 24 && this.active) {
      this.promptScanner = true;
    }

    if (diff < 4 && this.active) {
      this.promptDeactivate = true;
    }
  }

  updateShares(shares) {
    this.shares = shares;

    return this;
  }

  addTier(tier) {
    this.tiers.push({ ...tier, amount: tier.amount });

    return this;
  }

  editTier(tier, tidx) {
    this.tiers.splice(tidx, 1, tier);

    return this;
  }

  addHost(org) {
    if (this.hosts.find((h) => h.identifier === org.identifier)) return null;
    this.hosts.push(org);

    return this;
  }

  removeHost(org, orgidx) {
    try {
      if (this.hosts[orgidx].identifier != org.identifier) throw "mismatch";

      this.hosts.splice(orgidx, 1);
    } catch (e) {
      return null;
    }

    return this;
  }

  updateScanned(scanned) {
    this.scanned = scanned;

    return this;
  }

  updateShortLink(uri) {
    this.shortLink = uri;

    return this;
  }

  getAgeRequirement() {
    return AgeRequirement[this.ageRequirement] || false;
  }

  getShareBody() {
    let path = `${Config.basePath}/events/${this.id}`;

    if (this.shortLink !== "") {
      path = this.shortLink;
    }

    return this.description + "\n\n" + path;
  }

  getStartLong() {
    return this.start.format("MM/DD/YY h:mm A"); //MM/DD/YY h:mm A
  }

  getEndLong() {
    return this.end.format("MM/DD/YY h:mm A");
  }

  getStartShort() {
    return this.start.format("MMM DD @ hh:mm A");
  }

  getStart(f = "ddd MMM D, YYYY", locale = "en") {
    return this.start.locale(locale).format(f);
  }

  getEnd(f = "ddd MMM D, YYYY") {
    return this.end.format(f);
  }

  getStartEnd() {
    return this.start.format("MMM D") + "-" + this.end.format("D, YYYY");
  }

  getCoverURI(transform = false) {
    if (!this.cover) return "";

    if (transform) return this.coverT;

    return this.cover.toURL();
  }

  getSales() {
    return "$" + CurrencyFormatter(this.sales);
  }

  getSalesShort() {
    return "$" + NumFormatter(this.sales / 100);
  }

  getViews() {
    return NumFormatter(this.views);
  }

  getAttendees() {
    return Commasize(this.attendees);
  }

  getShares() {
    return NumFormatter(this.shares);
  }

  getBasePrice() {
    if (this.soldOut) return null;
    return CurrencyFormatter(this.basePrice);
  }

  getStatus() {
    let s = this.status;

    if (this.available < 10 && this.available != 0 && this.active) {
      s = `ONLY ${this.available} LEFT`;
    }

    if (this.soldOut) {
      s = "SOLD OUT";
    }

    return s;
  }

  getShareables(type = null) {
    let path = `${Config.basePath}/events/${this.id}`;

    if (this.shortLink !== "") {
      path = this.shortLink;
    }

    if (type === "email") {
      return `mailto:?subject=${encodeURIComponent(
        "Get your tickets for " + this.name + "!",
      )}&body=${encodeURIComponent(this.getShareBody())}`;
    }

    if (type === "twitter") {
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        path,
      )}&text=${encodeURIComponent(this.getShareBody())}`;
    }

    if (type === "qr") {
      return QRCode.toString(path, { type: "utf8" }).then(async (url) => {
        return new Promise((resolve) => {
          let blob = new Blob([url], { type: "image/svg" });

          let reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        // url = new Buffer.from(url).toString("base64");
        // return "data:image/svg+xml;base64," + url;
      });
    }

    return path;
  }

  codefy() {
    return this.qr;
  }
}

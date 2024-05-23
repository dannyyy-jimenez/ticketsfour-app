import {
  Commasize,
  CurrencyFormatter,
  NumFormatter,
} from "../utils/Formatters";
import { GASection, Table, Misc, Seat } from "./Seat";
import Config from "../utils/Config";

const Seating = {
  noseating: "No Seating",
  firstcome: "First come, first serve",
  reserved: "Reserved",
};

const AgeRequirement = {
  overage: "18+",
  overage_legal: "21+",
};

class Venue {
  constructor({
    identifier,
    name,
    location,
    center,
    capacity,
    seating,
    ageRequirement = false,
    region_ab = "",
    region = "",
    city = "",
    owner = "",
    shots = [],
    maps = [],
    nodes = [],
    tiers = [],
    pendingRequests = 0,
    verified = false,
    revenue = 0,
    attendees = 0,
    tax = 0,
    stageWidth = 0,
    stageDepth = 0,
    stageHeight = 0,
    stageFTCHeight = 0,
    dressingRoomsStatus = null,
    parkingStatus = null,
    dressCodeStatus = null,
    dressCodeExtra = "",
    amenitiesExtra = "",
  }) {
    this.identifier = identifier;
    this.name = name;
    this.owner = owner;
    this.shots = shots.map((s) => s);
    this.cover = this.shots.length > 0 ? this.shots[0] : null;
    this.location = location;
    this.region_ab = region_ab;
    this.region = region;
    this.city = city;
    this.ageRequirement = ageRequirement;
    this.center = center;
    this.capacity = capacity;
    this.seating = seating;
    this.maps = maps.map((m) => new VenueMap({ ...m }));
    this.nodes = nodes.map((node) => {
      if (node.type == "ga-sec") return new GASection({ ...node });
      if (node.type == "table") return new Table({ ...node });
      if (node.type == "seat") return new Seat({ ...node });

      return new Misc({ ...node });
    });
    this.stageWidth = stageWidth;
    this.stageDepth = stageDepth;
    this.stageHeight = stageHeight;
    this.stageFTCHeight = stageFTCHeight;
    this.hasStage = stageWidth || stageDepth || stageHeight || stageFTCHeight;
    this.dressingRoomsStatus = dressingRoomsStatus;
    this.parkingStatus = parkingStatus;
    this.dressCodeStatus = dressCodeStatus;
    this.dressCodeExtra = dressCodeExtra;
    this.amenitiesExtra = amenitiesExtra;

    this.tiers = tiers;
    this.verified = verified;
    this.attendees = attendees;
    this.revenue = revenue;
    this.tax = tax;
    this.pendingRequests = pendingRequests == 0 ? null : pendingRequests;
  }

  getParking() {
    if (this.parkingStatus == "available") {
      return "Parking Available";
    } else if (this.parkingStatus == "unavailable") {
      return "No Parking";
    } else {
      return "Unknown";
    }
  }

  getDressingRooms() {
    if (this.dressingRoomsStatus == "available") {
      return "Offers Dressing Rooms";
    } else if (this.dressingRoomsStatus == "unavailable") {
      return "No Dressing Rooms";
    } else {
      return "Unknown";
    }
  }

  getStage() {
    if (this.hasStage) {
      return `${this.stageWidth}ft x ${this.stageDepth}ft x ${this.stageHeight}ft x ${this.stageFTCHeight}ft Stage`;
    }

    return "No Stage";
  }

  addTier(tier) {
    this.tiers.push({ ...tier, amount: tier.amount });

    return this;
  }

  editTier(tier, tidx) {
    this.tiers.splice(tidx, 1, tier);

    return this;
  }

  getSeating() {
    return Seating[this.seating] || "Other";
  }

  getAgeRequirement() {
    return AgeRequirement[this.ageRequirement] || false;
  }

  getCapacity() {
    return Commasize(this.capacity);
  }

  getRevenue() {
    return "$" + CurrencyFormatter(this.revenue);
  }

  getRevenueShort() {
    return "$" + NumFormatter(this.revenue / 100);
  }

  getAttendees() {
    return NumFormatter(this.attendees);
  }

  getLocation() {
    try {
      let parts = this.location.split(",");
      return parts.slice(0, 3).join(", ");
    } catch (e) {
      return this.location;
    }
  }

  getCoverURI() {
    if (!this.cover) return "";

    return this.cover.toURL();
  }

  isSelectable(age) {
    if (age == "all_ages" && this.ageRequirement) return false;
    if (age == "overage" && this.ageRequirement == "overage_legal")
      return false;

    return true;
  }

  getShareBody() {
    return `Checkout the events happening at ${this.name}, on Tickets Four!`;
  }

  getShareables(type = null) {
    let path = `${Config.basePath}/venues/${this.identifier.slice(2)}`;

    if (type === "email") {
      return `mailto:?subject=${encodeURIComponent(this.name)}&body=${encodeURIComponent(this.getShareBody())}`;
    }

    if (type === "twitter") {
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(path)}&text=${encodeURIComponent(this.getShareBody())}`;
    }

    if (type === "qr") {
      return QRCode.toString(path, {
        type: "svg",
        color: { dark: "#fb0622" },
      }).then((url) => {
        return new Blob([url]);
      });
    }

    return path;
  }
}

class VenueMap {
  constructor({ identifier, name, capacity, nodes = [] }) {
    this.identifier = identifier;
    this.name = name;
    this.capacity = capacity;
    this.nodes = nodes.map((node) => {
      if (node.type == "ga-sec") return new GASection({ ...node });
      if (node.type == "table") return new Table({ ...node });
      if (node.type == "seat") return new Seat({ ...node });

      return new Misc({ ...node });
    });
  }
}

export { Venue, VenueMap };
export default Venue;

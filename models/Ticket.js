import moment from "moment";
import { CurrencyFormatter } from "../utils/Formatters";
import EventModel from "./Event";
import { GASection, Table, Seat, Paper } from "./Seat";
import QRCode from "qrcode";

export default class Ticket {
  constructor({
    ev,
    total,
    date,
    id = "",
    token = "",
    node = "",
    owner = "N/A",
    owner_age = "Unknown",
  }) {
    this.event = typeof ev == "string" ? ev : new EventModel({ ...ev });
    this.total = total;
    this.date = moment(date);
    this.node = null;

    if (node.type == "ga-sec") this.node = new GASection({ ...node });
    if (node.type == "table") this.node = new Table({ ...node });
    if (node.type == "seat") this.node = new Seat({ ...node });
    if (node.type == "physical") this.node = new Paper({ ...node });

    this.id = id;
    this.buyer = owner;
    this.token = token;
    this.buyer_age = owner_age;
    this.qr = null;
  }

  getEvent() {
    return typeof this.event == "string" ? this.event : `${this.event.name}`;
  }

  getTotal() {
    return CurrencyFormatter(this.total);
  }

  getEventId() {
    return typeof this.event == "string" ? this.event : this.event.id;
  }

  getBuyer() {
    return this.buyer;
  }

  getBuyerAge() {
    return this.buyer_age;
  }

  getDate() {
    return this.date.format("MMM Do, YYYY");
  }
}

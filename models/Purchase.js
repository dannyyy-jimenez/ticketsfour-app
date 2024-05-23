import moment from "moment";
import { CurrencyFormatter } from "../utils/Formatters";
import EventModel from "./Event";

export default class Purchase {
  constructor({ ev, total, date, owner = "N/A", owner_age = "Unknown" }) {
    this.event = typeof ev == "string" ? ev : new EventModel({ ...ev });
    this.total = total;
    this.date = moment(date);
    this.buyer = owner;
    this.buyer_age = owner_age;
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

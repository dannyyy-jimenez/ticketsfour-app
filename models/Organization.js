import moment from "moment";
import { Pluralize } from "../utils/Formatters";

const LOGOS = {
  EMOJI_EGG: "🥚",
  EMOJI_ROOSTER: "🐔",
};

export default class Organization {
  constructor({ identifier, name, members, logo, contact = {} }) {
    this.identifier = identifier;
    this.name = name;
    this.members = members;
    this.logo = logo.match(/^[EMOJI_]/g) ? logo : logo;
    this.logoEMOJI = logo.match(/^[EMOJI_]/g);
    this.contact = contact;
  }

  getLogoURI() {
    if (this.logoEMOJI) {
      return LOGOS[this.logo];
    }

    return this.logo;
  }

  getMembers() {
    return Pluralize(this.members, "Member");
  }
}

import moment from "moment";
import { NumFormatter } from "../utils/Formatters";
import Config from "../utils/Config";

const Categories = {
  updates: "Updates",
  events: "Events",
  venues: "Venues",
};

export default class Blog {
  constructor({
    identifier,
    cover = null,
    title = "",
    subtitle = "",
    category = "",
    tags = [],
    likes = 0,
    shares = 0,
    views = 0,
    nodes = [],
  }) {
    this.identifier = identifier;
    this.cover = cover;
    if (this.cover && this.cover.includes("image/upload/")) {
      this.cover = this.cover;
    } else {
      this.cover = Config.cloudUri + "metacover-ticketsfour_tunr6k.jpg";
    }
    this.title = title;
    this.category = category;
    this.subtitle = subtitle;
    this.tags = tags;
    this.likes = likes;
    this.shares = shares;
    this.views = views;
    this.nodes = nodes;
  }

  updateShares(shares) {
    this.shares = shares;

    return this;
  }

  getCoverURI() {
    if (!this.cover) return "";

    return this.cover;
  }

  getShares() {
    return NumFormatter(this.shares);
  }

  getViews() {
    return NumFormatter(this.views);
  }

  getLikes() {
    return NumFormatter(this.likes);
  }

  getCategory() {
    if (Object.keys(Categories).includes(this.category)) {
      return Categories[this.category];
    }

    return this.category;
  }

  getShareBody() {
    return this.subtitle;
  }

  getShareables(type = null) {
    let path = `${Config.basePath}/blogs/${this.identifier.slice(2)}`;

    if (type === "email") {
      return `mailto:?subject=${encodeURIComponent(this.title)}&body=${encodeURIComponent(this.getShareBody())}`;
    }

    if (type === "twitter") {
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(path)}&text=${encodeURIComponent(this.getShareBody())}`;
    }

    return path;
  }
}

export { Blog, Categories };

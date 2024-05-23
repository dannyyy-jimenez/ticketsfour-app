import { CurrencyFormatter } from "../utils/Formatters";

export default class Leaf {
  constructor({
    node,
    available,
    unit,
    mode = "single",
    selected = null,
    price = "",
    nodes = [],
  }) {
    this.node = nodes.find((n) => n.identifier == node) || node;
    this.available = available;
    this.unit = unit;
    this.mode = mode;
    this.selected = selected;
    if (this.node?.type === "ga-sec" && this.selected == null) {
      this.selected = 1;
    }
    if (this.node?.type === "ga-sec") {
      this.selected = parseInt(this.selected);
      this.key =
        this.node?.identifier +
        "-" +
        this.selected +
        "-" +
        parseInt(Math.random() * 10000);
    }
    if (this.node?.type === "table") {
      this.selected = 1;
      this.key = this.node?.identifier + "-" + this.selected;
    }
    if (this.node?.type === "seat") {
      this.selected = 1;
      this.key =
        this.node?.parentNode +
        "-" +
        this.node?.identifier +
        "-" +
        this.selected;
    }

    this.price =
      typeof this.selected == "number" ? this.unit * this.selected : 0;
  }

  getNodeIdentifier() {
    if (typeof this.node == "string") return "";

    return this.node.getIdentifier();
  }

  getPrice() {
    return CurrencyFormatter(this.price);
  }

  requestify() {
    return {
      node: this.node?.identifier || this.node,
      selected: this.selected,
    };
  }
}

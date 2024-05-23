import { CurrencyFormatter, Commasize, TierType } from "../utils/Formatters";
//import PIP from "point-in-polygon";

class GASection {
  constructor(
    {
      identifier,
      name = "",
      capacity = "50",
      seated = false,
      lng = 835,
      lat = 465,
      w = 450,
      h = 180,
      tilt = 0,
      borders = [5, 5, 5, 5],
      holdings = 0,
      tier = "",
      price = 0,
      available = 0,
      booked = 0,
      parentNode = null,
      extra = {},
    } = {
      identifier: "",
      name: "",
      capacity: "50",
      seated: false,
      lng: 885,
      lat: 465,
      w: 150,
      h: 150,
      tier: "",
      holdings: 0,
      price: 0,
      available: 0,
      booked: 0,
      parentNode: null,
      extra: {},
    },
  ) {
    this.isDecorative = false;
    this.isExposed = true;
    this.icon = "bx bx-rectangle";
    this.text = "Section";
    this.type = "ga-sec";
    this.identifier = identifier;
    this.name = name;
    this.extra = extra;
    this.seated = seated != null ? seated : false;
    try {
      if (typeof capacity == "string") {
        this.capacity = capacity.replace(/[^0-9]/g, "");
      }
      this.capacity = parseInt(capacity);
      this.validCapacity =
        this.capacity === Math.ceil(parseFloat(this.capacity)) && capacity > 0;
    } catch (e) {
      this.validCapacity = false;
    }
    this.validName = this.name !== "";
    this.lng = lng;
    this.lat = lat;
    this.w = w;
    this.h = h;
    this.parentNode = parentNode;
    this.borders = borders;
    this.tilt = tilt;
    this.polygon = [
      [this.lng, this.lat],
      [this.lng, this.lat + this.h],
      [this.lng + this.w, this.lat + this.h],
      [this.lng + this.w, this.lat],
    ];
    this.tier = tier;
    this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
    if (this.holdings > this.capacity) this.holdings = 0;
    this.price = price;
    this.booked = booked;
    this.available = available;
  }

  // clicked(pointer) {
  //   return PIP([pointer.x, pointer.y], this.polygon);
  // }

  update({
    seated = null,
    name = null,
    capacity = null,
    lng = null,
    lat = null,
    w = null,
    h = null,
    tilt = null,
    borders = null,
    holdings = null,
    parentNode = null,
    tier = null,
  }) {
    if (name != null) {
      this.name = name;
    }
    if (seated != null) {
      this.seated = seated;
    }
    if (capacity) {
      this.capacity = parseInt(capacity.toString().replace(/[^0-9]/g, ""));
    }
    if (lng) {
      this.lng = parseFloat(lng);
    }
    if (lat) {
      this.lat = parseFloat(lat);
    }
    if (w) {
      this.w = parseInt(w);
    }
    if (h) {
      this.h = parseInt(h);
    }
    if (tilt != null) {
      this.tilt = parseFloat(tilt);
    }
    if (borders) {
      this.borders = borders.map((r) => parseFloat(r) || 0);
    }
    if (holdings != null) {
      this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
      if (this.holdings > this.capacity) this.holdings = 0;
    }
    if (parentNode) {
      this.parentNode = parentNode;
    }
    if (tier) {
      this.tier = tier;
    }
    return this;
  }

  pathisize(ctx, rX, rY) {
    if (!ctx) return;
    // path format
    // M lat lng h ΔX1 v ΔY1 h -ΔX1 v -ΔY1 (back to beginning)

    let verticies = [
      [(this.lng - 7.5) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, (this.lat + this.h) * rY],
      [(this.lng - 7.5) * rX, (this.lat + this.h) * rY],
    ];

    let origin = [verticies[0][0], verticies[0][1]]; // p, q
    let tiltRadians = (this.tilt * Math.PI) / 180; // negative because angle is clockwise

    let titledVerticies = verticies.map((vertici) => {
      // x' = (𝑥−𝑝)cos(𝜃)−(𝑦−𝑞)sin(𝜃)+𝑝
      // y' = (𝑥−𝑝)sin(𝜃)+(𝑦−𝑞)cos(𝜃)+𝑞.

      let xprime =
        (vertici[0] - origin[0]) * Math.cos(tiltRadians) -
        (vertici[1] - origin[1]) * Math.sin(tiltRadians) +
        origin[0];
      let yprime =
        (vertici[0] - origin[0]) * Math.sin(tiltRadians) +
        (vertici[1] - origin[1]) * Math.cos(tiltRadians) +
        origin[1];

      return [xprime, yprime];
    });

    this.polygon = titledVerticies;
    let p = new Path2D(`
      M${this.borders[0] * rX} 0
      h ${(this.w - this.borders[0] - this.borders[1]) * rX}
      a ${this.borders[1] * rX} ${this.borders[1] * rY} 0 0 1 ${this.borders[1] * rX} ${this.borders[1] * rY}
      v ${(this.h - this.borders[1] - this.borders[2]) * rY}
      a ${this.borders[2] * rX} ${this.borders[2] * rY} 0 0 1 -${this.borders[2] * rX} ${this.borders[2] * rY}
      h ${-(this.w - this.borders[2] - this.borders[3]) * rX}
      a ${this.borders[3] * rX} ${this.borders[3] * rY} 0 0 1 -${this.borders[3] * rX} -${this.borders[3] * rY}
      v ${-(this.h - this.borders[3] - this.borders[0]) * rY}
      a ${this.borders[0] * rX} ${this.borders[0] * rY} 0 0 1 ${this.borders[0] * rX} -${this.borders[0] * rY}
    `);
    ctx.fillStyle =
      this.lat < 0 || this.lng < 0 || this.lat > 1080 || this.lng > 1920
        ? "#F31260"
        : "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.translate(this.lng * rX, this.lat * rY);
    ctx.rotate((this.tilt * Math.PI) / 180);
    ctx.fill(p);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font =
      "500 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
    ctx.fillText(
      `${this.name} (${this.seated ? "Seated" : "Standing"})`,
      (this.w * rX) / 2,
      (this.h * rY) / 2,
    );
    ctx.fillText(
      `Capacity ${Commasize(this.capacity)}`,
      (this.w * rX) / 2,
      (this.h * rY) / 2 + 15,
    );
    ctx.restore();
  }

  getSeating() {
    return this.seated ? "Seated" : "Standing";
  }

  getCapacity() {
    return Commasize(this.capacity);
  }

  calculateMaxEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * (this.capacity - this.holdings));
    }

    return active.amount * (this.capacity - this.holdings);
  }

  getParent(nodes = []) {
    let pN = nodes.find((n) => n.identifier == this.parentNode);

    if (pN) return `${pN.name} `;

    return "";
  }

  calculateEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * this.booked);
    }

    return active.amount * this.booked;
  }

  getTitle() {
    return `${this.name} (${this.getSeating()})`;
  }

  getIdentifier() {
    if (this.getParent() !== "") {
      return `${this.getParent()} ${this.name}`;
    }

    return `${this.name}`;
  }

  getDescription(tiers = [], color = "black") {
    let tier = tiers.find((tier) => tier.name == this.tier);
    if (!tier)
      return `${this.text} ${this.name} has a max capacity of ${this.getCapacity()} and has no tier but has ${this.holdings} holdings.`;

    let maxEarnings = CurrencyFormatter(
      tier.amount * (this.capacity - this.holdings),
    );

    return `<span style="color: ${color}">${this.getIdentifier()}</span> has a capacity of <span style="color: ${color}">${this.getCapacity()} people</span> and belongs to the <span style="color: ${color}">${this.tier} tier</span>. Since it is a <span style="color: ${color}">${TierType(tier.percent)} tier</span>, you'll receive <span style="color: ${color}">${tier.percent ? tier.amount + "%" : "$" + CurrencyFormatter(tier.amount)} per ticket sold</span>. You have <span style="color: ${color}">${this.holdings} holdings</span>, so the max amount of money you'll make from <span style="color: ${color}"> ${this.getIdentifier()} is $${maxEarnings}</span>.`;
  }

  getTier(tiers = []) {
    let tier = tiers.find((tier) => tier.identifier == this.tier);
    if (!tier) return "Not Setup Yet";

    return tier.name;
  }

  getPrice() {
    return CurrencyFormatter(this.price);
  }

  component() {
    if (!this.validName || !this.validCapacity) return <></>;
    return (
      <svg width="100%" height="200">
        <defs>
          <filter id="shadow2">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="7"
              floodColor="rgba(0,0,0,0.15)"
            />
          </filter>
        </defs>
        <g>
          <rect
            width="90%"
            height="180"
            ry="10"
            rx="10"
            x="5%"
            y="10"
            style={{ fill: "#fff" }}
            filter="url(#shadow2)"
          />
          <text x="50%" y="43%" dominantBaseline="middle" textAnchor="middle">
            {this.getTitle()}
          </text>
          <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle">
            Capacity {Commasize(this.capacity)}
          </text>
        </g>
      </svg>
    );
  }
}

class Table {
  constructor(
    {
      identifier,
      name = "",
      capacity = "50",
      seated = true,
      lng = 835,
      lat = 465,
      w = 40,
      h = 40,
      holdings = 0,
      tier = "",
      tilt = 0,
      borders = [20, 20, 20, 20],
      price = 0,
      available = 0,
      booked = 0,
      seatsAvailable = 6,
      parentNode = null,
      extra = {},
    } = {
      identifier: "",
      name: "",
      capacity: "50",
      seated: true,
      lng: 885,
      lat: 465,
      w: 150,
      h: 150,
      tier: "",
      holdings: 0,
      price: 0,
      available: 0,
      booked: 0,
      seatsAvailable: 4,
      parentNode: null,
      extra: {},
    },
  ) {
    this.isDecorative = false;
    this.isExposed = false;
    this.icon = "bx bx-circle";
    this.text = "Table";
    this.type = "table";
    this.identifier = identifier;
    this.name = name;
    this.extra = extra;
    this.seated = true;
    this.seatsAvailable = seatsAvailable;
    this.capacity = 1;
    this.validName = this.name !== "";
    this.lng = lng;
    this.lat = lat;
    this.w = w;
    this.h = h;
    this.borders = borders;
    this.parentNode = parentNode;
    this.tilt = tilt;
    this.polygon = [
      [this.lng, this.lat],
      [this.lng, this.lat + this.h],
      [this.lng + this.w, this.lat + this.h],
      [this.lng + this.w, this.lat],
    ];
    this.tier = tier;
    this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
    if (this.holdings > this.capacity) this.holdings = 0;
    this.price = price;
    this.booked = booked;
    this.available = available;
  }

  // clicked(pointer) {
  //   return PIP([pointer.x, pointer.y], this.polygon);
  // }

  update({
    seated = null,
    name = null,
    capacity = null,
    lng = null,
    lat = null,
    w = null,
    h = null,
    tilt = null,
    borders = null,
    holdings = null,
    parentNode = null,
    tier = null,
  }) {
    if (name != null) {
      this.name = name;
    }
    if (seated != null) {
      this.seated = seated;
    }
    if (capacity) {
      this.capacity = parseInt(capacity.toString().replace(/[^0-9]/g, ""));
    }
    if (lng) {
      this.lng = parseFloat(lng);
    }
    if (lat) {
      this.lat = parseFloat(lat);
    }
    if (w) {
      this.w = parseInt(w);
    }
    if (h) {
      this.h = parseInt(h);
    }
    if (tilt != null) {
      this.tilt = parseFloat(tilt);
    }
    if (borders) {
      this.borders = borders.map((r) => parseFloat(r) || 0);
    }
    if (parentNode) {
      this.parentNode = parentNode;
    }
    if (holdings != null) {
      this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
      if (this.holdings > this.capacity) this.holdings = 0;
    }
    if (tier) {
      this.tier = tier;
    }
    return this;
  }

  pathisize(ctx, rX, rY) {
    if (!ctx) return;
    let verticies = [
      [(this.lng - 7.5) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, (this.lat + this.h) * rY],
      [(this.lng - 7.5) * rX, (this.lat + this.h) * rY],
    ];

    let origin = [verticies[0][0], verticies[0][1]]; // p, q
    let tiltRadians = (this.tilt * Math.PI) / 180; // negative because angle is clockwise

    let titledVerticies = verticies.map((vertici) => {
      // x' = (𝑥−𝑝)cos(𝜃)−(𝑦−𝑞)sin(𝜃)+𝑝
      // y' = (𝑥−𝑝)sin(𝜃)+(𝑦−𝑞)cos(𝜃)+𝑞.

      let xprime =
        (vertici[0] - origin[0]) * Math.cos(tiltRadians) -
        (vertici[1] - origin[1]) * Math.sin(tiltRadians) +
        origin[0];
      let yprime =
        (vertici[0] - origin[0]) * Math.sin(tiltRadians) +
        (vertici[1] - origin[1]) * Math.cos(tiltRadians) +
        origin[1];

      return [xprime, yprime];
    });

    this.polygon = titledVerticies;
    let p = new Path2D(`
      M${this.borders[0] * rX} 0
      h ${(this.w - this.borders[0] - this.borders[1]) * rX}
      a ${this.borders[1] * rX} ${this.borders[1] * rY} 0 0 1 ${this.borders[1] * rX} ${this.borders[1] * rY}
      v ${(this.h - this.borders[1] - this.borders[2]) * rY}
      a ${this.borders[2] * rX} ${this.borders[2] * rY} 0 0 1 -${this.borders[2] * rX} ${this.borders[2] * rY}
      h ${-(this.w - this.borders[2] - this.borders[3]) * rX}
      a ${this.borders[3] * rX} ${this.borders[3] * rY} 0 0 1 -${this.borders[3] * rX} -${this.borders[3] * rY}
      v ${-(this.h - this.borders[3] - this.borders[0]) * rY}
      a ${this.borders[0] * rX} ${this.borders[0] * rY} 0 0 1 ${this.borders[0] * rX} -${this.borders[0] * rY}
    `);
    ctx.fillStyle =
      this.lat < 0 || this.lng < 0 || this.lat > 1080 || this.lng > 1920
        ? "#F31260"
        : "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.translate(this.lng * rX, this.lat * rY);
    ctx.rotate((this.tilt * Math.PI) / 180);
    ctx.fill(p);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font =
      "500 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
    ctx.fillText(`${this.name}`, (this.w * rX) / 2, (this.h * rY) / 2);
    ctx.restore();
  }

  getSeating() {
    return this.seated ? "Seated" : "Standing";
  }

  getCapacity() {
    return Commasize(this.seatsAvailable);
  }

  getParent(nodes = []) {
    let pN = nodes.find((n) => n.identifier == this.parentNode);

    if (pN) return `${pN.name} `;

    return "";
  }

  calculateMaxEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * (this.capacity - this.holdings));
    }

    return active.amount * (this.capacity - this.holdings);
  }

  calculateEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * this.booked);
    }

    return active.amount * this.booked;
  }

  getTitle() {
    return `${this.text} ${this.name}`;
  }

  getIdentifier(nodes = [], parentFormatted = false) {
    if (this.getParent(nodes) !== "") {
      return `${this.getParent(nodes)} ${this.text} ${this.name}`;
    }

    if (parentFormatted && this.parentNode) {
      return `${this.parentNode} ${this.text} ${this.name}`;
    }

    return `${this.text} ${this.name}`;
  }

  getDescription(tiers = [], color = "black") {
    let tier = tiers.find((tier) => tier.name == this.tier);
    if (!tier)
      return `${this.text} ${this.name} has a max capacity of ${this.getCapacity()} and has no tier but has ${this.holdings} holdings.`;

    let maxEarnings = CurrencyFormatter(
      tier.amount * (this.capacity - this.holdings),
    );

    return `<span style="color: ${color}">${this.getIdentifier()}</span> has a capacity of <span style="color: ${color}">${this.getCapacity()} people</span> and belongs to the <span style="color: ${color}">${this.tier} tier</span>. Since it is a <span style="color: ${color}">${TierType(tier.percent)} tier</span>, you'll receive <span style="color: ${color}">${tier.percent ? tier.amount + "%" : "$" + CurrencyFormatter(tier.amount)} per ticket sold</span>. You have <span style="color: ${color}">${this.holdings} holdings</span>, so the max amount of money you'll make from <span style="color: ${color}"> ${this.getIdentifier()} is $${maxEarnings}</span>.`;
  }

  getTier(tiers = []) {
    let tier = tiers.find((tier) => tier.identifier == this.tier);
    if (!tier) return "Not Setup Yet";

    return tier.name;
  }

  getPrice() {
    return CurrencyFormatter(this.price);
  }

  component() {
    if (!this.validName || !this.validCapacity) return <></>;
    return (
      <svg width="100%" height="200">
        <defs>
          <filter id="shadow2">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="7"
              floodColor="rgba(0,0,0,0.15)"
            />
          </filter>
        </defs>
        <g>
          <rect
            width="90%"
            height="180"
            ry="10"
            rx="10"
            x="5%"
            y="10"
            style={{ fill: "#fff" }}
            filter="url(#shadow2)"
          />
          <text x="50%" y="43%" dominantBaseline="middle" textAnchor="middle">
            {this.getTitle()}
          </text>
          <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle">
            Capacity {Commasize(this.capacity)}
          </text>
        </g>
      </svg>
    );
  }
}

class Seat {
  constructor(
    {
      identifier,
      name = "",
      seated = true,
      lng = 835,
      lat = 465,
      w = 30,
      h = 30,
      holdings = 0,
      tier = "",
      tilt = 0,
      borders = [15, 15, 15, 15],
      price = 0,
      available = 0,
      booked = 0,
      parentNode = null,
      extra = {},
    } = {
      identifier: "",
      name: "",
      seated: true,
      lng: 885,
      lat: 465,
      w: 30,
      h: 30,
      tier: "",
      holdings: 0,
      price: 0,
      available: 0,
      booked: 0,
      parentNode: null,
      extra: {},
    },
  ) {
    this.isDecorative = false;
    this.isExposed = true;
    this.icon = "bx bx-up-arrow";
    this.text = "Seat";
    this.type = "seat";
    this.identifier = identifier;
    this.name = name;
    this.extra = extra;
    this.seated = true;
    this.seatsAvailable = 1;
    this.capacity = 1;
    this.validName = this.name !== "";
    this.lng = lng;
    this.lat = lat;
    this.w = w;
    this.h = h;
    this.borders = borders;
    this.tilt = tilt;
    this.parentNode = parentNode;
    this.polygon = [
      [this.lng, this.lat],
      [this.lng, this.lat + this.h],
      [this.lng + this.w, this.lat + this.h],
      [this.lng + this.w, this.lat],
    ];
    this.tier = tier;
    this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
    if (this.holdings > this.capacity) this.holdings = 0;
    this.price = price;
    this.booked = booked;
    this.available = available;
  }

  // clicked(pointer) {
  //   return PIP([pointer.x, pointer.y], this.polygon);
  // }

  update({
    seated = null,
    name = null,
    lng = null,
    lat = null,
    w = null,
    h = null,
    tilt = null,
    borders = null,
    holdings = null,
    tier = null,
    parentNode = null,
  }) {
    if (name != null) {
      this.name = name;
    }
    if (seated != null) {
      this.seated = seated;
    }
    if (lng) {
      this.lng = parseFloat(lng);
    }
    if (lat) {
      this.lat = parseFloat(lat);
    }
    if (w) {
      this.w = parseInt(w);
    }
    if (h) {
      this.h = parseInt(h);
    }
    if (tilt != null) {
      this.tilt = parseFloat(tilt);
    }
    if (borders) {
      this.borders = borders.map((r) => parseFloat(r) || 0);
    }
    if (holdings != null) {
      this.holdings = isNaN(parseInt(holdings)) ? 0 : parseInt(holdings);
      if (this.holdings > this.capacity) this.holdings = 0;
    }
    if (tier) {
      this.tier = tier;
    }
    if (parentNode) {
      this.parentNode = parentNode;
    }
    return this;
  }

  pathisize(ctx, rX, rY) {
    if (!ctx) return;
    let verticies = [
      [(this.lng - 7.5) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, (this.lat + this.h) * rY],
      [(this.lng - 7.5) * rX, (this.lat + this.h) * rY],
    ];

    let origin = [verticies[0][0], verticies[0][1]]; // p, q
    let tiltRadians = (this.tilt * Math.PI) / 180; // negative because angle is clockwise

    let titledVerticies = verticies.map((vertici) => {
      // x' = (𝑥−𝑝)cos(𝜃)−(𝑦−𝑞)sin(𝜃)+𝑝
      // y' = (𝑥−𝑝)sin(𝜃)+(𝑦−𝑞)cos(𝜃)+𝑞.

      let xprime =
        (vertici[0] - origin[0]) * Math.cos(tiltRadians) -
        (vertici[1] - origin[1]) * Math.sin(tiltRadians) +
        origin[0];
      let yprime =
        (vertici[0] - origin[0]) * Math.sin(tiltRadians) +
        (vertici[1] - origin[1]) * Math.cos(tiltRadians) +
        origin[1];

      return [xprime, yprime];
    });

    this.polygon = titledVerticies;
    let p = new Path2D(`
      M${this.borders[0] * rX} 0
      h ${(this.w - this.borders[0] - this.borders[1]) * rX}
      a ${this.borders[1] * rX} ${this.borders[1] * rY} 0 0 1 ${this.borders[1] * rX} ${this.borders[1] * rY}
      v ${(this.h - this.borders[1] - this.borders[2]) * rY}
      a ${this.borders[2] * rX} ${this.borders[2] * rY} 0 0 1 -${this.borders[2] * rX} ${this.borders[2] * rY}
      h ${-(this.w - this.borders[2] - this.borders[3]) * rX}
      a ${this.borders[3] * rX} ${this.borders[3] * rY} 0 0 1 -${this.borders[3] * rX} -${this.borders[3] * rY}
      v ${-(this.h - this.borders[3] - this.borders[0]) * rY}
      a ${this.borders[0] * rX} ${this.borders[0] * rY} 0 0 1 ${this.borders[0] * rX} -${this.borders[0] * rY}
    `);
    ctx.fillStyle =
      this.lat < 0 || this.lng < 0 || this.lat > 1080 || this.lng > 1920
        ? "#F31260"
        : "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.translate(this.lng * rX, this.lat * rY);
    ctx.rotate((this.tilt * Math.PI) / 180);
    ctx.fill(p);
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.font =
      "500 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
    ctx.fillText(`${this.name}`, (this.w * rX) / 2, (this.h * rY) / 2);
    ctx.restore();
  }

  getSeating() {
    return this.seated ? "Seated" : "Standing";
  }

  getCapacity() {
    return Commasize(this.capacity);
  }

  calculateMaxEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * (this.capacity - this.holdings));
    }

    return active.amount * (this.capacity - this.holdings);
  }

  calculateEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * this.booked);
    }

    return active.amount * this.booked;
  }

  getTitle(nodes = []) {
    if (nodes.length != 0) {
      let pN = nodes.find((n) => n.identifier == this.parentNode);

      if (pN) return `${pN.name} - ${this.text} ${this.name}`;
    }

    return `${this.text} ${this.name}`;
  }

  getIdentifier(nodes = []) {
    if (nodes.length != 0) {
      let pN = nodes.find((n) => n.identifier == this.parentNode);

      if (pN) return `${pN.name} - ${this.text} ${this.name}`;
    }
    return `${this.text} ${this.name}`;
  }

  getParent(nodes = []) {
    let pN = nodes.find((n) => n.identifier == this.parentNode);

    if (pN) return `${pN.name}`;

    return `${this.text} ${this.name}`;
  }

  getDescription(tiers = [], color = "black") {
    let tier = tiers.find((tier) => tier.name == this.tier);
    if (!tier)
      return `${this.text} ${this.name} has a max capacity of ${this.getCapacity()} and has no tier but has ${this.holdings} holdings.`;

    let maxEarnings = CurrencyFormatter(
      tier.amount * (this.capacity - this.holdings),
    );

    return `<span style="color: ${color}">${this.getIdentifier()}</span> has a capacity of <span style="color: ${color}">${this.getCapacity()} people</span> and belongs to the <span style="color: ${color}">${this.tier} tier</span>. Since it is a <span style="color: ${color}">${TierType(tier.percent)} tier</span>, you'll receive <span style="color: ${color}">${tier.percent ? tier.amount + "%" : "$" + CurrencyFormatter(tier.amount)} per ticket sold</span>. You have <span style="color: ${color}">${this.holdings} holdings</span>, so the max amount of money you'll make from <span style="color: ${color}"> ${this.getIdentifier()} is $${maxEarnings}</span>.`;
  }

  getTier(tiers = []) {
    let tier = tiers.find((tier) => tier.identifier == this.tier);
    if (!tier) return "Not Setup Yet";

    return tier.name;
  }

  getPrice() {
    return CurrencyFormatter(this.price);
  }

  component() {
    if (!this.validName || !this.validCapacity) return <></>;
    return (
      <svg width="100%" height="200">
        <defs>
          <filter id="shadow2">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="7"
              floodColor="rgba(0,0,0,0.15)"
            />
          </filter>
        </defs>
        <g>
          <rect
            width="90%"
            height="180"
            ry="10"
            rx="10"
            x="5%"
            y="10"
            style={{ fill: "#fff" }}
            filter="url(#shadow2)"
          />
          <text x="50%" y="43%" dominantBaseline="middle" textAnchor="middle">
            {this.getTitle()}
          </text>
          <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle">
            Capacity {Commasize(this.capacity)}
          </text>
        </g>
      </svg>
    );
  }
}

class Misc {
  constructor(
    {
      identifier = "",
      name = "",
      lng = 835,
      lat = 465,
      w = 250,
      h = 150,
      tilt = 0,
      borders = [5, 5, 5, 5],
      extra = {},
    } = {
      identifier: "",
      name: "",
      lng: 885,
      lat: 465,
      w: 150,
      h: 150,
      extra: {},
    },
  ) {
    this.isExposed = false;
    this.isDecorative = true;
    this.icon = "bx bxs-shapes";
    this.text = "Decorator";
    this.type = "misc";
    this.identifier = identifier;
    this.extra = extra;
    this.name = name;
    this.validName = this.name !== "";
    this.lng = lng;
    this.lat = lat;
    this.borders = borders;
    this.tilt = tilt;
    this.w = w;
    this.h = h;
    this.polygon = [
      [this.lng, this.lat],
      [this.lng, this.lat + this.h],
      [this.lng + this.w, this.lat + this.h],
      [this.lng + this.w, this.lat],
    ];
  }

  // clicked(pointer) {
  //   return PIP([pointer.x, pointer.y], this.polygon);
  // }

  update({
    lng = null,
    name = null,
    lat = null,
    w = null,
    borders = null,
    tilt = null,
    h = null,
  }) {
    if (name != null) {
      this.name = name;
    }
    if (lng) {
      this.lng = parseFloat(lng);
    }
    if (lat) {
      this.lat = parseFloat(lat);
    }
    if (w) {
      this.w = parseInt(w);
    }
    if (h) {
      this.h = parseInt(h);
    }
    if (tilt != null) {
      this.tilt = parseFloat(tilt);
    }
    if (borders) {
      this.borders = borders.map((r) => parseFloat(r) || 0);
    }
    return this;
  }

  pathisize(ctx, rX, rY) {
    if (!ctx) return;
    let verticies = [
      [(this.lng - 7.5) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, this.lat * rY],
      [(this.lng + this.w) * rX, (this.lat + this.h) * rY],
      [(this.lng - 7.5) * rX, (this.lat + this.h) * rY],
    ];

    let origin = [verticies[0][0], verticies[0][1]]; // p, q
    let tiltRadians = (this.tilt * Math.PI) / 180; // negative because angle is clockwise

    let titledVerticies = verticies.map((vertici) => {
      // x' = (𝑥−𝑝)cos(𝜃)−(𝑦−𝑞)sin(𝜃)+𝑝
      // y' = (𝑥−𝑝)sin(𝜃)+(𝑦−𝑞)cos(𝜃)+𝑞.

      let xprime =
        (vertici[0] - origin[0]) * Math.cos(tiltRadians) -
        (vertici[1] - origin[1]) * Math.sin(tiltRadians) +
        origin[0];
      let yprime =
        (vertici[0] - origin[0]) * Math.sin(tiltRadians) +
        (vertici[1] - origin[1]) * Math.cos(tiltRadians) +
        origin[1];

      return [xprime, yprime];
    });

    this.polygon = titledVerticies;
    let p = new Path2D(`
      M${this.borders[0] * rX} 0
      h ${(this.w - this.borders[0] - this.borders[1]) * rX}
      a ${this.borders[1] * rX} ${this.borders[1] * rY} 0 0 1 ${this.borders[1] * rX} ${this.borders[1] * rY}
      v ${(this.h - this.borders[1] - this.borders[2]) * rY}
      a ${this.borders[2] * rX} ${this.borders[2] * rY} 0 0 1 -${this.borders[2] * rX} ${this.borders[2] * rY}
      h ${-(this.w - this.borders[2] - this.borders[3]) * rX}
      a ${this.borders[3] * rX} ${this.borders[3] * rY} 0 0 1 -${this.borders[3] * rX} -${this.borders[3] * rY}
      v ${-(this.h - this.borders[3] - this.borders[0]) * rY}
      a ${this.borders[0] * rX} ${this.borders[0] * rY} 0 0 1 ${this.borders[0] * rX} -${this.borders[0] * rY}
    `);
    ctx.fillStyle =
      this.lat < 0 || this.lng < 0 || this.lat > 1080 || this.lng > 1920
        ? "#F31260"
        : "#333";
    ctx.save();
    ctx.translate(this.lng * rX, this.lat * rY);
    ctx.rotate((this.tilt * Math.PI) / 180);
    ctx.fill(p);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font =
      "500 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif";
    ctx.fillText(
      `${this.getTitle()}`,
      (this.w * rX) / 2,
      (this.h * rY) / 2 + 10,
    );
    ctx.restore();
  }

  getTitle() {
    return `${this.name}`;
  }

  getIdentifier() {
    return `${this.text} ${this.name}`;
  }

  component() {
    if (!this.validName || !this.validCapacity) return <></>;
    return (
      <svg width="100%" height="200">
        <defs>
          <filter id="shadow2">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="7"
              floodColor="rgba(0,0,0,0.15)"
            />
          </filter>
        </defs>
        <g>
          <rect
            width="90%"
            height="180"
            ry="10"
            rx="10"
            x="5%"
            y="10"
            style={{ fill: "#fff" }}
            filter="url(#shadow2)"
          />
          <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle">
            {this.getTitle()}
          </text>
        </g>
      </svg>
    );
  }
}

class Paper {
  constructor({
    identifier,
    name = "",
    capacity = "50",
    seated = false,
    tier = "",
    price = 0,
    available = 0,
    extra = {},
  }) {
    this.isDecorative = false;
    this.isExposed = false;
    this.icon = "bx bx-rectangle";
    this.text = "Physical";
    this.type = "physical";
    this.identifier = identifier;
    this.name = name;
    this.extra = extra;
    this.seated = seated != null ? seated : false;
    try {
      if (typeof capacity == "string") {
        this.capacity = capacity.replace(/[^0-9]/g, "");
      }
      this.capacity = parseInt(capacity);
      this.validCapacity =
        this.capacity === Math.ceil(parseFloat(this.capacity)) && capacity > 0;
    } catch (e) {
      this.validCapacity = false;
    }
    this.validName = this.name !== "";
    this.tier = tier;
    if (this.holdings > this.capacity) this.holdings = 0;
    this.price = price;
    this.available = available;
  }

  getSeating() {
    return this.seated ? "Seated" : "Standing";
  }

  getCapacity() {
    return Commasize(this.capacity);
  }

  calculateMaxEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * (this.capacity - this.holdings));
    }

    return active.amount * (this.capacity - this.holdings);
  }

  calculateEarnings(tiers, f = false) {
    let active = tiers.find((tier) => tier.identifier == this.tier);
    if (!active) return null;

    if (f) {
      return CurrencyFormatter(active.amount * this.booked);
    }

    return active.amount * this.booked;
  }

  getTitle() {
    return `${this.name} (${this.getSeating()})`;
  }

  getIdentifier() {
    return `${this.name}`;
  }

  getDescription(tiers = [], color = "black") {
    let tier = tiers.find((tier) => tier.name == this.tier);
    if (!tier)
      return `${this.text} ${this.name} has a max capacity of ${this.getCapacity()} and has no tier but has ${this.holdings} holdings.`;

    let maxEarnings = CurrencyFormatter(
      tier.amount * (this.capacity - this.holdings),
    );

    return `<span style="color: ${color}">${this.getIdentifier()}</span> has a capacity of <span style="color: ${color}">${this.getCapacity()} people</span> and belongs to the <span style="color: ${color}">${this.tier} tier</span>. Since it is a <span style="color: ${color}">${TierType(tier.percent)} tier</span>, you'll receive <span style="color: ${color}">${tier.percent ? tier.amount + "%" : "$" + CurrencyFormatter(tier.amount)} per ticket sold</span>. You have <span style="color: ${color}">${this.holdings} holdings</span>, so the max amount of money you'll make from <span style="color: ${color}"> ${this.getIdentifier()} is $${maxEarnings}</span>.`;
  }

  getTier(tiers = []) {
    let tier = tiers.find((tier) => tier.identifier == this.tier);
    if (!tier) return "Not Setup Yet";

    return tier.name;
  }

  getPrice() {
    return CurrencyFormatter(this.price);
  }

  component() {
    return <></>;
  }
}

export { GASection, Misc, Table, Seat, Paper };
export default [GASection, Table, Seat, Misc];

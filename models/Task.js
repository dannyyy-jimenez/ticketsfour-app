import moment from "moment/moment";

class Address {
  constructor({
    city,
    state,
    addressLine1 = "",
    addressLine2 = "",
    addressLine3 = "",
    zipcode = "",
    lat = 0,
    lng = 0,
  }) {
    this.city = city;
    this.state = state;
    this.addressLine1 = addressLine1;
    this.addressLine2 = addressLine2;
    this.addressLine3 = addressLine3;
    this.zipcode = zipcode;
    this.lat = lat;
    this.lng = lng;

    this.address = "";

    if (this.addressLine1 != "") {
      this.address += this.addressLine1;
    }
    if (this.addressLine2 != "") {
      this.address += " " + this.addressLine2;
    }
    if (this.addressLine3 != "") {
      this.address += " " + this.addressLine3;
    }
    if (this.city != "") {
      this.address += ", " + this.city;
    }
    if (this.state != "") {
      this.address += ", " + this.state;
    }
    if (this.zipcode != "") {
      this.address += " " + this.zipcode;
    }
  }
}

class Customer {
  constructor({ firstName, lastName, phone, email, businessName = "" }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.email = email;
    this.businessName = businessName;

    this.name = firstName + " " + lastName;
  }
}

export default class Task {
  constructor({
    id,
    customer,
    address,
    todo,
    createdAt,
    reference = "",
    isPreTask = false,
    requireProof = false,
    requireApproval = false,
    requireCheckIn = false,
    duteedNo = 1,
    onDutyNum = 0,
    todos = [],
    checkedIn = false,
    proofTurnedIn = false,
    proof = [],
    checkInAt = null,
    selectedProofs = [],
    status = "P",
    notes = "",
    total = 0,
    todosSize = 0,
  }) {
    this.id = id;
    this.customer = new Customer({ ...customer });
    this.address = new Address({ ...address });
    this.todo = todo;
    this.isPreTask = isPreTask;
    this.requireProof = requireProof;
    this.requireApproval = requireApproval;
    this.requireCheckIn = requireCheckIn;
    this.createdAt = moment.utc(createdAt);
    this.duteedNo = duteedNo;
    this.onDutyNum = onDutyNum;
    this.assignedComplete = this.onDutyNum >= this.duteedNo;
    this.todos = todos;
    this.checkedIn = checkedIn;
    this.proofTurnedIn = proofTurnedIn;
    this.proof = proof;
    this.checkInAt = moment.utc(checkInAt);
    this.selectedProofs = selectedProofs;
    this.status = status;
    this.notes = notes;
    this.total = total;
    this.todosSize = todosSize;
    this.reference = reference;

    this.createdAtF = this.createdAt.format("MM/DD/YY");
  }

  timeAgo() {
    return this.createdAt.fromNow();
  }
}

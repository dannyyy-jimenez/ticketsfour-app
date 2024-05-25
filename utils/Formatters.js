import { Text } from "react-native";
import Style, { theme } from "./Styles";
import { View } from "react-native";

const NumFormatter = (n) => {
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return n;
};

const CurrencyFormatter = (n) => {
  if (n == null || typeof n == "undefined") n = 0;
  n /= 100;
  if (isNaN(n)) {
    return "0.00";
  }
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Commasize = (s = "") => {
  if (typeof s != "string") s = s.toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const TierType = (p = false) => {
  return p ? "Percent-based" : "Fixed-rate";
};

const Pluralize = (n = 0, s = "", showN = true) => {
  if (s.match(/[^ ]*[s|x|z|sh|ch]$/g)) return n + " " + s + "es";

  if (n == 1) return (showN ? n + " " : "") + s;

  return (showN ? n + " " : "") + s + "s";
};

const PhoneFormatter = (phoneNumberString = "") => {
  let cc = "";
  if (phoneNumberString.length > 0 && phoneNumberString[0] == "+") {
    cc = phoneNumberString.slice(0, 2) + " ";
    phoneNumberString = phoneNumberString.slice(2);
  }
  phoneNumberString = phoneNumberString.replace(/[^0-9\.]+/g, "");
  if (phoneNumberString.match(/^(\d{3}\d{1,3})?$/)) {
    return cc + phoneNumberString.replace(/^(\d{3})(\d{0,3})?$/, "($1) $2");
  } else if (phoneNumberString.match(/^(\d{3})(\d{3})(\d{1,4})$/)) {
    return (
      cc + phoneNumberString.replace(/^(\d{3})(\d{3})(\d{0,4})$/, "($1) $2-$3")
    );
  }
  return cc + phoneNumberString;
};

const DateFormatter = (dateString) => {
  if (dateString.match(/^(\d{1}\/)/)) {
    dateString = "0" + dateString;
  } else if (dateString.match(/^(\d{1}-)/)) {
    dateString = "0" + dateString;
  }

  if (dateString.match(/^(\d{2}\/\d{1}\/)/)) {
    dateString = dateString.slice(0, 3) + "0" + dateString.slice(3);
  } else if (dateString.match(/^(\d{2}-\d{1}\/)/)) {
    dateString = dateString.slice(0, 3) + "0" + dateString.slice(3);
  }

  dateString = dateString.replace(/[^0-9\.]+/g, "");
  if (dateString.match(/^(\d{2}\d{1,2})?$/)) {
    return dateString.replace(/^(\d{2})(\d{0,2})?$/, "$1-$2");
  } else if (dateString.match(/^(\d{2})(\d{2})(\d{1,4})$/)) {
    return dateString.replace(/^(\d{2})(\d{2})(\d{0,4})$/, "$1-$2-$3");
  }
  return dateString;
};

const EmailValidator = (email) => {
  return email.match(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
  );
};

const ReplaceWithStyle = (string, replacer, component) => {
  let parts = string.split(replacer);

  return parts.map((p, pidx) => (
    <>
      {pidx % 2 == 1 && <Text key={"pos-j-" + pidx}>{component}</Text>}
      <Text key={"pos-" + pidx} style={[Style.text.bold]}>
        {p}
      </Text>
    </>
  ));
};

export {
  NumFormatter,
  CurrencyFormatter,
  Commasize,
  TierType,
  Pluralize,
  PhoneFormatter,
  DateFormatter,
  EmailValidator,
  ReplaceWithStyle,
};

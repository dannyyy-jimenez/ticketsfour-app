import { StyleSheet } from "react-native";

const theme = {
  "color-primary-100": "#fee6e8",
  "color-primary-200": "#fecdd2",
  "color-primary-300": "#fc5064",
  "color-primary-400": "#fb374e",
  "color-primary-500": "#fb0622",
  "color-primary-600": "#3575dd",
  "color-primary-700": "#e1051e",
  "color-primary-800": "#c8041b",
  "color-primary-900": "#c8041b",

  "color-organizer-200": "#CCDDFD",
  "color-organizer-300": "#6899F9",
  "color-organizer-500": "#0456f5",
  "color-organizer-800": "#6899f9",

  "color-success-100": "#D5FDD5",
  "color-success-200": "#ABFBB2",
  "color-success-300": "#80F495",
  "color-success-400": "#5FEA86",
  "color-success-500": "#2EDD71",
  "color-success-600": "#21BE6D",
  "color-success-700": "#179F66",
  "color-success-800": "#0E805B",
  "color-success-900": "#086A54",
  "color-info-100": "#CFFEFB",
  "color-info-200": "#A0FBFD",
  "color-info-300": "#71ECF9",
  "color-info-400": "#4DD8F4",
  "color-info-500": "#15BAED",
  "color-info-600": "#0F91CB",
  "color-info-700": "#0A6DAA",
  "color-info-800": "#064E89",
  "color-info-900": "#043871",
  "color-warning-100": "#FEFCCF",
  "color-warning-200": "#FEFAA0",
  "color-warning-300": "#FEF671",
  "color-warning-400": "#FDF24E",
  "color-warning-500": "#FCEC14",
  "color-warning-600": "#D8C90E",
  "color-warning-700": "#B5A70A",
  "color-warning-800": "#928506",
  "color-warning-900": "#786D03",
  "color-danger-100": "#FFDFCE",
  "color-danger-200": "#ffcfcf",
  "color-danger-300": "#FF876E",
  "color-danger-400": "#FF594A",
  "color-danger-500": "#ff0e0e",
  "color-danger-600": "#DB0A1C",
  "color-danger-700": "#B70725",
  "color-danger-800": "#930429",
  "color-danger-900": "#7A022C",
  "color-basic-100": "#FFFFFF",
  "color-basic-100-40": "rgba(255,255,255,0.4)",
  "color-basic-200": "#FCFCFC",
  "color-basic-300": "#FAFAFA",
  "color-basic-400": "#F1F1F1",
  "color-basic-500": "#E4E4E4",
  "color-basic-600": "#D3D3D3",
  "color-basic-700": "#555555",
  "color-basic-800": "#333333",
  "color-basic-800-40": "rgba(11, 11, 11, 0.8)",
  "color-basic-800-10": "rgba(11, 11, 11, 0.4)",
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: theme["color-basic-100"],
    paddingVertical: 15,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderBottomWidth: 5,
    margin: 10,
  },
  cardBlank: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: theme["color-basic-100"],
    paddingVertical: 15,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  transparency: {
    lg: {
      opacity: 0.5,
    },
    md: {
      opacity: 0.7,
    },
    sm: {
      opacity: 0.85,
    },
  },
  text: {
    successDark: {
      color: theme["color-success-800"],
    },
    success: {
      color: theme["color-success-400"],
    },
    primaryDark: {
      color: theme["color-primary-800"],
    },
    primary: {
      color: theme["color-primary-500"],
    },
    organizerDark: {
      color: theme["color-organizer-800"],
    },
    organizer: {
      color: theme["color-organizer-500"],
    },
    danger: {
      color: theme["color-danger-500"],
    },
    dangerDark: {
      color: theme["color-danger-800"],
    },
    basic: {
      color: theme["color-basic-100"],
    },
    dark: {
      color: theme["color-basic-700"],
    },
    bold: {
      fontWeight: "700",
    },
    semibold: {
      fontWeight: "600",
    },
    normal: {
      fontWeight: "500",
    },
    light: {
      fontWeight: "300",
    },
    xxxl: {
      fontSize: 30,
    },
    xxl: {
      fontSize: 26,
    },
    xl: {
      fontSize: 22,
    },
    lg: {
      fontSize: 18,
    },
    md: {
      fontSize: 14,
    },
    sm: {
      fontSize: 12,
    },
    xs: {
      fontSize: 10,
    },
    center: {
      textAlign: "center",
    },
    strike: {
      textDecorationLine: "strike",
    },
    italic: {
      fontStyle: "italic",
    },
  },
  input: {
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme["color-basic-400"],
      height: 50,
      borderRadius: 6,
      paddingHorizontal: 15,
    },
    multiline: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme["color-basic-400"],
      borderRadius: 6,
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    prefix: {
      marginRight: 10,
    },
    text: {
      fontSize: 16,
      flex: 1,
      height: "100%",
    },
    otp: {
      backgroundColor: theme["color-basic-400"],
      width: 45,
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },
  },
  button: {
    container: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme["color-primary-500"],
      height: 50,
      borderRadius: 6,
      paddingHorizontal: 15,
    },
    prefix: {
      marginRight: 10,
    },
    suffix: {
      marginLeft: 10,
    },
    text: {
      fontSize: 16,
      flex: 1,
      textAlign: "center",
      color: theme["color-basic-100"],
    },
    disabled: {
      opacity: 0.2,
    },

    round: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme["color-basic-400"],
      height: 30,
      width: 30,
      borderRadius: 15,
    },
  },
  border: {
    primary: {
      borderColor: theme["color-primary-500"],
    },
  },
  divider: {
    width: "110%",
    height: 3,
    backgroundColor: theme["color-basic-500"],
    left: -10,
  },
  containers: {
    row: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    column: {
      justifyContent: "center",
      alignItems: "center",
    },
  },
  cards: {
    product: {
      width: 140,
      padding: 6,
      overflow: "hidden",
    },
    exposeCreative: {
      height: 250,
      width: 250,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme["color-primary-200"],
    },
    cover: {
      height: 300,
      minWidth: 350,
      borderRadius: 12,
      backgroundColor: theme["color-primary-200"],
      overflow: "hidden",
    },
    coverSide: {
      width: 150,
      borderTopLeftRadius: 70,
      borderBottomLeftRadius: 70,
    },
    half: {
      height: 300,
      minWidth: 160,
      borderRadius: 8,
      backgroundColor: theme["color-primary-200"],
      overflow: "hidden",
    },
    creativeTextContainer: {
      height: 30,
      width: 130,
      backgroundColor: theme["color-primary-300"],
      position: "absolute",
      bottom: 0,
      paddingHorizontal: 8,
    },
    creativeText: {
      height: 120,
      width: 130,
      borderRadius: 8,
      backgroundColor: theme["color-primary-200"],
      overflow: "hidden",
    },
    banner: {
      height: 180,
      width: "90%",
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: theme["color-primary-200"],
    },
    showoff: {
      minHeight: 150,
      width: "90%",
      borderRadius: 6,
      padding: 10,
    },
  },
  progress: {
    bottom: {
      position: "absolute",
      bottom: -8,
      left: -8,
    },
    bordered: {
      marginTop: 8,
      height: 6,
      borderRadius: 4,
    },
    pending: {
      backgroundColor: theme["color-basic-500"],
    },
    complete: {
      backgroundColor: theme["color-primary-400"],
    },
  },
  background: {
    danger: {
      backgroundColor: theme["color-danger-400"],
    },
    dangerLight: {
      backgroundColor: theme["color-danger-200"],
    },
    primaryLight: {
      backgroundColor: theme["color-primary-200"],
    },
    primary: {
      backgroundColor: theme["color-primary-400"],
    },
    basicLight: {
      backgroundColor: theme["color-basic-500"],
    },
    successLight: {
      backgroundColor: theme["color-success-200"],
    },
    successDark: {
      backgroundColor: theme["color-success-700"],
    },
  },
  border: {
    primaryDark: {
      borderWidth: 1.5,
      borderColor: theme["color-primary-400"],
    },
    basicDark: {
      borderWidth: 1.5,
      borderColor: theme["color-basic-800"],
    },
    dangerDark: {
      borderWidth: 1.5,
      borderColor: theme["color-danger-500"],
    },
    successDark: {
      borderWidth: 1.5,
      borderColor: theme["color-success-700"],
    },
    coupon: {
      borderStyle: "dashed",
      borderWidth: 2,
      borderColor: theme["color-primary-500"],
    },
  },
  bottomBar: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: theme["color-basic-100"],
    bottom: -40,
    left: -10,
    position: "absolute",
    paddingBottom: 40,
  },
  elevated: {
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: theme["color-basic-100"],
  },
  badge: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    backgroundColor: theme["color-primary-500"],
    shadowColor: theme["color-primary-300"],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  skeleton: {
    text: {
      overflow: "hidden",
      marginTop: 4,
      borderRadius: 4,
      height: 25,
    },
  },
});

export { theme };

export default styles;

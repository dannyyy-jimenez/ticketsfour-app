import { Dimensions, View, Text } from "react-native";
import React from "react";
import ActionSheet from "react-native-actions-sheet";
import { useLocalization } from "../../locales/provider";
import { useSession } from "../ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Style, { theme } from "../Styles";
import { CurrencyFormatter, NumFormatter } from "../Formatters";
import { PieChart } from "react-native-svg-charts";
import { Text as SvgText } from "react-native-svg";
import moment from "moment/moment";

function PayoutViewSheet({ sheetId, payload }) {
  const { session } = useSession();
  const { width, height } = Dimensions.get("window");
  const { i18n } = useLocalization();
  const [isLoading, setIsLoading] = React.useState(false);
  const { payout } = payload;

  const breakdown = React.useMemo(() => {
    let _breakdown = [];

    if (payout.breakdown.tax > 0) {
      _breakdown.push({
        key: "tax",
        value: payout.breakdown.tax,
        label: `$${NumFormatter(payout.breakdown.tax)}`,
        svg: { fill: theme["color-basic-600"] },
      });
    }

    if (payout.breakdown.venue > 0) {
      _breakdown.push({
        key: "venue",
        value: payout.breakdown.venue,
        label: `$${NumFormatter(payout.breakdown.venue / 100)}`,
        svg: { fill: theme["color-organizer-800"] },
        arc: { cornerRadius: 6 },
      });
    }

    if (payout.breakdown.promoter > 0) {
      _breakdown.push({
        key: "promoter",
        value: payout.breakdown.promoter,
        label: `$${NumFormatter(payout.breakdown.promoter / 100)}`,
        svg: { fill: theme["color-organizer-500"] },
        arc: { outerRadius: "130%", cornerRadius: 10 },
      });
    }

    return _breakdown;
  }, [payout]);

  const Labels = ({ slices, height, width }) => {
    return slices.map((slice, index) => {
      const { labelCentroid, pieCentroid, data } = slice;

      return (
        <SvgText
          key={index}
          x={pieCentroid[0]}
          y={pieCentroid[1]}
          fill={theme["color-basic-100"]}
          textAnchor={"middle"}
          alignmentBaseline={"middle"}
          fontSize={16}
          stroke={theme["color-basic-100"]}
          strokeWidth={0.2}
        >
          {data.label}
        </SvgText>
      );
    });
  };

  return (
    <ActionSheet
      id={sheetId}
      keyboardHandlerEnabled={false}
      useBottomSafeAreaPadding={false}
      gestureEnabled={true}
      indicatorStyle={{ backgroundColor: theme["color-organizer-500"] }}
      containerStyle={{
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}
    >
      <View style={[Style.containers.column, { marginTop: 10 }]}>
        <Text
          style={[
            Style.text.organizer,
            Style.text.xl,
            Style.text.semibold,
            { textAlign: "center" },
          ]}
        >
          ${CurrencyFormatter(payout.amount)} {i18n.t("payout")}
        </Text>
        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            { textAlign: "center", marginTop: 6 },
          ]}
        >
          {payout.event}
        </Text>

        <PieChart
          style={{ height: 300, width: 350 }}
          outerRadius={"70%"}
          innerRadius={10}
          valueAccessor={({ item }) => parseInt(item.value)}
          data={breakdown}
        >
          <Labels />
        </PieChart>

        <Text
          style={[
            Style.text.dark,
            Style.text.semibold,
            Style.text.lg,
            { marginTop: 10 },
          ]}
        >
          {i18n.t("payoutInitiated")}{" "}
          {moment(payout.date).format("ddd, MMM Do")}
        </Text>
      </View>
    </ActionSheet>
  );
}

export { PayoutViewSheet };
export default PayoutViewSheet;

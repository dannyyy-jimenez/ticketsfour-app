import { Link } from "expo-router";
import React from "react";
import Style, { theme } from "../Styles";
import { Text, View } from "react-native";
import { Image } from "expo-image";

export default function FancyComposer({ nodes }) {
  const getElement = (block, bidx) => {
    let props = {
      key: block.key,
      style: {},
    };

    let element;
    let wrapper;

    if (block.text.length == 0) {
      element = (
        <>
          <View style={{ marginVertical: 10 }} />
        </>
      );

      return element;
    }

    let size = block.inlineStyleRanges.find((s) =>
      s.style.includes("fontsize-"),
    );

    if (size) {
      props.style.fontSize = parseInt(size.style.split("-")[1]);
    }

    // handle types
    if (block.type == "header-one") props["h1"] = true;
    if (block.type == "header-two") props["h2"] = true;
    if (block.type == "header-three") props["h3"] = true;
    if (block.type == "header-four")
      props.style = {
        ...props.style,
        ...Style.text.xl,
        ...Style.text.semibold,
      };
    if (block.type == "header-five") props["h5"] = true;
    if (block.type == "header-six") props["h6"] = true;
    if (block.type == "blockquote") {
      props["blockquote"] = true;
    }
    if (block.type == "code") {
      wrapper = ({ child }) => (
        <View>
          <View>{child}</View>
        </View>
      );
    }

    if (block.type == "ordered-list-item") {
      wrapper = ({ child }) => (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text>• {child}</Text>
        </View>
      );
    }

    if (block.type == "unordered-list-item") {
      wrapper = ({ child }) => (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text>{child}</Text>
        </View>
      );
    }

    props.style = { ...props.style, ...block.data };

    if (Object.keys(props.style).includes("text-align")) {
      props.style.textAlign = props.style["text-align"];
      delete props.style["text-align"];
    }

    // handle icons
    if (/^\[icon (\S*)__(\S*)\]$/.test(block.text)) {
      let match = block.text.match(/^\[icon (\S*)__(\S*)\]$/);

      element = (
        <Text {...props}>
          <Text className={`bx ${match[1]} ${match[2]}`}></Text>
        </Text>
      );
    }

    if (!element) {
      let styleNodes = {};

      for (let styling of block.inlineStyleRanges) {
        let idxs = [
          styling.offset,
          ...new Array(styling.length - 1)
            .fill(0)
            .map((i, idx) => idx + 1 + styling.offset),
        ];

        if (Object.keys(styleNodes).includes(styling.style)) {
          styleNodes[styling.style] = [...styleNodes[styling.style], ...idxs];
        } else {
          styleNodes[styling.style] = idxs;
        }
      }

      let parsed = block.text
        .split(
          /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|.)/,
        )
        .map((t, tidx) => {
          let css = {};
          let isBold = styleNodes["BOLD"]?.includes(tidx);
          let isItalic = styleNodes["ITALIC"]?.includes(tidx);
          let isStrike = styleNodes["STRIKETHROUGH"]?.includes(tidx);
          if (styleNodes["UNDERLINE"]?.includes(tidx)) {
            css["textDecoration"] = "underline";
          }

          if (props["blockquote"]) {
            css["color"] = "grey";

            if (t == "\n") return <View style={{ width: "100%", height: 8 }} />;
          }

          let _styles = [];

          if (isBold) {
            _styles.push(Style.text.bold);
          }
          if (isStrike) {
            _styles.push(Style.text.strike);
          }
          if (isItalic) {
            _styles.push(Style.text.italic);
          }
          _styles.push({ lineHeight: 20 });

          return (
            <Text style={_styles} key={block.key + "-" + tidx}>
              {t}
            </Text>
          );
        });

      let entitized = [];

      let entityBegin = 0;

      for (let entity of block.entityRanges) {
        if (entityBegin != entity.offset) {
          entitized.push(<>{parsed.slice(entityBegin, entity.offset)}</>);
        }
        entityBegin = entity.offset + entity.length;

        let type = entityMap[entity.key].type;

        if (type == "LINK") {
          entitized.push(
            <Link
              style={{ color: theme["color-primary-500"] }}
              href={entityMap[entity.key].data.url}
            >
              {parsed.slice(entity.offset, entity.offset + entity.length)}
            </Link>,
          );
          continue;
        }

        if (type == "IMAGE") {
          entitized.push(
            <View
              style={[
                Style.containers.row,
                {
                  justifyContent:
                    !entityMap[entity.key].data.alignment ||
                    entityMap[entity.key].data.alignment == "none"
                      ? "center"
                      : entityMap[entity.key].data.alignment,
                  marginHorizontal: 12,
                },
              ]}
            >
              <View
                style={[
                  Style.elevated,
                  { backgroundColor: theme["color-basic-300"] },
                ]}
              >
                <View>
                  <Image source={{ uri: entityMap[entity.key].data.src }} />
                </View>
              </View>
            </View>,
          );
          continue;
        }
        entitized.push(
          <>{parsed.slice(entity.offset, entity.offset + entity.length)}</>,
        );
      }

      entitized.push(<>{parsed.slice(entityBegin)}</>);

      element = (
        <Text {...props} css={{ overflowWrap: "anywhere" }}>
          {entitized}
        </Text>
      );
    }

    if (wrapper) {
      return wrapper({ child: element });
    }

    return element;
  };

  const blocks = React.useMemo(() => {
    return nodes?.blocks || [];
  }, [nodes]);

  const entityMap = React.useMemo(() => {
    return nodes?.entityMap || [];
  }, [nodes]);

  const elements = React.useMemo(() => {
    return blocks.map((block, bidx) => getElement(block, bidx));
  }, [blocks]);

  const getAppropriateContainer = (elem) => {
    if (elem.type == "ol" || elem.type == "ul") {
      return [elem];
    }

    return elem;
  };

  const containers = React.useMemo(() => {
    let content = [];

    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];

      if (content.length == 0) {
        content.push(getAppropriateContainer(element));
        continue;
      }

      let prevElement = content[content.length - 1];

      if (Array.isArray(prevElement) && prevElement[0].type == element.type) {
        prevElement.push(element);
        continue;
      }

      content.push(getAppropriateContainer(element));
    }

    return content.map((node, nidx) => {
      if (Array.isArray(node) && node[0].type == "ol") {
        return (
          <View key={"C-" + nidx}>
            <Text>• {node.map((n) => n.props.children)}</Text>
          </View>
        );
      }

      if (Array.isArray(node) && node[0].type == "ul") {
        return (
          <View key={"C-" + nidx}>
            <Text>{node.map((n) => n.props.children)}</Text>
          </View>
        );
      }

      return <View key={"C-" + nidx}>{node}</View>;
    });
  }, [elements]);

  return (
    <>
      {containers.map((container) => {
        return <>{container}</>;
      })}
    </>
  );
}

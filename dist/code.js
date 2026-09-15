"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // widget-src/code.tsx
  var { widget } = figma;
  var { AutoLayout, Text, Rectangle, useSyncedState, usePropertyMenu } = widget;
  var STATUS_CYCLE = ["parked", "revisiting", "resolved"];
  var STATUS_LABELS = {
    parked: "Parked",
    revisiting: "Revisiting",
    resolved: "Resolved"
  };
  var STATUS_BG = {
    parked: "#FFF3C4",
    revisiting: "#DBEAFE",
    resolved: "#D1FAE5"
  };
  var STATUS_FG = {
    parked: "#7A5500",
    revisiting: "#1D4ED8",
    resolved: "#065F46"
  };
  function formatDate(iso) {
    const d = new Date(iso);
    const now = /* @__PURE__ */ new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 864e5);
    if (diffDays === 0)
      return "Today";
    if (diffDays === 1)
      return "Yesterday";
    if (diffDays < 7)
      return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function openAddForm(items, setItems) {
    return new Promise((resolve) => {
      figma.showUI(__html__, {
        width: 380,
        height: 320,
        title: "Add to Parking Lot"
      });
      figma.ui.onmessage = (msg) => {
        if (msg.type === "add") {
          setItems([
            {
              id: Date.now().toString(),
              title: msg.title,
              description: msg.description || "",
              owner: msg.owner || "Unassigned",
              status: "parked",
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            ...items
          ]);
        }
        figma.closePlugin();
        resolve();
      };
    });
  }
  function ParkingLot() {
    const [items, setItems] = useSyncedState("items", []);
    const [filter, setFilter] = useSyncedState("filter", "all");
    const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);
    usePropertyMenu(
      [
        { itemType: "action", tooltip: "Add item", propertyName: "add" },
        { itemType: "separator" },
        {
          itemType: "dropdown",
          tooltip: "Filter by status",
          propertyName: "filter",
          selectedOption: filter,
          options: [
            { option: "all", label: "All" },
            { option: "parked", label: "Parked" },
            { option: "revisiting", label: "Revisiting" },
            { option: "resolved", label: "Resolved" }
          ]
        }
      ],
      ({ propertyName, propertyValue }) => {
        if (propertyName === "filter" && propertyValue) {
          setFilter(propertyValue);
          return;
        }
        if (propertyName === "add") {
          return openAddForm(items, setItems);
        }
      }
    );
    return /* @__PURE__ */ figma.widget.h(
      AutoLayout,
      {
        direction: "vertical",
        width: 400,
        fill: "#FFFFFF",
        cornerRadius: 12,
        stroke: "#E8E8E8",
        strokeWidth: 1,
        effect: [
          {
            type: "drop-shadow",
            color: { r: 0, g: 0, b: 0, a: 0.07 },
            offset: { x: 0, y: 4 },
            blur: 20,
            spread: 0
          }
        ]
      },
      /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "horizontal",
          width: "fill-parent",
          padding: { top: 14, bottom: 14, left: 16, right: 16 },
          spacing: "auto",
          verticalAlignItems: "center"
        },
        /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            direction: "horizontal",
            spacing: 8,
            verticalAlignItems: "center"
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 14, fontWeight: 700, fill: "#1E1E1E" }, "Parking Lot"),
          /* @__PURE__ */ figma.widget.h(
            AutoLayout,
            {
              padding: { top: 2, bottom: 2, left: 8, right: 8 },
              fill: "#EBEBEB",
              cornerRadius: 20
            },
            /* @__PURE__ */ figma.widget.h(Text, { fontSize: 10, fontWeight: 700, fill: "#666666" }, String(items.length))
          )
        ),
        /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            padding: { top: 6, bottom: 6, left: 12, right: 12 },
            fill: "#0D99FF",
            cornerRadius: 6,
            onClick: () => openAddForm(items, setItems)
          },
          /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fontWeight: 600, fill: "#FFFFFF" }, "+ Add item")
        )
      ),
      /* @__PURE__ */ figma.widget.h(Rectangle, { width: "fill-parent", height: 1, fill: "#F0F0F0" }),
      /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "horizontal",
          width: "fill-parent",
          padding: { top: 0, bottom: 0, left: 8, right: 8 },
          spacing: 0
        },
        ["all", "parked", "revisiting", "resolved"].map((f) => /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            key: f,
            padding: { top: 8, bottom: 8, left: 8, right: 8 },
            onClick: () => setFilter(f)
          },
          /* @__PURE__ */ figma.widget.h(
            Text,
            {
              fontSize: 11,
              fontWeight: filter === f ? 600 : 400,
              fill: filter === f ? "#1E1E1E" : "#999999"
            },
            f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)
          )
        ))
      ),
      /* @__PURE__ */ figma.widget.h(Rectangle, { width: "fill-parent", height: 1, fill: "#F0F0F0" }),
      filtered.length === 0 && /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "vertical",
          width: "fill-parent",
          padding: { top: 36, bottom: 36, left: 24, right: 24 },
          spacing: 6,
          horizontalAlignItems: "center"
        },
        /* @__PURE__ */ figma.widget.h(Text, { fontSize: 12, fontWeight: 600, fill: "#888888" }, "Nothing parked yet"),
        /* @__PURE__ */ figma.widget.h(
          Text,
          {
            fontSize: 11,
            fill: "#BBBBBB",
            textAlignHorizontal: "center",
            width: "fill-parent"
          },
          "Add items to track postponed ideas\nand questions from your retro."
        )
      ),
      filtered.length > 0 && /* @__PURE__ */ figma.widget.h(
        AutoLayout,
        {
          direction: "vertical",
          width: "fill-parent",
          padding: { top: 8, bottom: 12, left: 12, right: 12 },
          spacing: 6
        },
        filtered.map((item) => /* @__PURE__ */ figma.widget.h(
          AutoLayout,
          {
            key: item.id,
            direction: "vertical",
            width: "fill-parent",
            padding: 12,
            fill: "#FAFAFA",
            cornerRadius: 8,
            stroke: "#EBEBEB",
            strokeWidth: 1,
            spacing: 8
          },
          /* @__PURE__ */ figma.widget.h(
            AutoLayout,
            {
              direction: "horizontal",
              width: "fill-parent",
              spacing: "auto",
              verticalAlignItems: "start"
            },
            /* @__PURE__ */ figma.widget.h(
              Text,
              {
                fontSize: 12,
                fontWeight: 600,
                fill: "#1E1E1E",
                width: 300
              },
              item.title
            ),
            /* @__PURE__ */ figma.widget.h(
              AutoLayout,
              {
                padding: { top: 1, bottom: 1, left: 4, right: 0 },
                onClick: () => setItems(items.filter((i) => i.id !== item.id))
              },
              /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: "#CCCCCC" }, "\u2715")
            )
          ),
          item.description !== "" && /* @__PURE__ */ figma.widget.h(Text, { fontSize: 11, fill: "#777777", width: "fill-parent" }, item.description),
          /* @__PURE__ */ figma.widget.h(
            AutoLayout,
            {
              direction: "horizontal",
              width: "fill-parent",
              spacing: "auto",
              verticalAlignItems: "center"
            },
            /* @__PURE__ */ figma.widget.h(
              AutoLayout,
              {
                direction: "horizontal",
                spacing: 8,
                verticalAlignItems: "center"
              },
              /* @__PURE__ */ figma.widget.h(Text, { fontSize: 10, fontWeight: 500, fill: "#888888" }, item.owner),
              /* @__PURE__ */ figma.widget.h(Text, { fontSize: 10, fill: "#CCCCCC" }, formatDate(item.createdAt))
            ),
            /* @__PURE__ */ figma.widget.h(
              AutoLayout,
              {
                direction: "horizontal",
                spacing: 4,
                verticalAlignItems: "center",
                padding: { top: 3, bottom: 3, left: 8, right: 8 },
                fill: STATUS_BG[item.status],
                cornerRadius: 4,
                onClick: () => {
                  const idx = STATUS_CYCLE.indexOf(item.status);
                  const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
                  setItems(
                    items.map(
                      (i) => i.id === item.id ? __spreadProps(__spreadValues({}, i), { status: next }) : i
                    )
                  );
                }
              },
              /* @__PURE__ */ figma.widget.h(
                Rectangle,
                {
                  width: 5,
                  height: 5,
                  fill: STATUS_FG[item.status],
                  cornerRadius: 3
                }
              ),
              /* @__PURE__ */ figma.widget.h(
                Text,
                {
                  fontSize: 10,
                  fontWeight: 600,
                  fill: STATUS_FG[item.status]
                },
                STATUS_LABELS[item.status]
              )
            )
          )
        ))
      )
    );
  }
  widget.register(ParkingLot);
})();

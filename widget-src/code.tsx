const { widget } = figma;
const { AutoLayout, Text, Rectangle, SVG, useSyncedState, usePropertyMenu } = widget;

interface Item {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: "new" | "in-progress" | "parked" | "resolved" | "wont-address";
  createdAt: string;
}

type Status = "new" | "in-progress" | "parked" | "resolved" | "wont-address";

const STATUS_CYCLE: Status[] = ["new", "in-progress", "parked", "resolved", "wont-address"];
const STATUS_LABELS: Record<Status, string> = {
  "new": "New",
  "in-progress": "In Progress",
  "parked": "Parked",
  "resolved": "Resolved",
  "wont-address": "Won't Address",
};
const STATUS_BG: Record<Status, string> = {
  "new": "#F0F0F0",
  "in-progress": "#DBEAFE",
  "parked": "#FFF3C4",
  "resolved": "#D1FAE5",
  "wont-address": "#FFE4E6",
};
const STATUS_FG: Record<Status, string> = {
  "new": "#555555",
  "in-progress": "#1D4ED8",
  "parked": "#7A5500",
  "resolved": "#065F46",
  "wont-address": "#9F1239",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function openAddForm(
  items: Item[],
  setItems: (v: Item[]) => void
): Promise<void> {
  return new Promise((resolve) => {
    figma.showUI(__html__, {
      width: 380,
      height: 320,
      title: "Add to Parking Lot",
    });
    figma.ui.postMessage({ type: "add-form" });
    figma.ui.onmessage = (msg) => {
      if (msg.type === "add") {
        setItems([
          {
            id: Date.now().toString(),
            title: msg.title,
            description: msg.description || "",
            owner: msg.owner || "Unassigned",
            status: "new",
            createdAt: new Date().toISOString(),
          },
          ...items,
        ]);
      }
      figma.closePlugin();
      resolve();
    };
  });
}

function ParkingLot() {
  const [items, setItems] = useSyncedState<Item[]>("items", []);
  const [filter, setFilter] = useSyncedState<string>("filter", "all");

  const filtered =
    filter === "all" ? items : items.filter((i) => i.status === filter);

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
          { option: "new", label: "New" },
          { option: "in-progress", label: "In Progress" },
          { option: "parked", label: "Parked" },
          { option: "resolved", label: "Resolved" },
          { option: "wont-address", label: "Won't Address" },
        ],
      },
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

  return (
    <AutoLayout
      direction="vertical"
      width={400}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E8E8E8"
      strokeWidth={1}
      effect={[
        {
          type: "drop-shadow",
          color: { r: 0, g: 0, b: 0, a: 0.07 },
          offset: { x: 0, y: 4 },
          blur: 20,
          spread: 0,
        },
      ]}
    >
      {/* Header */}
      <AutoLayout
        direction="horizontal"
        width="fill-parent"
        padding={{ top: 14, bottom: 14, left: 16, right: 16 }}
        spacing="auto"
        verticalAlignItems="center"
      >
        <AutoLayout
          direction="horizontal"
          spacing={8}
          verticalAlignItems="center"
        >
          <Text fontSize={14} fontWeight={700} fill="#1E1E1E">
            Parking Lot
          </Text>
          <AutoLayout
            padding={{ top: 2, bottom: 2, left: 8, right: 8 }}
            fill="#EBEBEB"
            cornerRadius={20}
          >
            <Text fontSize={10} fontWeight={700} fill="#666666">
              {String(items.length)}
            </Text>
          </AutoLayout>
        </AutoLayout>

        <AutoLayout
          padding={{ top: 6, bottom: 6, left: 12, right: 12 }}
          fill="#0D99FF"
          cornerRadius={6}
          onClick={() => openAddForm(items, setItems)}
        >
          <Text fontSize={11} fontWeight={600} fill="#FFFFFF">
            + Add item
          </Text>
        </AutoLayout>
      </AutoLayout>

      {/* Divider */}
      <Rectangle width="fill-parent" height={1} fill="#F0F0F0" />

      {/* Filter tabs */}
      <AutoLayout
        direction="horizontal"
        width="fill-parent"
        padding={{ top: 0, bottom: 0, left: 8, right: 8 }}
        spacing={0}
      >
        {(["all", "new", "in-progress", "parked", "resolved", "wont-address"] as const).map((f) => (
          <AutoLayout
            key={f}
            padding={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onClick={() => setFilter(f)}
          >
            <Text
              fontSize={11}
              fontWeight={filter === f ? 600 : 400}
              fill={filter === f ? "#1E1E1E" : "#999999"}
            >
              {f === "all" ? "All" : STATUS_LABELS[f as Status] ?? f}
            </Text>
          </AutoLayout>
        ))}
      </AutoLayout>

      <Rectangle width="fill-parent" height={1} fill="#F0F0F0" />

      {/* Empty state */}
      {filtered.length === 0 && (
        <AutoLayout
          direction="vertical"
          width="fill-parent"
          padding={{ top: 36, bottom: 36, left: 24, right: 24 }}
          spacing={6}
          horizontalAlignItems="center"
        >
          <Text fontSize={12} fontWeight={600} fill="#888888">
            Nothing parked yet
          </Text>
          <Text
            fontSize={11}
            fill="#BBBBBB"
            textAlignHorizontal="center"
            width="fill-parent"
          >
            {"Add items to track postponed ideas\nand questions from your retro."}
          </Text>
        </AutoLayout>
      )}

      {/* Items */}
      {filtered.length > 0 && (
        <AutoLayout
          direction="vertical"
          width="fill-parent"
          padding={{ top: 8, bottom: 12, left: 12, right: 12 }}
          spacing={6}
        >
          {filtered.map((item) => (
            <AutoLayout
              key={item.id}
              direction="vertical"
              width="fill-parent"
              padding={12}
              fill="#FAFAFA"
              cornerRadius={8}
              stroke="#EBEBEB"
              strokeWidth={1}
              spacing={8}
            >
              {/* Title row */}
              <AutoLayout
                direction="horizontal"
                width="fill-parent"
                spacing="auto"
                verticalAlignItems="start"
              >
                <Text
                  fontSize={12}
                  fontWeight={600}
                  fill="#1E1E1E"
                  width={300}
                >
                  {item.title}
                </Text>
                {/* Delete button */}
                <AutoLayout
                  padding={{ top: 1, bottom: 1, left: 4, right: 0 }}
                  onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                >
                  <Text fontSize={11} fill="#CCCCCC">
                    ✕
                  </Text>
                </AutoLayout>
              </AutoLayout>

              {/* Description */}
              {item.description !== "" && (
                <Text fontSize={11} fill="#777777" width="fill-parent">
                  {item.description}
                </Text>
              )}

              {/* Footer: owner + date + status */}
              <AutoLayout
                direction="horizontal"
                width="fill-parent"
                spacing="auto"
                verticalAlignItems="center"
              >
                <AutoLayout
                  direction="horizontal"
                  spacing={8}
                  verticalAlignItems="center"
                >
                  <Text fontSize={10} fontWeight={500} fill="#888888">
                    {item.owner}
                  </Text>
                  <Text fontSize={10} fill="#CCCCCC">
                    {formatDate(item.createdAt)}
                  </Text>
                </AutoLayout>

                {/* Status badge — click to open picker */}
                <AutoLayout
                  direction="horizontal"
                  spacing={4}
                  verticalAlignItems="center"
                  padding={{ top: 3, bottom: 3, left: 8, right: 8 }}
                  fill={STATUS_BG[item.status]}
                  cornerRadius={4}
                  onClick={() =>
                    new Promise<void>((resolve) => {
                      figma.showUI(__html__, {
                        width: 200,
                        height: 210,
                        title: "Set status",
                      });
                      figma.ui.postMessage({
                        type: "status-picker",
                        currentStatus: item.status,
                        itemId: item.id,
                      });
                      figma.ui.onmessage = (msg) => {
                        if (msg.type === "set-status") {
                          setItems(
                            items.map((i) =>
                              i.id === item.id
                                ? { ...i, status: msg.status }
                                : i
                            )
                          );
                        }
                        figma.closePlugin();
                        resolve();
                      };
                    })
                  }
                >
                  <Rectangle
                    width={5}
                    height={5}
                    fill={STATUS_FG[item.status]}
                    cornerRadius={3}
                  />
                  <Text
                    fontSize={10}
                    fontWeight={600}
                    fill={STATUS_FG[item.status]}
                  >
                    {STATUS_LABELS[item.status]}
                  </Text>
                  <AutoLayout padding={{ top: 1, bottom: 0, left: 0, right: 0 }}>
                    <SVG
                      width={7}
                      height={4}
                      src={`<svg width="7" height="4" viewBox="0 0 13 8" xmlns="http://www.w3.org/2000/svg"><path d="M 1.5 0.5 L 11.5 0.5 Q 13 0.5 12.2 1.8 L 7.3 7.2 Q 6.5 8.2 5.7 7.2 L 0.8 1.8 Q 0 0.5 1.5 0.5 Z" fill="${STATUS_FG[item.status]}"/></svg>`}
                    />
                  </AutoLayout>
                </AutoLayout>
              </AutoLayout>
            </AutoLayout>
          ))}
        </AutoLayout>
      )}
    </AutoLayout>
  );
}

widget.register(ParkingLot);

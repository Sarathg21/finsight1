
import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Expand,
  Search,
} from "lucide-react";

/* ================= CHILD IDS ================= */

function getChildIds(node) {
  let ids = [];

  if (node.children?.length) {
    node.children.forEach((child) => {
      ids.push(child.id);
      ids.push(...getChildIds(child));
    });
  }

  return ids;
}

/* ================= TREE NODE ================= */

function Node({
  node,
  depth,
  selected,
  setSelected,
  expanded,
  setExpanded,
}) {
  const hasChildren = node.children?.length > 0;

  const childIds = getChildIds(node);

  const isSelected = selected.includes(node.id);

  const selectedChildren = childIds.filter((id) =>
    selected.includes(id)
  );

  const isPartial =
    selectedChildren.length > 0 &&
    selectedChildren.length < childIds.length;

  /* -------- SELECT NODE -------- */

  const toggleSelect = () => {
    const ids = [node.id, ...childIds];

    const alreadySelected = ids.every((id) =>
      selected.includes(id)
    );

    if (alreadySelected) {
      setSelected((prev) =>
        prev.filter((id) => !ids.includes(id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...ids]),
      ]);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div
        className="
          flex
          items-center
          rounded-md
          hover:bg-slate-50
        "
        style={{
          minHeight: "32px",
          width: "100%",
          paddingLeft: `${depth * 18 + 8}px`,
          paddingRight: "8px",
          paddingTop: "5px",
          paddingBottom: "5px",
          gap: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* EXPAND / COLLAPSE */}

        {hasChildren ? (
          <button
            onClick={() =>
              setExpanded((prev) => ({
                ...prev,
                [node.id]: !prev[node.id],
              }))
            }
            className="
              shrink-0
              flex
              items-center
              justify-center
              text-gray-400
              hover:text-gray-600
            "
            style={{
              width: "16px",
              height: "16px",
              padding: 0,
              margin: 0,
              flexShrink: 0,
            }}
          >
            {expanded[node.id] ? (
              <ChevronDown
                style={{
                  width: "15px",
                  height: "15px",
                }}
              />
            ) : (
              <ChevronRight
                style={{
                  width: "15px",
                  height: "15px",
                }}
              />
            )}
          </button>
        ) : (
          <span
            style={{
              width: "16px",
              height: "16px",
              display: "block",
              flexShrink: 0,
            }}
          />
        )}

        {/* CHECKBOX */}

        <button
          onClick={toggleSelect}
          className={`
            shrink-0
            rounded
            border
            flex
            items-center
            justify-center
            transition
            ${
              isSelected
                ? "bg-blue-600 border-blue-600"
                : isPartial
                ? "bg-slate-300 border-slate-300"
                : "bg-white border-slate-300"
            }
          `}
          style={{
            width: "16px",
            height: "16px",
            minWidth: "16px",
            minHeight: "16px",
            padding: 0,
            margin: 0,
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          {isSelected && (
            <span
              className="
                text-white
                font-bold
              "
              style={{
                fontSize: "11px",
                lineHeight: "14px",
                display: "block",
              }}
            >
              ✓
            </span>
          )}

          {isPartial && !isSelected && (
            <span
              className="
                rounded-sm
                bg-white
              "
              style={{
                width: "8px",
                height: "2px",
                display: "block",
              }}
            />
          )}
        </button>

        {/* LABEL */}

        <span
          className="
            text-gray-700
            truncate
          "
          style={{
            minWidth: 0,
            flex: "1 1 auto",
            fontSize: "13px",
            lineHeight: "18px",
            fontWeight: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={node.label}
        >
          {node.label}
        </span>
      </div>

      {/* CHILDREN */}

      {expanded[node.id] &&
        hasChildren &&
        node.children.map((child) => (
          <Node
            key={child.id}
            node={child}
            depth={depth + 1}
            selected={selected}
            setSelected={setSelected}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        ))}
    </div>
  );
}

export default function HierarchyTree({
  tree,
  selected,
  setSelected,
}) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  /* ================= EXPAND ALL ================= */

  const toggleExpandAll = () => {
    const allExpandableIds = [];

    const loop = (nodes) => {
      nodes.forEach((node) => {
        if (node.children?.length) {
          allExpandableIds.push(node.id);
          loop(node.children);
        }
      });
    };

    loop(tree);

    const allExpanded =
      allExpandableIds.length > 0 &&
      allExpandableIds.every((id) => expanded[id]);

    if (allExpanded) {
      setExpanded({});
    } else {
      const result = {};

      allExpandableIds.forEach((id) => {
        result[id] = true;
      });

      setExpanded(result);
    }
  };

  /* ================= SEARCH ================= */

  const filteredTree = useMemo(() => {
    if (!search.trim()) {
      return tree;
    }

    const searchText = search.toLowerCase().trim();

    const filter = (nodes) => {
      return nodes
        .map((node) => {
          const children = node.children
            ? filter(node.children)
            : [];

          const matched = node.label
            .toLowerCase()
            .includes(searchText);

          if (matched || children.length) {
            return {
              ...node,
              children,
            };
          }

          return null;
        })
        .filter(Boolean);
    };

    return filter(tree);
  }, [tree, search]);

  /* ================= AUTO EXPAND SEARCH RESULTS ================= */

  useEffect(() => {
    if (!search.trim()) {
      return;
    }

    const searchText = search.toLowerCase().trim();
    const idsToExpand = {};

    const hasMatchInChildren = (node) => {
      return (node.children || []).some((child) => {
        const matched = child.label
          ?.toLowerCase()
          .includes(searchText);

        return (
          matched || hasMatchInChildren(child)
        );
      });
    };

    const findMatches = (nodes) => {
      nodes.forEach((node) => {
        const children = node.children || [];

        const childHasMatch = children.some(
          (child) => {
            const childLabel = child.label
              ?.toLowerCase()
              .includes(searchText);

            return (
              childLabel ||
              hasMatchInChildren(child)
            );
          }
        );

        if (childHasMatch) {
          idsToExpand[node.id] = true;
        }

        findMatches(children);
      });
    };

    findMatches(tree);

    setExpanded((prev) => ({
      ...prev,
      ...idsToExpand,
    }));
  }, [search, tree]);

  /* ================= ACCESS SUMMARY ================= */

  const accessSummary = useMemo(() => {
    let full = 0;
    let partial = 0;
    let none = 0;

    const count = (nodes) => {
      nodes.forEach((node) => {
        const children = getChildIds(node);

        if (selected.includes(node.id)) {
          full++;
        } else if (
          children.some((id) =>
            selected.includes(id)
          )
        ) {
          partial++;
        } else {
          none++;
        }

        if (node.children?.length) {
          count(node.children);
        }
      });
    };

    count(tree);

    return {
      full,
      partial,
      none,
    };
  }, [selected]);

  /* ================= EXPAND STATE ================= */

  const allExpandableIds = [];

  const collectExpandableIds = (nodes) => {
    nodes.forEach((node) => {
      if (node.children?.length) {
        allExpandableIds.push(node.id);
        collectExpandableIds(node.children);
      }
    });
  };

  collectExpandableIds(tree);

  const allExpanded =
    allExpandableIds.length > 0 &&
    allExpandableIds.every(
      (id) => expanded[id]
    );

  return (
    <div
      className="
        w-full
        h-full
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
        flex
        flex-col
        overflow-hidden
      "
      style={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        boxSizing: "border-box",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          shrink-0
        "
        style={{
          height: "48px",
          minHeight: "48px",
          padding: "0 12px",
          borderColor: "#e2e8f0",
          boxSizing: "border-box",
          gap: "12px",
        }}
      >
        <h3
          className="
            font-semibold
            text-slate-800
          "
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Organization Hierarchy
        </h3>

        <button
          onClick={toggleExpandAll}
          className="
            flex
            items-center
            justify-center
            gap-1
            rounded-md
            border
            hover:bg-slate-50
            shrink-0
          "
          style={{
            height: "28px",
            minHeight: "28px",
            padding: "0 9px",
            fontSize: "11px",
            lineHeight: "14px",
            borderColor: "#cbd5e1",
            color: "#475569",
            whiteSpace: "nowrap",
            boxSizing: "border-box",
          }}
        >
          <Expand
            style={{
              width: "14px",
              height: "14px",
              flexShrink: 0,
            }}
          />

          <span>
            {allExpanded ? "Collapse" : "Expand"}
          </span>
        </button>
      </div>

      {/* ================= SEARCH ================= */}

      <div
        className="
          flex
          items-center
          shrink-0
          rounded-md
          border
        "
        style={{
          height: "36px",
          minHeight: "36px",
          margin: "10px 12px 8px 12px",
          padding: "0 9px",
          gap: "8px",
          borderColor: "#cbd5e1",
          boxSizing: "border-box",
        }}
      >
        <Search
          style={{
            width: "15px",
            height: "15px",
            color: "#94a3b8",
            flexShrink: 0,
          }}
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search hierarchy..."
          className="
            w-full
            outline-none
            text-slate-700
          "
          style={{
            width: "100%",
            minWidth: 0,
            height: "34px",
            padding: 0,
            margin: 0,
            border: "none",
            outline: "none",
            fontSize: "12px",
            lineHeight: "16px",
            background: "transparent",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* ================= TREE CONTENT ================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
        "
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          minWidth: 0,
          padding: "4px 6px 8px 6px",
          boxSizing: "border-box",
        }}
      >
        {filteredTree.map((node) => (
          <Node
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            setSelected={setSelected}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        ))}
      </div>

      {/* ================= FOOTER LEGEND ================= */}

      <div
        className="
          flex
          items-center
          border-t
          shrink-0
        "
        style={{
          height: "38px",
          minHeight: "38px",
          padding: "0 12px",
          gap: "16px",
          borderColor: "#e2e8f0",
          fontSize: "11px",
          lineHeight: "14px",
          color: "#475569",
          boxSizing: "border-box",
        }}
      >
        {/* FULL */}

        <div
          className="
            flex
            items-center
          "
          style={{
            gap: "5px",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="
              rounded
              bg-blue-600
            "
            style={{
              width: "12px",
              height: "12px",
              display: "block",
              flexShrink: 0,
            }}
          />

          <span>Full</span>
        </div>

        {/* PARTIAL */}

        <div
          className="
            flex
            items-center
          "
          style={{
            gap: "5px",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="
              rounded
              bg-slate-300
            "
            style={{
              width: "12px",
              height: "12px",
              display: "block",
              flexShrink: 0,
            }}
          />

          <span>Partial</span>
        </div>

        {/* NONE */}

        <div
          className="
            flex
            items-center
          "
          style={{
            gap: "5px",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="
              rounded
              border
            "
            style={{
              width: "12px",
              height: "12px",
              display: "block",
              flexShrink: 0,
              borderColor: "#cbd5e1",
              backgroundColor: "#ffffff",
              boxSizing: "border-box",
            }}
          />

          <span>None</span>
        </div>
      </div>
    </div>
  );
}


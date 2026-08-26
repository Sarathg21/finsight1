import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronRight, Expand, Search } from "lucide-react";

/* ================= CHILD IDS ================= */
function getChildIds(node) {
    let ids = [];
    if (node.children?.length) {
        node.children.forEach(child => {
            ids.push(child.id);
            ids.push(
                ...getChildIds(child)
            );
        });
    }
    return ids;
}

/* ================= TREE NODE ================= */

function Node({ node, depth, selected, setSelected, expanded, setExpanded }) {
    const hasChildren =
        node.children?.length > 0;

    const childIds =
        getChildIds(node);

    const isSelected =
        selected.includes(node.id);

    const selectedChildren =
        childIds.filter(id =>
            selected.includes(id)
        );

    const isPartial =
        selectedChildren.length > 0 &&
        selectedChildren.length <
        childIds.length;


    /* -------- SELECT NODE -------- */
    const toggleSelect = () => {
        const ids = [
            node.id,
            ...childIds
        ];

        const alreadySelected =
            ids.every(id =>
                selected.includes(id)
            );

        if (alreadySelected) {
            setSelected(prev =>
                prev.filter(id =>
                    !ids.includes(id)
                )
            );
        }

        else {
            setSelected(prev =>
                [
                    ...new Set([
                        ...prev,
                        ...ids
                    ])
                ]
            );
        }
    };


    return (
        <div>
            <div
                className="
              flex
              items-center
              gap-2
              rounded-md
              px-2
              py-1.5
              hover:bg-slate-50
              min-w-0"
                style={{
                    paddingLeft:
                        `${depth * 18 + 8}px`
                }} >

                {
                    hasChildren ? (
                        <button
                            onClick={() =>
                                setExpanded(prev => ({
                                    ...prev,
                                    [node.id]:
                                        !prev[node.id]
                                }))
                            }
                            className="
                                shrink-0
                                text-gray-400
                            ">
                            {
                                expanded[node.id] ?
                                    <ChevronDown
                                        className=" h-4 w-4" /> :
                                    <ChevronRight
                                        className=" h-4 w-4 " />}
                        </button>) :
                        <span className="w-4 shrink-0" />
                }

                {/* CHECKBOX */}

                <button
                    onClick={toggleSelect}
                    className={`
                      h-4
                      w-4
                      shrink-0
                      rounded
                      border
                      flex
                      items-center
                      justify-center
                      transition

                      ${isSelected
                            ? "bg-blue-600 border-blue-600"
                            : isPartial
                                ? "bg-slate-300 border-slate-300"
                                : "bg-white border-slate-300"
                        }`}>
                    {
                        isSelected && (
                            <span
                                className="
                                text-white
                                text-[11px]
                                font-bold
                                leading-none
                                "
                            > ✓
                            </span>
                        )}
                    {
                        isPartial && !isSelected && (
                            <span
                                className="
                                  h-2
                                  w-2
                                  rounded-sm
                                  bg-white
                                  "/>
                        )}
                </button>

                <span
                    className="
                        text-sm
                        text-gray-700
                        truncate
                    " >
                    {node.label}
                </span>
            </div>

            {
                expanded[node.id] &&
                hasChildren &&
                node.children.map(child => (
                    <Node
                        key={child.id}
                        node={child}
                        depth={depth + 1}
                        selected={selected}
                        setSelected={setSelected}
                        expanded={expanded}
                        setExpanded={setExpanded}
                    />
                ))
            }
        </div>
    );
}
export default function HierarchyTree({ tree, selected, setSelected }) {

    // const [selected, setSelected] = useState([]);
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
            // Collapse all
            setExpanded({});
        } else {
            // Expand all
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
                .map(node => {
                    const children = node.children
                        ? filter(node.children)
                        : [];

                    const matched = node.label
                        .toLowerCase()
                        .includes(searchText);

                    if (matched || children.length) {
                        return {
                            ...node,
                            children
                        };
                    }

                    return null;
                })
                .filter(Boolean);
        };

        return filter(tree);
    }, [tree, search]);


    useEffect(() => {
        if (!search.trim()) {
            return;
        }

        const searchText = search.toLowerCase().trim();
        const idsToExpand = {};

        const findMatches = (nodes) => {
            nodes.forEach(node => {
                const children = node.children || [];

                const childHasMatch = children.some(child => {
                    const childLabel = child.label
                        ?.toLowerCase()
                        .includes(searchText);

                    return childLabel || hasMatchInChildren(child);
                });

                if (childHasMatch) {
                    idsToExpand[node.id] = true;
                }

                findMatches(children);
            });
        };

        const hasMatchInChildren = (node) => {
            return (node.children || []).some(child => {
                const matched = child.label
                    ?.toLowerCase()
                    .includes(searchText);

                return matched || hasMatchInChildren(child);
            });
        };

        findMatches(tree);

        setExpanded(prev => ({
            ...prev,
            ...idsToExpand
        }));
    }, [search, tree]);

    /* ================= ACCESS SUMMARY ================= */
    const accessSummary = useMemo(() => {
        let full = 0;
        let partial = 0;
        let none = 0;

        const count = (nodes) => {
            nodes.forEach(node => {
                const children =
                    getChildIds(node);

                if (selected.includes(node.id)) {
                    full++;
                }

                else if (
                    children.some(id =>
                        selected.includes(id)
                    )
                ) {
                    partial++;
                }
                else {
                    none++;
                }

                if (node.children?.length) {
                    count(node.children);
                }

            });
        };
        count(tree);

        return { full, partial, none };
    }, [selected]);


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
        allExpandableIds.every((id) => expanded[id]);
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
        >

            {/* HEADER */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    px-3
                    py-3
                    shrink-0
                "
            >
                <h3
                    className="
                        text-sm
                        font-semibold
                        text-slate-800
                    "
                >
                    Organization Hierarchy
                </h3>

                <button
                    onClick={toggleExpandAll}
                    className="
                   flex
                   items-center
                   gap-1
                   rounded-md
                   border
                   px-2
                   py-1
                   text-xs
                   hover:bg-slate-50
                   "
                >
                    <Expand className="h-3.5 w-3.5" />

                    {allExpanded ? "Collapse" : "Expand"}
                </button>
            </div>


            {/* SEARCH */}

            <div
                className="
                    mx-3
                    my-2
                    flex
                    items-center
                    gap-2
                    rounded-md
                    border
                    px-2
                    shrink-0
                "
            >

                <Search
                    className="
                        h-4
                        w-4
                        text-gray-400
                    "
                />

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search hierarchy..."
                    className="
                        w-full
                        py-2
                        text-sm
                        outline-none
                    "
                />
            </div>

            {/* TREE CONTENT */}

            <div className="
            flex-1
              min-h-0
              overflow-y-auto
              overflow-x-hidden
              p-2
              "
            >
                {
                    filteredTree.map(node => (
                        <Node
                            key={node.id}
                            node={node}
                            depth={0}
                            selected={selected}
                            setSelected={setSelected}
                            expanded={expanded}
                            setExpanded={setExpanded}
                        />
                    ))
                }
            </div>

            {/* FOOTER LEGEND */}
            <div
                className="
                    flex
                    gap-4
                    border-t
                    px-3
                    py-2
                    text-xs
                    text-gray-600
                    shrink-0
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
                    <span
                        className="
                            h-3
                            w-3
                            rounded
                            bg-blue-600
                        "
                    />
                    Full
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
                    <span
                        className="
                            h-3
                            w-3
                            rounded
                            bg-slate-300
                        "
                    />
                    Partial
                </div>


                <div
                    className="
                        flex
                        items-center
                        gap-1
                    "
                >
                    <span
                        className="
                            h-3
                            w-3
                            rounded
                            border
                        "
                    />
                    None
                </div>
            </div>
        </div>
    );
}

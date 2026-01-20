"use strict";
const SVG_NS = "http://www.w3.org/2000/svg";

import { Box, SpacingRectangle } from "./geometry.js";

/**
 * @param {number} x0 - x coordinate of the start point
 * @param {number} y0 - y coordinate of the center of the start point
 * @param {number} x1 - x coordinate of the end point
 * @param {number} y1 - y coordinate of the center of the end point
 * @param {number} nDashes - number of dashes (must be >= 0)
 * @param {string | undefined} strokeColor - CSS color string
 * @returns {SVGElement} SVG element
 */
export function makeLine(x0, y0, x1, y1, nDashes = 0, strokeColor = undefined, strokeWidth = undefined) {
    console.assert(nDashes >= 0, "nDashes must be non-negative");
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", x0.toFixed(4));
    line.setAttribute("y1", y0.toFixed(4));
    line.setAttribute("x2", x1.toFixed(4));
    line.setAttribute("y2", y1.toFixed(4));
    if (nDashes > 1) {
        const len = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        const dashLen = len / nDashes;
        line.setAttribute("stroke-dasharray", dashLen.toFixed(10));
        line.setAttribute("stroke-dashoffset", dashLen.toFixed(10));
    }
    if (strokeColor !== undefined)
        line.setAttribute("stroke", strokeColor);
    if (strokeWidth !== undefined)
        line.setAttribute("stroke-width", strokeWidth.toFixed(4));

    return line;
}

/**
 * Creates an SVG rectangle element representing the given box, margins ignored.
 * @param {Box} box
 * @param {number} x - x coordinate of the upper-left outer corner
 * @param {number} y - y coordinate of the upper-left outer corner
 * @param {string | undefined} strokeColor
 * @param {string | undefined} fillColor
 * @param {[boolean, boolean, boolean, boolean] | undefined} sides - [top, right, bottom, left]
 * @returns {SVGGElement | SVGRectElement}
 */
export function makeBox(
    box,
    x = 0,
    y = 0,
    strokeColor = undefined,
    fillColor = undefined,
    sides = [true, true, true, true]
) {
    if (box.svgHeight <= 0 || box.svgWidth <= 0)
        return document.createElementNS(SVG_NS, "g");

    if (sides.every(x => x)) {
        const rect = document.createElementNS(SVG_NS, "rect");
        const svgX = x + box.strokeWidth / 2;
        const svgY = y + box.strokeWidth / 2;
        rect.setAttribute("x", svgX.toFixed(4));
        rect.setAttribute("y", svgY.toFixed(4));
        rect.setAttribute("width", box.svgWidth.toFixed(4));
        rect.setAttribute("height", box.svgHeight.toFixed(4));

        if (fillColor !== undefined)
            rect.setAttribute("fill", fillColor);
        if (strokeColor !== undefined)
            rect.setAttribute("stroke", strokeColor);
        rect.setAttribute("stroke-width", box.strokeWidth.toFixed(4));
        return rect;
    } else {
        const [hasTop, hasRight, hasBottom, hasLeft] = sides;
        const group = document.createElementNS(SVG_NS, "g");
        if (strokeColor !== undefined)
            group.setAttribute("stroke", strokeColor);
        group.setAttribute("stroke-width", box.strokeWidth.toFixed(4));

        if (hasLeft)
            group.appendChild(makeLine(
                x + box.strokeWidth / 2, y,
                x + box.strokeWidth / 2, y + box.outerHeight,
                0
            ));
        if (hasRight)
            group.appendChild(makeLine(
                x + box.outerWidth - box.strokeWidth / 2, y,
                x + box.outerWidth - box.strokeWidth / 2, y + box.outerHeight,
                0
            ));

        if (hasTop)
            group.appendChild(makeLine(
                x, y + box.strokeWidth / 2,
                x + box.outerWidth, y + box.strokeWidth / 2,
                0
            ));
        if (hasBottom)
            group.appendChild(makeLine(
                x, y + box.outerHeight - box.strokeWidth / 2,
                x + box.outerWidth, y + box.outerHeight - box.strokeWidth / 2,
                0,
            ));

        if (fillColor !== undefined && fillColor !== "none") {
            const rect = document.createElementNS(SVG_NS, "rect");
            const [x0, y0] = box.innerOrigin;
            rect.setAttribute("x", (x + x0).toFixed(4));
            rect.setAttribute("y", (y + y0).toFixed(4));
            rect.setAttribute("width", box.innerWidth.toFixed(4));
            rect.setAttribute("height", box.innerHeight.toFixed(4));
            rect.setAttribute("fill", fillColor);
            rect.setAttribute("stroke", "none");
            group.appendChild(rect);
        }
        return group;
    }
}

/**
 * Creates an SVG group element representing the hanzi box fitting the given box.
 * @param {Box} box - the box to fit the hanzi box into, margins ignored
 * @param {number} nDashesStraight - number of dashes for straight lines
 * @param {number} nDashesDiag - number of dashes for diagonal lines
 * @param {string} mainStrokeColor
 * @param {string} innerColor
 * @param {boolean} addCross
 * @param {boolean} addDiagonal
 * @param {boolean} addThirds
 * @param {boolean} addBox
 * @returns {SVGGElement}
 */
export function makeHanziBox(
    box,
    isEnclosed,
    nDashesStraight,
    nDashesDiag,
    mainStrokeColor,
    innerColor,
    addCross,
    addDiagonal,
    addThirds,
    addBox,
    addBottomLine
) {
    const [x0, y0] = box.innerOrigin;
    const [x1, y1] = box.innerEnd;
    const innerWidth = box.innerWidth;
    const innerHeight = box.innerHeight;
    const strokeWidth = box.strokeWidth;

    const boxElement = document.createElementNS(SVG_NS, "g");
    boxElement.setAttribute("stroke", mainStrokeColor);
    boxElement.setAttribute("stroke-width", strokeWidth.toFixed(4));
    if (addCross) {
        boxElement.appendChild(makeLine(
            x0, y0 + innerHeight / 2, x1, y0 + innerHeight / 2,
            nDashesStraight, innerColor
        ));
        boxElement.appendChild(makeLine(
            x0 + innerWidth / 2, y0, x0 + innerWidth / 2, y1,
            nDashesStraight, innerColor
        ));
    }
    if (addThirds) {
        boxElement.appendChild(makeLine(
            x0, y0 + innerHeight / 3, x1, y0 + innerHeight / 3,
            nDashesStraight, innerColor
        ));
        boxElement.appendChild(makeLine(
            x0, y0 + 2 * innerHeight / 3, x1, y0 + 2 * innerHeight / 3,
            nDashesStraight, innerColor
        ));
        boxElement.appendChild(makeLine(
            x0 + innerWidth / 3, y0, x0 + innerWidth / 3, y1,
            nDashesStraight, innerColor
        ));
        boxElement.appendChild(makeLine(
            x0 + 2 * innerWidth / 3, y0, x0 + 2 * innerWidth / 3, y1,
            nDashesStraight, innerColor
        ));
    }
    if (addDiagonal) {
        boxElement.appendChild(makeLine(x0, y0, x1, y1, nDashesDiag, innerColor));
        boxElement.appendChild(makeLine(x0, y1, x1, y0, nDashesDiag, innerColor));
    }
    if (addBox) {
        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("x", (x0 + innerWidth / 4).toFixed(4));
        rect.setAttribute("y", (y0 + innerWidth / 4).toFixed(4));
        const len = innerWidth / 4 * 2;
        rect.setAttribute("width", len.toFixed(4));
        rect.setAttribute("height", len.toFixed(4));
        rect.setAttribute("fill", "none");
        rect.setAttribute("stroke", innerColor);
        // TODO fix dash calculation
        const dashLen = len / (nDashesStraight / 2);
        rect.setAttribute("stroke-dasharray", dashLen.toFixed(10));
        rect.setAttribute("stroke-dashoffset", dashLen.toFixed(10));
        boxElement.appendChild(rect);
    }

    console.log(addBottomLine)
    if (!isEnclosed && addBottomLine) {
        boxElement.appendChild(makeLine(
            x0,
            box.outerHeight - box.strokeWidth / 2,
            x1,
            box.outerHeight - box.strokeWidth / 2,
            nDashesStraight, innerColor, box.strokeWidth
        ))
    }

    boxElement.appendChild(makeBox(
        box, 0, 0, undefined, "none", !isEnclosed ? [false, true, false, true] : undefined
    ));
    return boxElement;
}

/**
 * 
 * @param {number} availableHeight 
 * @param {Box} box 
 * @param {function(number, number, boolean): SVGGElement} boxMaker 
 * @returns {[SVGGElement, number]} The group element and the total height of the column
 */
export function makeColumn(availableHeight, box, boxMaker) {
    const g = document.createElementNS(SVG_NS, "g");
    const isEnclosed = box.margin.mergedVertical > 0;

    // If enclosed, add outer vertical outlines
    const outerVerticalOutline = isEnclosed ? box.strokeWidth : 0;
    // If not enclosed, merge inner vertical outlines
    const innerStrokeContribution = !isEnclosed ? box.strokeWidth : 0;


    const columnHeightFixed = (
        outerVerticalOutline
        + box.margin.top
        - (box.margin.mergedVertical - innerStrokeContribution)
        + box.margin.bottom
        + outerVerticalOutline
    )
    const columnHeightVariable = (
        box.outerHeight + (box.margin.mergedVertical - innerStrokeContribution)
    )

    const nRows = Math.floor((availableHeight - columnHeightFixed) / columnHeightVariable);
    // Place boxes
    let [x, y] = [0, 0];
    y += box.margin.top + outerVerticalOutline;

    for (let i = 0; i < nRows; i++) {
        g.appendChild(boxMaker(x, y, i === nRows - 1));
        y += box.outerHeight + box.margin.mergedVertical - innerStrokeContribution;
    }
    return [g, columnHeightFixed + columnHeightVariable * nRows];
}

/**
 * @param {Box} titleBox - Box geometry for the title column
 * @param {string} strokeColor - CSS color string
 * @param {number} titleHeight - Height between top and bottom brace
 * @returns {SVGElement} Title column
 */
function makeTitleColumn(titleBox, strokeColor, titleHeight) {
    const group = document.createElementNS(SVG_NS, "g")
    const rect = makeBox(titleBox, 0, 0, strokeColor, "none");
    group.appendChild(rect);

    // const braceWidth = titleBox.width;
    // const braceX = (titleBox.outerWidth - braceWidth) / 2;
    // const braceHeight = 0.332 * braceWidth;
    // const totalHeight = titleHeight + 2 * braceHeight;

    // const braceYStart = (titleBox.outerHeight - totalHeight) / 2;
    // const braceYEnd = braceYStart + titleHeight + braceHeight;

    // const upperBrace = document.createElementNS(SVG_NS, "path");
    // upperBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0.965 0.332 C 0.856 0.185 0.702 0.111 0.504 0.111 C 0.303 0.111 0.146 0.185 0.034 0.332 L 0 0.332 L 0 0 L 1 0 Z");
    // upperBrace.setAttribute("fill", strokeColor);
    // upperBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYStart.toFixed(4)}) scale(${braceWidth})`);
    // group.appendChild(upperBrace);

    // const lowerBrace = document.createElementNS(SVG_NS, "path");
    // lowerBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0 0.332 L 0 0 L 0.034 0 C 0.146 0.147 0.302 0.221 0.501 0.221 C 0.702 0.221 0.857 0.147 0.967 0 L 1 0 Z");
    // lowerBrace.setAttribute("fill", strokeColor);
    // lowerBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYEnd.toFixed(4)}) scale(${braceWidth})`);
    // group.appendChild(lowerBrace);

    return group;
}

function brightenColor(hexString, factor = 0.5) {
    const r = parseInt(hexString.slice(1, 3), 16);
    const g = parseInt(hexString.slice(3, 5), 16);
    const b = parseInt(hexString.slice(5, 7), 16);

    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * @typedef {Object} GridState
 * @property {Box} page
 * Size and padding (inner margin) of the page in mm; .margin and .strokeWidth are ignored.
 * @property {string} mainStrokeColor
 * Color of the main stroke in CSS color string.
 * @property {Box} boxSize
 * Size, margin (outer margin), and strokeWidth of the Hanzi box in mm.
 * @property {"none" | "ruled" | "grid"} boxStyle
 * @property {boolean} addCross
 * @property {boolean} addDiagonal
 * @property {boolean} addThirds
 * @property {boolean} addBox
 * @property {"start" | "middle" | "end" | "none"} titleColumn
 * @property {number} titleLength
 * Number of characters in the title
 */

/**
 * @param {GridState} state
 * @returns {{svg: string, nColumns: number, nRows: number}} SVG string and number of columns/rows
 */
export function generatePage(state) {
    const {
        // Page geometry
        page,
        // Hanzi box
        mainStrokeColor,
        boxSize: box,
        boxStyle,
        // Box inner lines
        addCross,
        addDiagonal,
        addThirds,
        addBox,
        // Title
        titleColumn,
        titleLength
    } = state;

    // Root SVG
    const svg = document.createElementNS(SVG_NS, "svg");
    const defs = document.createElementNS(SVG_NS, "defs");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", `${page.svgWidth}mm`);
    svg.setAttribute("height", `${page.svgHeight}mm`);
    svg.setAttribute("viewBox", `0 0 ${page.svgWidth} ${page.svgHeight}`);
    svg.appendChild(defs);

    // Hanzi box geometry
    const outerStrokeWidth = 3 * box.strokeWidth;

    // Make Hanzi box
    const innerColor = brightenColor(mainStrokeColor, 0.7);
    const nDashesStraight = 19;
    const nDashesDiag = 25;

    if (boxStyle === "ruled") {
        box.margin.top = box.margin.bottom = 0;
    } else if (boxStyle === "grid") {
        const boxElement = makeHanziBox(
            box,
            nDashesStraight,
            nDashesDiag,
            mainStrokeColor,
            innerColor,
            addCross,
            addDiagonal,
            addThirds,
            addBox
        );
        defs.appendChild(boxElement);
    }
    const isEnclosed = box.margin.mergedVertical > 0;

    // Rows
    const boundaryRowHeight = box.outerHeight + box.margin.totalVertical;
    const interiorRowHeight = box.outerHeight - box.strokeWidth + box.margin.mergedVertical;

    let nInteriorRows = 0;
    let nBoundaryRows = 0;
    if (page.innerHeight >= boundaryRowHeight) {
        nBoundaryRows = 1;
        nInteriorRows = Math.max(0, Math.floor((page.innerHeight - boundaryRowHeight) / interiorRowHeight));
    }
    const nRows = nInteriorRows + nBoundaryRows;
    const columnsOuterHeight = boundaryRowHeight * nBoundaryRows + interiorRowHeight * nInteriorRows;

    const hanziColumn = document.createElementNS(SVG_NS, "g");
    hanziColumn.setAttribute("id", "hanziColumn");
    hanziColumn.setAttribute("stroke", mainStrokeColor);
    hanziColumn.setAttribute("stroke-width", box.strokeWidth.toFixed(4));

    if (boxStyle === "grid") {
        let y = box.margin.top;
        for (let i = 0; i < nRows; i++) {
            const boxRef = document.createElementNS(SVG_NS, "use");
            boxRef.setAttribute("href", "#hanziBox");
            boxRef.setAttribute("y", y.toFixed(4));
            hanziColumn.appendChild(boxRef);
            y += interiorRowHeight;
            // Dashed horizontal lines between boxes
            if (!isEnclosed && i < nRows - 1) {
                const x0 = box.innerOrigin[0];
                const x1 = box.innerEnd[0];
                hanziColumn.appendChild(makeLine(x0, y, x1, y, nDashesStraight, innerColor));
            }
        }
    }
    defs.appendChild(hanziColumn);

    // Columns
    const title = new Box(
        undefined, undefined,
        new SpacingRectangle(0), new SpacingRectangle(0),
        box.strokeWidth
    );
    title.outerWidth = box.outerWidth;
    title.outerHeight = columnsOuterHeight;

    const titleColumnWidth = title.outerWidth;
    const boundaryColumnWidth = box.outerWidth + box.margin.totalHorizontal;
    const interiorColumnWidth = box.outerWidth - box.strokeWidth + box.margin.mergedHorizontal;

    let nInteriorColumns = 0;
    let nBoundaryColumns = 0;
    let nTitleColumns = 0;
    switch (titleColumn) {
        case "middle": {
            const requiredWidth = titleColumnWidth + 2 * boundaryColumnWidth;
            if (page.innerWidth >= requiredWidth) {
                nTitleColumns = 1;
                nBoundaryColumns = 2;
                nInteriorColumns = Math.floor((page.innerWidth - requiredWidth) / interiorColumnWidth);
                nInteriorColumns -= nInteriorColumns % 2;
            }
            break;
        }
        case "start":
        case "end": {
            if (page.innerWidth >= titleColumnWidth) {
                nTitleColumns = 1;
                const remaining = page.innerWidth - titleColumnWidth;
                if (remaining >= boundaryColumnWidth) {
                    nBoundaryColumns = 1;
                    nInteriorColumns = Math.floor((remaining - boundaryColumnWidth) / interiorColumnWidth);
                }
            }
            break;
        }
        case "none": {
            if (page.innerWidth >= boundaryColumnWidth) {
                nBoundaryColumns = 1;
                nInteriorColumns = Math.floor((page.innerWidth - boundaryColumnWidth) / interiorColumnWidth);
            }
            break;
        }
    }

    const nColumns = nInteriorColumns + nBoundaryColumns + nTitleColumns;
    const columnsOuterWidth = (
        interiorColumnWidth * nInteriorColumns +
        boundaryColumnWidth * nBoundaryColumns +
        nTitleColumns * titleColumnWidth
    );

    let titleIdx = undefined;
    if (nTitleColumns > 0) {
        switch (titleColumn) {
            case "middle":
                titleIdx = Math.floor(nColumns / 2);
                break;
            case "start":
                titleIdx = 0;
                break;
            case "end":
                titleIdx = nColumns - 1;
                break;

        }
    }

    // Place columns
    const hanziBoard = document.createElementNS(SVG_NS, "g");
    hanziBoard.setAttribute("id", "hanziBoard");
    {
        let x = box.strokeWidth / 2 + box.margin.left;
        let y = box.strokeWidth / 2;
        for (let i = 0; i < nColumns; i++) {
            if (i === titleIdx) {
                if (i === 0) x -= box.margin.left;
                // if (i > 0) x -= box.margin.mergedHorizontal - box.margin.right;
                const titleColumn = makeBox(
                    title, x, y, 'red', 'pink',
                )
                // const titleColumn = makeTitleColumn(
                //     title,
                //     mainStrokeColor,
                //     titleLength * box.outerHeight
                // );
                // titleColumn.setAttribute("transform", `translate(${x.toFixed(4)}, ${y.toFixed(4)})`);
                titleColumn.setAttribute("id", "titleColumn")
                hanziBoard.appendChild(titleColumn);
                x += title.outerWidth - title.strokeWidth + box.margin.left;
            } else {
                let column;
                if (boxStyle === "ruled") {
                    column = document.createElementNS(SVG_NS, "rect");
                    column.setAttribute("width", box.svgWidth.toFixed(4));
                    column.setAttribute("height", title.svgHeight.toFixed(4));
                    column.setAttribute("fill", "none");
                    column.setAttribute("stroke", mainStrokeColor);
                    column.setAttribute("stroke-width", box.strokeWidth.toFixed(4));
                } else {
                    column = document.createElementNS(SVG_NS, "use");
                    column.setAttribute("href", "#hanziColumn");
                }
                column.setAttribute("x", x.toFixed(4));
                column.setAttribute("y", y.toFixed(4));
                hanziBoard.appendChild(column);
                {
                    const column = new Box(undefined, undefined);
                    column.outerWidth = box.outerWidth;
                    column.outerHeight = columnsOuterHeight;
                    hanziBoard.appendChild(makeBox(
                        column, x, y, 'none', 'rgb(0 0 0 / 50%)',
                    ));
                }

                x += interiorColumnWidth;
            }
        }
    }

    const paddingHorizontal = 0//(page.innerWidth - columnsOuterWidth) / 2;
    const paddingVertical = 0//(page.innerHeight - columnsOuterHeight) / 2;
    const hanziBoardBox = new Box(undefined, undefined, new SpacingRectangle(0), new SpacingRectangle(0), box.strokeWidth);
    hanziBoardBox.outerWidth = columnsOuterWidth;
    hanziBoardBox.outerHeight = columnsOuterHeight;

    // /* Draw outer box */ {
    //     let [x, y] = page.innerOrigin;
    //     const thickLinePadding = 0.5;

    //     const outerBox = new Box(undefined, undefined, new SpacingRectangle(0), new SpacingRectangle(0), outerStrokeWidth);
    //     outerBox.innerWidth = hanziBoardBox.outerWidth + thickLinePadding * 2;
    //     outerBox.innerHeight = hanziBoardBox.outerHeight + thickLinePadding * 2;

    //     x += paddingHorizontal - outerStrokeWidth / 2 - thickLinePadding;
    //     y += paddingVertical - outerStrokeWidth / 2 - thickLinePadding;
    //     svg.appendChild(makeBox(outerBox, x, y, mainStrokeColor, 'none'));
    // }

    /* Draw hanzi board */ {
        let [x, y] = page.innerOrigin;
        x += paddingHorizontal;
        y += paddingVertical;
        hanziBoard.setAttribute("transform", `translate(${x.toFixed(4)}, ${y.toFixed(4)})`);
        svg.appendChild(hanziBoard);
    }

    /* Draw inner box */ {
        let [x, y] = page.innerOrigin;
        // x += paddingHorizontal + box.strokeWidth / 2;
        // y += paddingVertical + box.strokeWidth / 2;
        // svg.appendChild(makeBox(hanziBoardBox, x, y, 'black', 'none'));
        [x, y] = page.innerOrigin;
        const hanziBoardBox2 = new Box(undefined, undefined);
        hanziBoardBox2.outerWidth = columnsOuterWidth;
        hanziBoardBox2.outerHeight = columnsOuterHeight;
        svg.appendChild(makeBox(hanziBoardBox2, x, y, 'none', 'rgb(100 100 255 / 50%)'));
    }

    // /* DEBUG */ {
    //     const debug = hanziBoardBox.clone()
    //     debug.strokeWidth = 0;
    //     debug.outerHeight = columnsOuterHeight;
    //     debug.outerWidth = columnsOuterWidth;
    //     let [x, y] = page.innerOrigin;
    //     x += paddingHorizontal;
    //     y += paddingVertical;
    //     svg.appendChild(makeBox(debug, x, y, 'none', 'rgb(0 0 255 / 50%)'));
    // }

    // /* DEBUG: Drawable area */ {
    //     const pageCopy2 = new Box(
    //         page.innerWidth, page.innerHeight,
    //         new SpacingRectangle(), new SpacingRectangle(),
    //         0
    //     );
    //     const pageBox2 = makeBox(pageCopy2, ...page.innerOrigin, 'none', 'rgb(255 0 0 / 25%)');
    //     svg.appendChild(pageBox2);
    // }

    return {
        svg: `<?xml version="1.0" encoding="utf-8"?>\n${svg.outerHTML}`, nColumns, nRows,
    };
}
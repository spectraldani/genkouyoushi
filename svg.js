"use strict";
const SVG_NS = "http://www.w3.org/2000/svg";

import { Box } from "./geometry.js";

/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} nDashes - number of dashes (must be >= 0)
 * @param {string | undefined} innerStrokeColor - CSS color string
 * @returns {SVGElement} SVG element
 */
function makeLine(x0, y0, x1, y1, nDashes, innerStrokeColor = undefined) {
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
    if (innerStrokeColor !== undefined)
        line.setAttribute("stroke", innerStrokeColor);

    return line;
}

/**
 * @param {number} width - Width of the title column
 * @param {number} height - Height of the title column
 * @param {string} strokeColor - CSS color string
 * @param {number} strokeWidth - Stroke width
 * @param {number} length - Number of characters in the title
 * @returns {SVGElement} Title column
 */
function makeTitleColumn(width, height, strokeColor, strokeWidth, length) {
    const group = document.createElementNS(SVG_NS, "g")

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("width", width.toFixed(4));
    rect.setAttribute("height", height.toFixed(4));
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", strokeColor);
    rect.setAttribute("stroke-width", strokeWidth.toFixed(4));
    group.appendChild(rect);

    const braceWidth = width;
    const braceX = (width - braceWidth) / 2;
    const braceHeight = 0.332 * braceWidth;
    const titleHeight = width * length;
    const totalHeight = titleHeight + 2 * braceHeight;

    const braceYStart = (height - totalHeight) / 2;
    const braceYEnd = braceYStart + titleHeight + braceHeight;

    const upperBrace = document.createElementNS(SVG_NS, "path");
    upperBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0.965 0.332 C 0.856 0.185 0.702 0.111 0.504 0.111 C 0.303 0.111 0.146 0.185 0.034 0.332 L 0 0.332 L 0 0 L 1 0 Z");
    upperBrace.setAttribute("fill", strokeColor);
    upperBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYStart.toFixed(4)}) scale(${braceWidth})`);
    group.appendChild(upperBrace);

    const lowerBrace = document.createElementNS(SVG_NS, "path");
    lowerBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0 0.332 L 0 0 L 0.034 0 C 0.146 0.147 0.302 0.221 0.501 0.221 C 0.702 0.221 0.857 0.147 0.967 0 L 1 0 Z");
    lowerBrace.setAttribute("fill", strokeColor);
    lowerBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYEnd.toFixed(4)}) scale(${braceWidth})`);
    group.appendChild(lowerBrace);

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
 * @property {Box} pageGeometry
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
        pageGeometry,
        // Hanzi box
        mainStrokeColor,
        boxSize,
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
    svg.setAttribute("width", `${pageGeometry.width}mm`);
    svg.setAttribute("height", `${pageGeometry.height}mm`);
    svg.setAttribute("viewBox", `0 0 ${pageGeometry.width} ${pageGeometry.height}`);
    svg.appendChild(defs);

    // Box geometry
    const strokeWidth = boxSize.strokeWidth;
    const boxHeight = boxSize.totalHeight;
    const boxWidth = boxSize.totalWidth;

    // Make Hanzi box
    const innerColor = brightenColor(mainStrokeColor, 0.7);

    const hanziBox = document.createElementNS(SVG_NS, "g");
    hanziBox.setAttribute("id", "hanziBox");
    hanziBox.setAttribute("stroke", mainStrokeColor);
    hanziBox.setAttribute("stroke-width", strokeWidth.toFixed(4));

    const lineStart = boxSize.innerOrigin[0];
    const lineEnd = boxSize.innerEnd[0];
    const nDashesStraight = 19;
    const nDashesDiag = 25;

    if (boxStyle === "ruled") {
        boxSize.margin.top = boxSize.margin.bottom = 0;
    } else if (boxStyle === "grid") {
        if (addCross) {
            hanziBox.appendChild(makeLine(boxWidth / 2, lineStart, boxWidth / 2, lineEnd, nDashesStraight, innerColor));
            hanziBox.appendChild(makeLine(lineStart, boxWidth / 2, lineEnd, boxWidth / 2, nDashesStraight, innerColor));
        }
        if (addDiagonal) {
            hanziBox.appendChild(makeLine(lineStart, lineStart, lineEnd, lineEnd, nDashesDiag, innerColor));
            hanziBox.appendChild(makeLine(lineStart, lineEnd, lineEnd, lineStart, nDashesDiag, innerColor));
        }
        if (addThirds) {
            hanziBox.appendChild(makeLine(lineStart, boxWidth / 3, lineEnd, boxWidth / 3, nDashesStraight, innerColor));
            hanziBox.appendChild(makeLine(lineStart, boxWidth / 3 * 2, lineEnd, boxWidth / 3 * 2, nDashesStraight, innerColor));
            hanziBox.appendChild(makeLine(boxWidth / 3, lineStart, boxWidth / 3, lineEnd, nDashesStraight, innerColor));
            hanziBox.appendChild(makeLine(boxWidth / 3 * 2, lineStart, boxWidth / 3 * 2, lineEnd, nDashesStraight, innerColor));
        }
        if (addBox) {
            const rect = document.createElementNS(SVG_NS, "rect");
            rect.setAttribute("x", (boxWidth / 4).toFixed(4));
            rect.setAttribute("y", (boxWidth / 4).toFixed(4));
            const len = boxWidth / 4 * 2;
            rect.setAttribute("width", len.toFixed(4));
            rect.setAttribute("height", len.toFixed(4));
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", innerColor);
            rect.setAttribute("stroke-width", strokeWidth.toFixed(4));
            // TODO fix dash calculation
            const dashLen = len / (nDashesStraight / 2);
            rect.setAttribute("stroke-dasharray", dashLen.toFixed(10));
            rect.setAttribute("stroke-dashoffset", dashLen.toFixed(10));
            hanziBox.appendChild(rect);
        }

        hanziBox.appendChild(makeLine(0, 0, 0, boxHeight, 0));
        hanziBox.appendChild(makeLine(boxWidth, 0, boxWidth, boxHeight, 0));

        // Solid top and bottom lines if there is vertical space between boxes
        if (boxSize.margin.mergedVertical > 0) {
            hanziBox.appendChild(makeLine(0, 0, boxWidth, 0, 0));
            hanziBox.appendChild(makeLine(0, boxHeight, boxWidth, boxHeight, 0));
        }
    }
    defs.appendChild(hanziBox);


    const usableWidth = pageGeometry.width - pageGeometry.padding.totalHorizontal;
    const usableHeight = pageGeometry.height - pageGeometry.padding.totalVertical;

    const columnWidth = boxWidth + boxSize.margin.horizontal;
    const rowHeight = boxHeight + boxSize.margin.vertical;

    // Rows
    const boundaryRowHeight = boxHeight + boxSize.margin.totalVertical;
    const interiorRowHeight = boxHeight + boxSize.margin.mergedVertical;
    const nRows = Math.max(0, Math.floor((usableHeight - boundaryRowHeight) / interiorRowHeight) + 1);
    const columnsHeight = boundaryRowHeight + interiorRowHeight * (nRows - 1);

    const hanziColumn = document.createElementNS(SVG_NS, "g");
    hanziColumn.setAttribute("id", "column");
    hanziColumn.setAttribute("stroke", mainStrokeColor);
    hanziColumn.setAttribute("stroke-width", strokeWidth.toFixed(4));

    if (boxStyle === "grid") {
        for (let i = 0; i < nRows; i++) {
            const y = boxSize.margin.top + i * interiorRowHeight;
            const boxRef = document.createElementNS(SVG_NS, "use");
            boxRef.setAttribute("href", "#hanziBox");
            boxRef.setAttribute("y", y.toFixed(4));
            hanziColumn.appendChild(boxRef);

            // Dashed horizontal lines between boxes
            if (boxSize.margin.mergedVertical === 0 && i < nRows - 1) {
                hanziColumn.appendChild(makeLine(lineStart, y + lineEnd + strokeWidth / 2, lineEnd, y + lineEnd + strokeWidth / 2, nDashesStraight, innerColor));
            }
        }
    }
    defs.appendChild(hanziColumn);

    // Compute column sizes and how many of each type
    const interiorColumnWidth = boxWidth + boxSize.margin.mergedHorizontal;
    const boundaryColumnWidth = boxWidth + boxSize.margin.totalHorizontal;
    const titleColumnWidth = boxWidth;

    let nInteriorColumns = 0;
    let nBoundaryColumns = 0;
    let nTitleColumns = 0;
    switch (titleColumn) {
        case "middle": {
            const requiredWidth = titleColumnWidth + 2 * boundaryColumnWidth;
            if (usableWidth >= requiredWidth) {
                nTitleColumns = 1;
                nBoundaryColumns = 2;
                nInteriorColumns = Math.floor((usableWidth - requiredWidth) / interiorColumnWidth);
                nInteriorColumns -= nInteriorColumns % 2;
            }
            break;
        }
        case "start":
        case "end": {
            if (usableWidth >= titleColumnWidth) {
                nTitleColumns = 1;
                const remaining = usableWidth - titleColumnWidth;
                if (remaining >= boundaryColumnWidth) {
                    nBoundaryColumns = 1;
                    nInteriorColumns = Math.floor((remaining - boundaryColumnWidth) / interiorColumnWidth);
                }
            }
            break;
        }
        case "none": {
            if (usableWidth >= boundaryColumnWidth) {
                nBoundaryColumns = 1;
                nInteriorColumns = Math.floor((usableWidth - boundaryColumnWidth) / interiorColumnWidth);
            }
            break;
        }
    }

    const nColumns = nInteriorColumns + nBoundaryColumns + nTitleColumns;
    const columnsWidth = (
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

    let x = boxSize.margin.left;
    for (let i = 0; i < nColumns; i++) {
        if (i === titleIdx) {
            if (i === 0) x -= boxSize.margin.left;
            if (i > 0) x -= boxSize.margin.mergedHorizontal - boxSize.margin.right;
            const titleColumn = makeTitleColumn(titleColumnWidth, columnsHeight, mainStrokeColor, strokeWidth, titleLength);
            titleColumn.setAttribute("transform", `translate(${x.toFixed(4)}, 0)`);
            hanziBoard.appendChild(titleColumn);
            x += titleColumnWidth + boxSize.margin.left;
        } else {
            let column;
            if (boxStyle === "ruled") {
                column = document.createElementNS(SVG_NS, "rect");
                column.setAttribute("width", boxWidth.toFixed(4));
                column.setAttribute("height", columnsHeight.toFixed(4));
                column.setAttribute("fill", "none");
                column.setAttribute("stroke", mainStrokeColor);
                column.setAttribute("stroke-width", strokeWidth.toFixed(4));
            } else {
                column = document.createElementNS(SVG_NS, "use");
                column.setAttribute("href", "#column");
            }
            column.setAttribute("x", x.toFixed(4));
            hanziBoard.appendChild(column);

            x += interiorColumnWidth;
        }
    }

    const paddingHorizontal = (pageGeometry.width - (pageGeometry.padding.left + pageGeometry.padding.right) - columnsWidth) / 2;
    const paddingVertical = (pageGeometry.height - (pageGeometry.padding.top + pageGeometry.padding.bottom) - columnsHeight) / 2;
    const originX = pageGeometry.padding.left + paddingHorizontal;
    const originY = pageGeometry.padding.top + paddingVertical;
    hanziBoard.setAttribute("transform", `translate(${originX.toFixed(4)}, ${originY.toFixed(4)})`);
    svg.appendChild(hanziBoard);

    const innerRect = document.createElementNS(SVG_NS, "rect");
    innerRect.setAttribute("x", originX.toFixed(4));
    innerRect.setAttribute("y", originY.toFixed(4));
    innerRect.setAttribute("width", columnsWidth.toFixed(4));
    innerRect.setAttribute("height", columnsHeight.toFixed(4));
    innerRect.setAttribute("stroke", mainStrokeColor);
    innerRect.setAttribute("stroke-width", strokeWidth.toFixed(4));
    innerRect.setAttribute("fill", "none");
    svg.appendChild(innerRect);

    const thickLinePadding = 1;
    const outerStrokeWidth = 3 * strokeWidth;
    const outerRect = document.createElementNS(SVG_NS, "rect");
    outerRect.setAttribute("x", (originX - (strokeWidth + outerStrokeWidth) / 2 - thickLinePadding).toFixed(4));
    outerRect.setAttribute("y", (originY - (strokeWidth + outerStrokeWidth) / 2 - thickLinePadding).toFixed(4));
    outerRect.setAttribute("width", (columnsWidth + strokeWidth + outerStrokeWidth + thickLinePadding * 2).toFixed(4));
    outerRect.setAttribute("height", (columnsHeight + strokeWidth + outerStrokeWidth + thickLinePadding * 2).toFixed(4));
    outerRect.setAttribute("stroke", mainStrokeColor);
    outerRect.setAttribute("stroke-width", outerStrokeWidth.toFixed(4));
    outerRect.setAttribute("fill", "none");
    svg.appendChild(outerRect);

    return {
        svg: `<?xml version="1.0" encoding="utf-8"?>\n${svg.outerHTML}`, nColumns, nRows,
    };
}
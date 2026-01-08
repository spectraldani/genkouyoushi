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
 * @typedef {Object} GridState
 * @property {Box} pageGeometry
 * @property {Box} boxSize
 * @property {"none" | "ruled" | "grid"} boxStyle
 * @property {boolean} addCross
 * @property {boolean} addDiagonal
 * @property {boolean} addThirds
 * @property {boolean} addBox
 * @property {number} titleColumnIdx
 * @property {boolean} hasTitle
 * @property {number} titleLength
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
        boxSize,
        boxStyle,
        // Box inner lines
        addCross,
        addDiagonal,
        addThirds,
        addBox,
        // Title
        titleColumnIdx,
        hasTitle,
        titleLength
    } = state;
    // Box geometry
    const strokeWidth = boxSize.strokeWidth;
    const boxHeight = boxSize.totalHeight;
    const boxWidth = boxSize.totalWidth;

    // Make Hanzi box
    const mainStrokeColor = "#000000";
    const innerColor = "#a0a0a0";

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
        hanziBox.appendChild(makeLine(0, 0, 0, boxHeight, 0));
        hanziBox.appendChild(makeLine(boxWidth, 0, boxWidth, boxHeight, 0));
        if (boxSize.margin.bottom > 0) {
            hanziBox.appendChild(makeLine(0, 0, boxWidth, 0, 0));
            hanziBox.appendChild(makeLine(0, boxHeight, boxWidth, boxHeight, 0));
        }

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
    }

    // Normalize margins
    boxSize.margin.top *= boxHeight
    boxSize.margin.right *= boxWidth
    boxSize.margin.bottom *= boxHeight
    boxSize.margin.left *= boxWidth

    const usableWidth = pageGeometry.width - (pageGeometry.margin.left + pageGeometry.margin.right) - boxSize.margin.left;
    const usableHeight = pageGeometry.height - (pageGeometry.margin.top + pageGeometry.margin.bottom) - boxSize.margin.top;

    const columnWidth = boxWidth + boxSize.margin.horizontal;
    const rowHeight = boxHeight + boxSize.margin.vertical;

    // Columns
    const nRows = Math.floor(usableHeight / rowHeight);

    const hanziColumn = document.createElementNS(SVG_NS, "g");
    hanziColumn.setAttribute("id", "column");
    hanziColumn.setAttribute("stroke", mainStrokeColor);
    hanziColumn.setAttribute("stroke-width", strokeWidth.toFixed(4));

    if (boxStyle === "grid") {
        for (let i = 0; i < nRows; i++) {
            const y = boxSize.margin.top + i * rowHeight;
            const boxRef = document.createElementNS(SVG_NS, "use");
            boxRef.setAttribute("href", "#hanziBox");
            boxRef.setAttribute("y", y.toFixed(4));
            hanziColumn.appendChild(boxRef);

            if (boxSize.margin.top === 0 && boxSize.margin.bottom === 0 && i < nRows - 1) {
                hanziColumn.appendChild(makeLine(lineStart, y + lineEnd, lineEnd, y + lineEnd, nDashesStraight, innerColor));
            }
        }
    }

    const nColumns = Math.floor(usableWidth / columnWidth);
    const hanziPageSize = [
        boxSize.margin.left + columnWidth * nColumns,
        boxSize.margin.top + rowHeight * nRows
    ];

    const paddingHorizontal = (pageGeometry.width - (pageGeometry.margin.left + pageGeometry.margin.right) - hanziPageSize[0]) / 2;
    const paddingVertical = (pageGeometry.height - (pageGeometry.margin.top + pageGeometry.margin.bottom) - hanziPageSize[1]) / 2;
    const origin = [pageGeometry.margin.left + paddingHorizontal, pageGeometry.margin.top + paddingVertical];

    const thickLinePadding = 10;

    // Root SVG
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", `${pageGeometry.width}mm`);
    svg.setAttribute("height", `${pageGeometry.height}mm`);
    svg.setAttribute("viewBox", `0 0 ${pageGeometry.width} ${pageGeometry.height}`);

    const defs = document.createElementNS(SVG_NS, "defs");
    defs.appendChild(hanziBox);
    defs.appendChild(hanziColumn);
    svg.appendChild(defs);

    const innerRect = document.createElementNS(SVG_NS, "rect");
    innerRect.setAttribute("x", `${origin[0]}`);
    innerRect.setAttribute("y", `${origin[1]}`);
    innerRect.setAttribute("width", `${hanziPageSize[0]}`);
    innerRect.setAttribute("height", `${hanziPageSize[1]}`);
    innerRect.setAttribute("stroke", "black");
    innerRect.setAttribute("stroke-width", `${strokeWidth}`);
    innerRect.setAttribute("fill", "none");
    svg.appendChild(innerRect);

    const outerRect = document.createElementNS(SVG_NS, "rect");
    outerRect.setAttribute("x", `${origin[0] - thickLinePadding * strokeWidth}`);
    outerRect.setAttribute("y", `${origin[1] - thickLinePadding * strokeWidth}`);
    outerRect.setAttribute("width", `${hanziPageSize[0] + thickLinePadding * 2 * strokeWidth}`);
    outerRect.setAttribute("height", `${hanziPageSize[1] + thickLinePadding * 2 * strokeWidth}`);
    outerRect.setAttribute("stroke", "black");
    outerRect.setAttribute("stroke-width", `${3 * strokeWidth}`);
    outerRect.setAttribute("fill", "none");
    svg.appendChild(outerRect);

    for (let i = 0; i < nColumns; i++) {
        const x = origin[0] + i * columnWidth;
        const y = origin[1];
        if (!hasTitle || i + 1 !== titleColumnIdx) {
            if (!(boxStyle === "ruled")) {
                const column = document.createElementNS(SVG_NS, "use");
                column.setAttribute("href", "#column");
                column.setAttribute("x", (boxSize.margin.left + x).toFixed(4));
                column.setAttribute("y", y.toFixed(4));
                svg.appendChild(column);
            } else {
                const rect = document.createElementNS(SVG_NS, "rect");
                rect.setAttribute("x", (boxSize.margin.left + x).toFixed(4));
                rect.setAttribute("y", y.toFixed(4));
                rect.setAttribute("width", boxWidth.toFixed(4));
                rect.setAttribute("height", hanziPageSize[1].toFixed(4));
                rect.setAttribute("fill", "none");
                rect.setAttribute("stroke", "black");
                rect.setAttribute("stroke-width", strokeWidth.toFixed(4));
                svg.appendChild(rect);
            }
        } else {
            const rect = document.createElementNS(SVG_NS, "rect");
            rect.setAttribute("x", x.toFixed(4));
            rect.setAttribute("y", y.toFixed(4));
            rect.setAttribute("width", columnWidth.toFixed(4));
            rect.setAttribute("height", hanziPageSize[1].toFixed(4));
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", "black");
            rect.setAttribute("stroke-width", strokeWidth.toFixed(4));
            svg.appendChild(rect);

            const braceWidth = columnWidth;
            const braceX = x + (columnWidth - braceWidth) / 2;
            const braceHeight = 0.332 * braceWidth;
            const titleHeight = boxWidth * titleLength;
            const totalHeight = titleHeight + 2 * braceHeight;

            const braceYStart = y + (hanziPageSize[1] - totalHeight) / 2;
            const braceYEnd = braceYStart + titleHeight + braceHeight;

            const upperBrace = document.createElementNS(SVG_NS, "path");
            upperBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0.965 0.332 C 0.856 0.185 0.702 0.111 0.504 0.111 C 0.303 0.111 0.146 0.185 0.034 0.332 L 0 0.332 L 0 0 L 1 0 Z");
            upperBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYStart.toFixed(4)}) scale(${braceWidth})`);
            svg.appendChild(upperBrace);

            const lowerBrace = document.createElementNS(SVG_NS, "path");
            lowerBrace.setAttribute("d", "M 1 0 L 1 0.332 L 0 0.332 L 0 0 L 0.034 0 C 0.146 0.147 0.302 0.221 0.501 0.221 C 0.702 0.221 0.857 0.147 0.967 0 L 1 0 Z");
            lowerBrace.setAttribute("transform", `translate(${braceX.toFixed(4)}, ${braceYEnd.toFixed(4)}) scale(${braceWidth})`);
            svg.appendChild(lowerBrace);
        }
    }

    return {
        svg: `<?xml version="1.0" encoding="utf-8"?>\n${svg.outerHTML}`, nColumns, nRows,
    };
}
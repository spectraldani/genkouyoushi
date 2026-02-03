"use strict";
const SVG_NS = "http://www.w3.org/2000/svg";

import { Box, SpacingRectangle } from "./geometry.js";

export class SVGBox extends Box {
    /**
     * @param {number} innerWidth
     * @param {number} innerHeight
     * @param {SpacingRectangle} margin
     * @param {SpacingRectangle} padding
     * @param {number} strokeWidth
     * @param {string | undefined} strokeColor
     * @param {string | undefined} fillColor
     * @param {[boolean, boolean, boolean, boolean] | undefined} sides - [top, right, bottom, left]
     */
    constructor(
        innerWidth,
        innerHeight,
        margin = new SpacingRectangle(),
        padding = new SpacingRectangle(),
        strokeWidth = 0,
        strokeColor = undefined,
        fillColor = undefined,
        sides = [true, true, true, true]
    ) {
        super(innerWidth, innerHeight, margin, padding, strokeWidth);
        this.strokeColor = strokeColor;
        this.fillColor = fillColor;
        this.sides = sides;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns {SVGGElement | SVGRectElement}
     */
    render(x = 0, y = 0) {
        if (this.svgHeight <= 0 || this.svgWidth <= 0)
            return document.createElementNS(SVG_NS, "g");

        if (this.sides.every(x => x)) {
            const rect = document.createElementNS(SVG_NS, "rect");
            const svgX = x + this.strokeWidth / 2;
            const svgY = y + this.strokeWidth / 2;
            rect.setAttribute("x", svgX.toFixed(4));
            rect.setAttribute("y", svgY.toFixed(4));
            rect.setAttribute("width", this.svgWidth.toFixed(4));
            rect.setAttribute("height", this.svgHeight.toFixed(4));

            if (this.fillColor !== undefined)
                rect.setAttribute("fill", this.fillColor);
            if (this.strokeColor !== undefined)
                rect.setAttribute("stroke", this.strokeColor);
            rect.setAttribute("stroke-width", this.strokeWidth.toFixed(4));
            return rect;
        } else {
            const [hasTop, hasRight, hasBottom, hasLeft] = this.sides;
            const group = document.createElementNS(SVG_NS, "g");
            if (this.strokeColor !== undefined)
                group.setAttribute("stroke", this.strokeColor);
            group.setAttribute("stroke-width", this.strokeWidth.toFixed(4));

            if (hasLeft)
                group.appendChild(makeLine(
                    x + this.strokeWidth / 2, y,
                    x + this.strokeWidth / 2, y + this.outerHeight,
                    0
                ));
            if (hasRight)
                group.appendChild(makeLine(
                    x + this.outerWidth - this.strokeWidth / 2, y,
                    x + this.outerWidth - this.strokeWidth / 2, y + this.outerHeight,
                    0
                ));

            if (hasTop)
                group.appendChild(makeLine(
                    x, y + this.strokeWidth / 2,
                    x + this.outerWidth, y + this.strokeWidth / 2,
                    0
                ));
            if (hasBottom)
                group.appendChild(makeLine(
                    x, y + this.outerHeight - this.strokeWidth / 2,
                    x + this.outerWidth, y + this.outerHeight - this.strokeWidth / 2,
                    0,
                ));

            if (this.fillColor !== undefined && this.fillColor !== "none") {
                const rect = document.createElementNS(SVG_NS, "rect");
                const [x0, y0] = this.innerOrigin;
                rect.setAttribute("x", (x + x0).toFixed(4));
                rect.setAttribute("y", (y + y0).toFixed(4));
                rect.setAttribute("width", this.innerWidth.toFixed(4));
                rect.setAttribute("height", this.innerHeight.toFixed(4));
                rect.setAttribute("fill", this.fillColor);
                rect.setAttribute("stroke", "none");
                group.appendChild(rect);
            }
            return group;
        }
    }

    clone() {
        return new SVGBox(
            this.innerWidth,
            this.innerHeight,
            this.margin.clone(),
            this.padding.clone(),
            this.strokeWidth,
            this.strokeColor,
            this.fillColor,
            [...this.sides]
        );
    }
}

export class SVGHanziBox extends SVGBox {
    constructor(
        innerWidth,
        innerHeight,
        margin,
        padding,
        strokeWidth,
        isEnclosed,
        nDashesStraight,
        nDashesDiag,
        mainStrokeColor,
        innerColor,
        addCross,
        addDiagonal,
        addThirds,
        addBox,
        addBottom
    ) {
        super(
            innerWidth,
            innerHeight,
            margin,
            padding,
            strokeWidth,
            mainStrokeColor, // strokeColor
            "none", // fillColor
            !isEnclosed ? [false, true, false, true] : [true, true, true, true] // sides
        );
        this.isEnclosedAttr = isEnclosed;
        this.nDashesStraight = nDashesStraight;
        this.nDashesDiag = nDashesDiag;
        this.mainStrokeColor = mainStrokeColor;
        this.innerColor = innerColor;
        this.addCross = addCross;
        this.addDiagonal = addDiagonal;
        this.addThirds = addThirds;
        this.addBox = addBox;
        this.addBottom = addBottom;
    }

    set isEnclosed(value) {
        this.sides = value ? [true, true, true, true] : [false, true, false, true];
        this.isEnclosedAttr = value;
    }

    get isEnclosed() {
        return this.isEnclosedAttr;
    }

    render(x = 0, y = 0, isLast = false) {
        const [x0Base, y0Base] = this.innerOrigin;
        const [x1Base, y1Base] = this.innerEnd;
        const x0 = x + x0Base;
        const y0 = y + y0Base;
        const x1 = x + x1Base;
        const y1 = y + y1Base;

        const boxElement = document.createElementNS(SVG_NS, "g");
        boxElement.setAttribute("stroke", this.mainStrokeColor);
        boxElement.setAttribute("stroke-width", this.strokeWidth.toFixed(4));
        if (this.addCross) {
            boxElement.appendChild(makeLine(
                x0, y0 + this.innerHeight / 2, x1, y0 + this.innerHeight / 2,
                this.nDashesStraight, this.innerColor
            ));
            boxElement.appendChild(makeLine(
                x0 + this.innerWidth / 2, y0, x0 + this.innerWidth / 2, y1,
                this.nDashesStraight, this.innerColor
            ));
        }
        if (this.addThirds) {
            boxElement.appendChild(makeLine(
                x0, y0 + this.innerHeight / 3, x1, y0 + this.innerHeight / 3,
                this.nDashesStraight, this.innerColor
            ));
            boxElement.appendChild(makeLine(
                x0, y0 + 2 * this.innerHeight / 3, x1, y0 + 2 * this.innerHeight / 3,
                this.nDashesStraight, this.innerColor
            ));
            boxElement.appendChild(makeLine(
                x0 + this.innerWidth / 3, y0, x0 + this.innerWidth / 3, y1,
                this.nDashesStraight, this.innerColor
            ));
            boxElement.appendChild(makeLine(
                x0 + 2 * this.innerWidth / 3, y0, x0 + 2 * this.innerWidth / 3, y1,
                this.nDashesStraight, this.innerColor
            ));
        }
        if (this.addDiagonal) {
            boxElement.appendChild(makeLine(x0, y0, x1, y1, this.nDashesDiag, this.innerColor));
            boxElement.appendChild(makeLine(x0, y1, x1, y0, this.nDashesDiag, this.innerColor));
        }
        if (this.addBox) {
            const rect = document.createElementNS(SVG_NS, "rect");
            rect.setAttribute("x", (x0 + this.innerWidth / 4).toFixed(4));
            rect.setAttribute("y", (y0 + this.innerWidth / 4).toFixed(4));
            const len = this.innerWidth / 4 * 2;
            rect.setAttribute("width", len.toFixed(4));
            rect.setAttribute("height", len.toFixed(4));
            rect.setAttribute("fill", "none");
            rect.setAttribute("stroke", this.innerColor);
            // TODO fix dash calculation
            const dashLen = len / (this.nDashesStraight / 2);
            rect.setAttribute("stroke-dasharray", dashLen.toFixed(10));
            rect.setAttribute("stroke-dashoffset", dashLen.toFixed(10));
            boxElement.appendChild(rect);
        }

        if (!this.isEnclosed && this.addBottom && !isLast) {
            boxElement.appendChild(makeLine(
                x0,
                y + this.outerHeight - this.strokeWidth / 2,
                x1,
                y + this.outerHeight - this.strokeWidth / 2,
                this.nDashesStraight, this.innerColor, this.strokeWidth
            ))
        }
        boxElement.appendChild(super.render(x, y));
        return boxElement;
    }

    clone() {
        return new SVGHanziBox(
            this.innerWidth, this.innerHeight,
            this.margin.clone(), this.padding.clone(),
            this.strokeWidth,
            this.isEnclosed,
            this.nDashesStraight, this.nDashesDiag,
            this.mainStrokeColor, this.innerColor,
            this.addCross, this.addDiagonal, this.addThirds, this.addBox
        );
    }
}

export function brightenColor(hexString, factor = 0.5) {
    const r = parseInt(hexString.slice(1, 3), 16);
    const g = parseInt(hexString.slice(3, 5), 16);
    const b = parseInt(hexString.slice(5, 7), 16);

    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

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
 * 
 * @param {number} availableWidth 
 * @param {number} availableHeight 
 * @param {SVGBox} box 
 * @param {function(number, number, boolean | undefined): SVGGElement} render
 * @returns {[SVGGElement, number, number, number, number]} The group element, the total width and height of the board, nColumns, nRows
 */
export function makeBoard(availableWidth, availableHeight, box, render, id = undefined) {
    const g = document.createElementNS(SVG_NS, "g");
    if (id !== undefined)
        g.setAttribute("id", id);

    const outerTopOutline = box.margin.top > 0 ? box.strokeWidth : 0;
    const outerBottomOutline = box.margin.bottom > 0 ? box.strokeWidth : 0;
    const outerLeftOutline = box.margin.left > 0 ? box.strokeWidth : 0;
    const outerRightOutline = box.margin.right > 0 ? box.strokeWidth : 0;
    const innerVerticalStrokeContribution = box.margin.mergedVertical === 0 ? box.strokeWidth : 0;
    const innerHorizontalStrokeContribution = box.margin.mergedHorizontal === 0 ? box.strokeWidth : 0;

    const columnWidthFixed = (
        outerLeftOutline
        + box.margin.left
        - (box.margin.mergedHorizontal - innerHorizontalStrokeContribution)
        + box.margin.right
        + outerRightOutline
    );
    const columnHeightFixed = (
        outerTopOutline
        + box.margin.top
        - (box.margin.mergedVertical - innerVerticalStrokeContribution)
        + box.margin.bottom
        + outerBottomOutline
    );


    const columnWidthVariable = (
        box.outerWidth + box.margin.mergedHorizontal - innerHorizontalStrokeContribution
    );
    const columnHeightVariable = (
        box.outerHeight + box.margin.mergedVertical - innerVerticalStrokeContribution
    );

    const nRows = Math.floor((availableHeight - columnHeightFixed) / columnHeightVariable);
    const nColumns = Math.floor((availableWidth - columnWidthFixed) / columnWidthVariable);

    const usedHeight = columnHeightFixed + columnHeightVariable * nRows;
    const usedWidth = columnWidthFixed + columnWidthVariable * nColumns;

    // Place boxes
    const startY = box.margin.top + outerTopOutline;
    let x = box.margin.left + outerLeftOutline;

    {
        const symbolFalse = document.createElementNS(SVG_NS, "symbol");
        symbolFalse.setAttribute("id", `${id ?? "box"}-false`);
        symbolFalse.appendChild(render(0, 0, false));
        g.appendChild(symbolFalse);
        const symbolTrue = document.createElementNS(SVG_NS, "symbol");
        symbolTrue.setAttribute("id", `${id ?? "box"}-true`);
        symbolTrue.appendChild(render(0, 0, true));
        g.appendChild(symbolTrue);
    }

    for (let i = 0; i < nColumns; i++) {
        let y = startY;
        for (let j = 0; j < nRows; j++) {
            const el = document.createElementNS(SVG_NS, "use");
            el.setAttribute("href", `#${id ?? "box"}-${j === nRows - 1}`);
            el.setAttribute("transform", `translate(${x.toFixed(4)}, ${y.toFixed(4)})`);
            g.appendChild(el);
            y += columnHeightVariable;
        }
        x += columnWidthVariable;
    }

    const boardBox = new SVGBox(
        undefined, undefined,
        undefined, undefined,
        box.strokeWidth, box.strokeColor,
        "none",
        [true, true, true, true]
    );
    boardBox.outerWidth = usedWidth;
    boardBox.outerHeight = usedHeight;
    g.appendChild(boardBox.render(0, 0));
    return [g, usedWidth, usedHeight, nColumns, nRows];
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



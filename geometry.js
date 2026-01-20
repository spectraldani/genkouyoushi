"use strict";

export class SpacingRectangle {
    /**
     * This constructor follows CSS margin specification.
     * @param {number} first
     * Height of the top margin
     * @param {number | undefined} second
     * Width of the right margin, if undefined, same value as the height of the top margin.
     * @param {number | undefined} third
     * Height of the bottom margin, if undefined, same as height of the top margin.
     * @param {number | undefined} fourth
     * Width of the left margin, if undefined, same as width of the right margin.
     */
    constructor(first = 0, second = undefined, third = undefined, fourth = undefined) {
        if (second === undefined) {
            this.top = this.bottom = this.left = this.right = first;
        } else if (third === undefined) {
            this.top = this.bottom = first;
            this.left = this.right = second;
        } else if (fourth === undefined) {
            this.top = first;
            this.left = this.right = second;
            this.bottom = third;
        } else {
            this.top = first;
            this.right = second;
            this.bottom = third;
            this.left = fourth;
        }
    }

    /**
     * @returns {number} Total amount of horizontal spacing
     */
    get totalHorizontal() {
        return this.left + this.right;
    }

    /**
     * @returns {number} Horizontal spacing, if margins are merged
     */
    get mergedHorizontal() {
        return Math.max(this.left, this.right);
    }

    /**
     * @returns {number} Total amount of vertical spacing
     */
    get totalVertical() {
        return this.top + this.bottom;
    }

    /**
     * @returns {number} Vertical spacing, if margins are merged
     */
    get mergedVertical() {
        return Math.max(this.top, this.bottom);
    }

    clone() {
        return new SpacingRectangle(this.top, this.right, this.bottom, this.left);
    }
}

export class Box {
    /**
     * @param {number} innerWidth - Width of the inner area, excluding padding, margin, and stroke width
     * @param {number} innerHeight - Height of the inner area, excluding padding, margin, and stroke width
     * @param {SpacingRectangle} margin
     * @param {SpacingRectangle} padding
     * @param {number} strokeWidth
     */
    constructor(
        innerWidth,
        innerHeight,
        margin = new SpacingRectangle(),
        padding = new SpacingRectangle(),
        strokeWidth = 0
    ) {
        this.innerWidth = innerWidth;
        this.innerHeight = innerHeight;
        this.margin = margin;
        this.padding = padding;
        this.strokeWidth = strokeWidth;
    }


    /**
     * @returns {number} Total width, excluding margin
     */
    get outerWidth() {
        return this.innerWidth + this.padding.totalHorizontal + 2 * this.strokeWidth;
    }

    /**
     * @param {number} width - Total width to be set, changing only innerWidth
     */
    set outerWidth(width) {
        this.innerWidth = width - this.padding.totalHorizontal - 2 * this.strokeWidth;
    }

    /**
     * @returns {number} Total height, excluding margin
     */
    get outerHeight() {
        return this.innerHeight + this.padding.totalVertical + 2 * this.strokeWidth;
    }

    /**
     * @param {number} height - Total height to be set, changing only innerHeight
     */
    set outerHeight(height) {
        this.innerHeight = height - this.padding.totalVertical - 2 * this.strokeWidth;
    }

    /**
     * @returns {[number, number]} Coordinates of the upper-left corner of the drawable area
     */
    get innerOrigin() {
        return [this.strokeWidth + this.padding.left, this.strokeWidth + this.padding.top];
    }

    /**
     * @returns {[number, number]} Coordinates of the bottom-right corner of the drawable area
     */
    get innerEnd() {
        const [x, y] = this.innerOrigin;
        return [x + this.innerWidth, y + this.innerHeight];
    }

    /**
     * @returns {number} Width for an SVG element, excluding margin
     */
    get svgWidth() {
        return this.innerWidth + this.padding.totalHorizontal + this.strokeWidth;
    }

    /**
     * @returns {number} Height for an SVG element, excluding margin
     */
    get svgHeight() {
        return this.innerHeight + this.padding.totalVertical + this.strokeWidth;
    }

    clone() {
        return new Box(this.innerWidth, this.innerHeight, this.margin.clone(), this.padding.clone(), this.strokeWidth);
    }
}
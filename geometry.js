"use strict";
export class SpacingRectangle {
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

    get totalHorizontal() {
        return this.left + this.right;
    }

    get mergedHorizontal() {
        return Math.max(this.left, this.right);
    }

    get totalVertical() {
        return this.top + this.bottom;
    }

    get mergedVertical() {
        return Math.max(this.top, this.bottom);
    }
}

export class Box {
    constructor(
        width, height, margin = new SpacingRectangle(0), padding = new SpacingRectangle(0), strokeWidth = 0
    ) {
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.padding = padding;
        this.strokeWidth = strokeWidth;
    }

    get totalHeight() {
        return this.height + this.padding.top + this.padding.bottom + this.strokeWidth;
    }

    get totalWidth() {
        return this.width + this.padding.left + this.padding.right + this.strokeWidth;
    }

    get innerOrigin() {
        return [this.strokeWidth / 2 + this.padding.left, this.strokeWidth / 2 + this.padding.top];
    }

    get innerEnd() {
        const innerOrigin = this.innerOrigin;
        return [innerOrigin[0] + this.width, innerOrigin[1] + this.height];
    }
}
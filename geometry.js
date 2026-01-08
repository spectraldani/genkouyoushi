"use strict";
export class SpacingRectangle {
    constructor(first, second = undefined, third = undefined, fourth = undefined) {
        if (second === undefined) {
            this.top = this.bottom = this.left = this.right = first;
        } else if (third === undefined) {
            this.top = this.bottom = first;
            this.left = this.right = second;
        } else if (fourth === undefined) {
            this.top = first;
            this.bottom = second;
            this.left = this.right = third;
        } else {
            this.top = first;
            this.bottom = second;
            this.left = third;
            this.right = fourth;
        }
    }

    get horizontal() {
        return Math.max(this.left, this.right);
    }

    get vertical() {
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
        return [this.strokeWidth/2 + this.padding.left, this.strokeWidth/2 + this.padding.top];
    }

    get innerEnd() {
        return [
            this.width - this.strokeWidth/2 - this.padding.right,
            this.height - this.strokeWidth/2 - this.padding.bottom
        ];
    }
}
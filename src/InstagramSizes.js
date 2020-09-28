export const InstagramSizes = {
    horizontalMax: 1.91 / 1,
    verticalMax: 4 / 5,
    maxDimensionPx: 1080
}

export function calculateMaxHeight(width, height) {
    return width * InstagramSizes.verticalMax;
};
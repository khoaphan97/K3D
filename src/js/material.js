export const BasicMaterial = (r, g, b) => {
    let material = {
        type: "NormalMaterial",
        base_color: [r, g, b],
    }
    return material;
}
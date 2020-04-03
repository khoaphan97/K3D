export const PointLight = (x, y, z, color) => {
    return {
        type: "PointLight",
        position: { x, y, z },
        color,
        intensity: 1.
    }
}

export const AmbientLight = (r, g, b) => {
    return {
        type: "AmbientLight",
        color: { r, g, b },
        intensity: .2
    }
}
// Notice : Adding a BlockType
// 1) BlockType in the enum
// 2) BlockTypeNames in the list
// 3) Incrementing array size in terrainToon fragment shader
// 4) Initializing with a color in PlanetMaterial.ts 

var BlockTypeNames: string[] = [
    "None",
    "Water",
    "Grass",
    "Dirt",
    "Sand",
    "Rock",
    "Wood",
    "Leaf",
    "Laterite",
    "Basalt",
    "Snow",
    "Ice",
    "Regolith",
    "Unknown"
];

enum BlockType {
    None = 0,
    Water = 1,
    Grass,
    Dirt,
    Sand,
    Rock,
    Wood,
    Leaf,
    Laterite,
    Basalt,
    Snow,
    Ice,
    Regolith,
    Unknown
}
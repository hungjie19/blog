// Vendored from https://github.com/stackedlol/ascii-sharks (MIT, see LICENSE) @ a0074c1.
// Local changes: 30fps render cap in OceanEngine.frame(); no splash on links / [data-ocean-solid];
// `shimmer` option to stop shark glyphs flashing colours; `grid` option to hide the cell grid.
export { OceanEngine } from "./engine";
export { AsciiRenderer, paintGrid } from "./renderer";
export { World, type SharkKind, type SharkSpec } from "./world";

declare module "topojson-client" {
  export function feature(
    topology: { objects: Record<string, { type: string; geometries: unknown[] }> },
    object: { type: string; geometries: unknown[] }
  ): { type: "FeatureCollection"; features: unknown[] };
}

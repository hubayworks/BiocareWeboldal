const imageModules = import.meta.glob(
  "/src/assets/Kozmetika Fotók /*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

export const galleryPhotos = Object.entries(imageModules)
  .filter(([path]) => !path.includes("AA527B39-11B9-418B-85E3-DEC22885424D"))
  .sort(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath, undefined, { numeric: true }))
  .map(([path, src], index) => ({
    src,
    alt: `BioCare Kozmetika fotó ${index + 1}`,
    width: 1008,
    height: 1200,
  }));
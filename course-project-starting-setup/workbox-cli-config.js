module.exports = {
  globDirectory: "public\\",
  globPatterns: ["**/*.{js,ico,html,json,css}", "src/images/*.{jpg,png}"],
  swSrc: "public/servicebase.js",
  swDest: "public/service.js",
  globIgnores: ["..\\workbox-cli-config.js", "help/**"],
};

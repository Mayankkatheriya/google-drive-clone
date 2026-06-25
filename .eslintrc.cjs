module.exports = {
  extends: ["next/core-web-vitals"],
  overrides: [
    {
      files: ["src/lib/server/**/*.js", "src/app/api/**/*.js"],
      env: { node: true },
    },
  ],
};

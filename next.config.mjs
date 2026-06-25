/** @type {import('next').NextConfig} */
function clientEnv(nextName, viteName) {
  return process.env[nextName] || process.env[viteName] || "";
}

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  env: {
    NEXT_PUBLIC_APIKEY: clientEnv("NEXT_PUBLIC_APIKEY", "VITE_APIKEY"),
    NEXT_PUBLIC_AUTHDOMAIN: clientEnv(
      "NEXT_PUBLIC_AUTHDOMAIN",
      "VITE_AUTHDOMAIN"
    ),
    NEXT_PUBLIC_PROJECT_ID: clientEnv(
      "NEXT_PUBLIC_PROJECT_ID",
      "VITE_PROJECT_ID"
    ),
    NEXT_PUBLIC_MESSAGING_SENDER_ID: clientEnv(
      "NEXT_PUBLIC_MESSAGING_SENDER_ID",
      "VITE_MESSAGING_SENDER_ID"
    ),
    NEXT_PUBLIC_APP_ID: clientEnv("NEXT_PUBLIC_APP_ID", "VITE_APP_ID"),
  },
};

export default nextConfig;

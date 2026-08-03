/** @type {import('next').NextConfig} */
const nextConfig = {
  // FlowApp prototype has been split into stateful components (no more raw DOM
  // listeners in useEffect), so StrictMode's dev double-invoke is safe again.
  reactStrictMode: true,
};
export default nextConfig;

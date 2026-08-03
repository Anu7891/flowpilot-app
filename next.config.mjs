/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode off for now: the ported prototype pages attach DOM listeners
  // in useEffect; double-invoke in dev makes that noisy. Turn back on once
  // FlowApp is split into stateful components.
  reactStrictMode: false,
};
export default nextConfig;

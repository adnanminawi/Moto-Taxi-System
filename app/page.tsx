import Link from "next/link";
import { DEMO } from "@/lib/demo"; 
const GITHUB_URL = "https://github.com/adnanminawi/MotoTaxi";
const roles = [
  {
    icon: "🧑",
    title: "Customer",
    desc: "Book a ride in seconds — no account needed.",
    points: ["Pick pickup & destination on the map", "Matched with the nearest driver", "Track your driver live"],
    href: "/customer",
    cta: "Book a ride",
    primary: true,
  },
  {
    icon: "🏍️",
    title: "Driver",
    desc: "Go online and receive nearby ride requests.",
    points: ["Accept or reject within 30 seconds", "Route to pickup, then to destination", "Live GPS location updates"],
    href: "/driver/login",
    cta: "Driver login",
    primary: false,
  },
  {
    icon: "📊",
    title: "Admin",
    desc: "Monitor and manage the whole platform.",
    points: ["Live map of online drivers", "Manage drivers, customers & rides", "Statistics dashboard"],
    href: "/admin/login",
    cta: "Admin login",
    primary: false,
  },
];
const steps = [
  { title: "Book", desc: "The customer picks a pickup and destination on the map and requests a ride." },
  { title: "Match", desc: "The system finds the nearest online driver using the Haversine distance." },
  { title: "Accept", desc: "The driver has 30 seconds to accept. If they reject or time out, the next nearest driver gets it." },
  { title: "Pickup", desc: "The driver follows the route to the customer and taps Arrived." },
  { title: "Complete", desc: "The route switches to the destination. At drop-off the ride is completed and the driver is free again." },
];
const features = [
  { title: "Role-based auth", desc: "JWT in httpOnly cookies with separate driver and admin sessions, enforced by middleware." },
  { title: "Race-safe rides", desc: "Every ride action is an atomic conditional update, so two drivers can never take the same ride." },
  { title: "Secure tracking", desc: "Customers track only their own ride through a signed per-ride token." },
  { title: "Tested", desc: "Automated tests (Vitest) cover matching, the ride lifecycle, and auth." },
  { title: "Live maps", desc: "Leaflet + OpenStreetMap with routing for drivers and live tracking for customers." },
  { title: "Deployed", desc: "Next.js on Vercel with a managed MySQL database." },
];
export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-extrabold">
            <span className="text-[#f4c542]">Moto</span>Taxi
          </Link>
          <div className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
            <a href="#roles" className="hover:text-black">Roles</a>
            <a href="#how" className="hover:text-black">How it works</a>
            <a href="#demo" className="hover:text-black">Demo</a>
            <a href="#tech" className="hover:text-black">Tech</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-black">
              GitHub
            </a>
          </div>
          <a
            href="#demo"
            className="rounded-lg bg-[#f4c542] px-4 py-2 text-sm font-semibold hover:bg-[#e6b93c] transition"
          >
            Try the demo
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center">
          <span className="inline-block rounded-full bg-[#fff4cc] px-3 py-1 text-xs font-semibold text-[#8a6d00]">
            Live demo · test data
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight md:text-6xl">
            Motorcycle rides, matched to the <span className="text-[#e0ad1f]">nearest driver</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            A full-stack ride-hailing platform with three roles — customers book, drivers accept and navigate,
            and admins monitor everything live.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/customer"
              className="rounded-xl bg-[#f4c542] px-6 py-3 font-semibold hover:bg-[#e6b93c] transition"
            >
              Book a ride →
            </Link>
            <a
              href="#how"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold hover:bg-gray-50 transition"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <h2 className="text-center text-3xl font-bold">Three roles, one platform</h2>
          <p className="mt-2 text-center text-gray-600">Choose how you want to continue.</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-4xl">{role.icon}</div>
                <h3 className="mt-4 text-xl font-bold">{role.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{role.desc}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-700">
                  {role.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[#e0ad1f]">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href={role.href}
                  className={`mt-6 rounded-lg py-2.5 text-center font-semibold transition ${
                    role.primary
                      ? "bg-[#f4c542] hover:bg-[#e6b93c]"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {role.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-3xl font-bold">How a ride works</h2>
            <p className="mt-2 text-center text-gray-600">From booking to drop-off in five steps.</p>

            <ol className="mt-12 grid gap-6 md:grid-cols-5">
              {steps.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border border-gray-200 bg-[#fafafa] p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4c542] font-bold">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{step.desc}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
              {["searching", "assigned", "en_route", "completed"].map((s, i, arr) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-3 py-1 text-white">{s}</span>
                  {i < arr.length - 1 && <span className="text-gray-400">→</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* DEMO */}
        <section id="demo" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
          <div className="rounded-3xl border border-[#f4c542] bg-[#fff8e1] p-8">
            <h2 className="text-2xl font-bold">Try the demo</h2>
            <p className="mt-2 text-gray-700">
              Use <strong>two different browsers</strong> (or one normal + one private window) — a browser can
              only hold one driver login.
            </p>

            <ol className="mt-6 space-y-2 text-sm text-gray-700">
              <li><strong>1.</strong> Browser A: log in as a driver and tap <em>Go Online</em> (allow location).</li>
              <li><strong>2.</strong> Browser B: open <em>Book a ride</em>, pick two points, request.</li>
              <li><strong>3.</strong> Browser A: accept → <em>Arrived</em> → <em>Complete</em>, and watch Browser B update.</li>
            </ol>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
                <h3 className="font-semibold">🏍️ Drivers</h3>
                <p className="mt-2">
                  Phone: {DEMO.drivers.map((p, i) => (
                    <span key={p}>
                      <code className="rounded bg-gray-100 px-1.5 py-0.5">{p}</code>
                      {i < DEMO.drivers.length - 1 && " or "}
                    </span>
                  ))}
                </p>
                <p className="mt-1">
                  Password: <code className="rounded bg-gray-100 px-1.5 py-0.5">{DEMO.driverPassword}</code>
                </p>
                <Link href="/driver/login" className="mt-3 inline-block font-semibold text-[#8a6d00] hover:underline">
                  Driver login →
                </Link>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm">
                <h3 className="font-semibold">📊 Admin</h3>
                <p className="mt-2">
                  Username: <code className="rounded bg-gray-100 px-1.5 py-0.5">{DEMO.adminUsername}</code>
                </p>
                <p className="mt-1">
                  Password: <code className="rounded bg-gray-100 px-1.5 py-0.5">{DEMO.adminPassword}</code>
                </p>
                <Link href="/admin/login" className="mt-3 inline-block font-semibold text-[#8a6d00] hover:underline">
                  Admin login →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* TECH */}
        <section id="tech" className="scroll-mt-20 bg-white py-16">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="text-center text-3xl font-bold">Under the hood</h2>
            <p className="mt-2 text-center text-gray-600">
              Next.js · TypeScript · MySQL · JWT · Leaflet · Vitest · Vercel
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-200 p-6">
                  <h3 className="font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        Built by Adnan Minawi ·{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-black">
          GitHub
        </a>
      </footer>
    </div>
  );
}
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const roles = [
    {
      label: "Customer",
      desc: "Book a ride and track your driver in real time.",
      href: "/customer",
      icon: "🧑",
    },
    {
      label: "Driver",
      desc: "Go online, receive ride requests, and start earning.",
     href: "/driver/login",
      icon: "🏍️",
    },
    {
      label: "Admin",
      desc: "Monitor drivers, rides, and live activity.",
      href: "/admin/login",
      icon: "📊",
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>Moto Taxi System</header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.brandAccent}>Moto</span>Taxi
          </h1>
          <p className={styles.tagline}>
            Fast, safe rides connecting you with the nearest driver. Choose how
            you want to continue.
          </p>
        </section>

        <section className={styles.roles}>
          {roles.map((role) => (
            <Link key={role.href} href={role.href} className={styles.card}>
              <div className={styles.icon}>{role.icon}</div>
              <h2 className={styles.cardTitle}>{role.label}</h2>
              <p className={styles.cardDesc}>{role.desc}</p>
              <span className={styles.enter}>Continue →</span>
            </Link>
          ))}
          
        </section>
        <section className={styles.demo}>
          <h2 className={styles.demoTitle}>Demo access</h2>
          <p className={styles.demoNote}>
            This is a demo with test data. Try it in two browser windows: log in
            as a driver and go online, then book a ride as a customer.
          </p>

          <div className={styles.demoGrid}>
            <div className={styles.demoCard}>
              <h3>🏍️ Drivers Phone</h3>
              <p>Adnan: 03816556</p>
              <p>Ismaeel: 81741454</p>
              <p>Password: 123</p>
            </div>
            <div className={styles.demoCard}>
              <h3>📊 Admin</h3>
              <p>Username: admin</p>
              <p>Password: Admin123</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight">AccessRecord</span>
        <a
          href="#get-started"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Get started free
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          SOC 2 &amp; HIPAA ready
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Add SOC 2 audit logs to your app
          <br />
          <span className="text-indigo-600">in 10 minutes.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          AccessRecord is a drop-in audit logging API for SaaS applications.
          One API call per user action — we store, search, and surface every
          event for your compliance team.
        </p>
        <a
          id="get-started"
          href="mailto:hello@accessrecord.dev"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Get started free
        </a>
      </section>

      {/* Value props */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">10-minute integration</h3>
            <p className="text-gray-600 text-sm">
              One HTTP call per event. No SDKs required — plain JSON, any
              language.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg mb-2">Instant audit trail</h3>
            <p className="text-gray-600 text-sm">
              Search by user, action, or resource. Export for auditors in
              seconds.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-3">🛡️</div>
            <h3 className="font-semibold text-lg mb-2">Compliance-ready</h3>
            <p className="text-gray-600 text-sm">
              Immutable event log, tamper-evident storage — built for SOC 2 and
              HIPAA.
            </p>
          </div>
        </div>
      </section>

      {/* Code snippet */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          It really is this simple
        </h2>
        <pre className="bg-gray-900 text-green-400 rounded-xl p-6 text-sm overflow-x-auto leading-relaxed">
          {`curl -X POST https://api.accessrecord.dev/api/v1/events \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "actor":  { "id": "user_123", "email": "alice@example.com" },
    "action": "document.deleted",
    "target": { "id": "doc_456", "type": "document", "name": "Q4 Report" }
  }'`}
        </pre>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} AccessRecord. All rights reserved.
      </footer>
    </main>
  );
}

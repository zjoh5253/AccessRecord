import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";

const PAGE_SIZE = 50;

interface EventRow {
  id: string;
  actor: { id: string; name?: string; email?: string };
  action: string;
  target: { id: string; type: string; name?: string };
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}

interface WorkspaceRow {
  id: string;
  name: string;
}

interface PageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function DashboardPage({ params, searchParams }: PageProps) {
  const { workspaceId } = await params;
  const { page: pageParam, q } = await searchParams;

  const db = getDb();

  // Verify workspace exists
  const wsResult = await db.query<WorkspaceRow>(
    "SELECT id, name FROM workspaces WHERE id = $1",
    [workspaceId]
  );
  if (wsResult.rowCount === 0) {
    notFound();
  }
  const workspace = wsResult.rows[0];

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  // Build search query
  let whereClause = "WHERE workspace_id = $1";
  const queryParams: unknown[] = [workspaceId];

  if (q) {
    queryParams.push(`%${q}%`);
    whereClause += ` AND (actor->>'email' ILIKE $${queryParams.length} OR action ILIKE $${queryParams.length})`;
  }

  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) FROM events ${whereClause}`,
    queryParams
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  queryParams.push(PAGE_SIZE, offset);
  const eventsResult = await db.query<EventRow>(
    `SELECT id, actor, action, target, metadata, ip_address, created_at
     FROM events
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
    queryParams
  );

  const events = eventsResult.rows;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← AccessRecord
            </a>
            <h1 className="text-xl font-semibold mt-1">
              {workspace.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono">{workspace.id}</p>
          </div>
          <div className="text-sm text-gray-500">
            {totalCount.toLocaleString()} events
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <form method="GET" className="mb-6 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by actor email or action..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
          {q && (
            <a
              href={`/dashboard/${workspaceId}`}
              className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear
            </a>
          )}
        </form>

        {/* Events table */}
        {events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No events found.</p>
            {q && <p className="text-sm mt-2">Try a different search term.</p>}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                      {new Date(event.created_at).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {event.actor.name ?? event.actor.id}
                      </div>
                      {event.actor.email && (
                        <div className="text-xs text-gray-400">{event.actor.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {event.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{event.target.name ?? event.target.id}</div>
                      <div className="text-xs text-gray-400">{event.target.type}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {event.ip_address ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/dashboard/${workspaceId}?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Previous
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/dashboard/${workspaceId}?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className="border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

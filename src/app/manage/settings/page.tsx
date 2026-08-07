import { getSessionUser } from "@/features/auth/auth";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const storageConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return (
    <>
      <header className="manage-header">
        <div>
          <p className="eyebrow">SYSTEM</p>
          <h1>Settings</h1>
        </div>
      </header>
      <section className="manage-panel settings-list">
        <h2>Administrator</h2>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd className="status published">Connected</dd>
          </div>
          <div>
            <dt>Media storage</dt>
            <dd
              className={`status ${storageConfigured ? "published" : "draft"}`}
            >
              {storageConfigured ? "Configured" : "Not configured"}
            </dd>
          </div>
        </dl>
        <p>
          Administrator credentials and infrastructure secrets are changed
          through deployment environment variables and the database—not through
          public forms.
        </p>
      </section>
    </>
  );
}

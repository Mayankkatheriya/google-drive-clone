import {
  getFileRequestRecord,
  getFileRequestPublicMeta,
} from "@/lib/server/fileRequests";
import FileRequestView from "@/components/request/FileRequestView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const record = await getFileRequestRecord(params.token).catch(() => null);
  if (!record) {
    return { title: "Link not found · Disk Drive" };
  }
  const title = `${record.ownerName || "Someone"} is requesting files · Disk Drive`;
  return {
    title,
    description: record.title,
    openGraph: { title, description: record.title, type: "website" },
  };
}

export default async function Page({ params }) {
  const record = await getFileRequestRecord(params.token).catch(() => null);

  if (!record) {
    return (
      <FileRequestView
        state={{
          status: "missing",
          message: "This file request link may be invalid or removed.",
        }}
      />
    );
  }

  const meta = getFileRequestPublicMeta(record);
  if (meta.unavailable) {
    return (
      <FileRequestView
        state={{ status: meta.unavailable.status, message: meta.unavailable.message }}
      />
    );
  }

  return (
    <FileRequestView
      state={{
        status: meta.requiresPassword ? "locked" : "open",
        token: params.token,
        title: meta.title,
        ownerName: meta.ownerName,
        remaining: meta.remaining,
      }}
    />
  );
}

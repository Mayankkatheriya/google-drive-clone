import { headers } from "next/headers";
import {
  getShareLinkRecord,
  getShareLinkPublicMeta,
} from "@/lib/server/shareLinks";
import { shouldSkipShareRedeem } from "@/lib/server/linkPreviewBots";
import ShareLinkView from "@/components/share/ShareLinkView";

export async function generateMetadata({ params }) {
  const record = await getShareLinkRecord(params.token).catch(() => null);

  if (!record) {
    return { title: "Link not found · Disk Drive" };
  }

  const meta = getShareLinkPublicMeta(record);
  const title = meta?.unavailable
    ? "Link unavailable · Disk Drive"
    : `${record.filename} · Disk Drive`;

  return {
    title,
    description: "Secure shared file on Disk Drive",
    openGraph: {
      title: record.filename,
      description: "Secure shared file on Disk Drive",
      type: "website",
    },
  };
}

export default async function Page({ params }) {
  const headerList = headers();
  const record = await getShareLinkRecord(params.token).catch(() => null);

  if (!record) {
    return (
      <ShareLinkView
        state={{
          status: "missing",
          message: "This share link may be invalid or removed.",
        }}
      />
    );
  }

  const meta = getShareLinkPublicMeta(record);

  if (meta?.unavailable) {
    return (
      <ShareLinkView
        state={{
          status: meta.unavailable.status,
          message: meta.unavailable.message,
        }}
      />
    );
  }

  if (shouldSkipShareRedeem(headerList)) {
    return (
      <ShareLinkView
        state={{
          status: "preview",
          filename: record.filename,
          contentType: record.contentType,
          size: record.size || 0,
        }}
      />
    );
  }

  return (
    <ShareLinkView
      state={{
        status: "gate",
        token: params.token,
        filename: record.filename,
        contentType: record.contentType,
        size: record.size || 0,
        requiresPassword: Boolean(record.passwordHash),
        allowDownload: record.allowDownload !== false,
        maxViews: record.maxViews ?? null,
      }}
    />
  );
}

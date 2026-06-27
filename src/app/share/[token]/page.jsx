import { headers } from "next/headers";
import {
  getShareLinkRecord,
  redeemShareLink,
} from "@/lib/server/shareLinks";
import { shouldSkipShareRedeem } from "@/lib/server/linkPreviewBots";
import ShareLinkView from "@/components/share/ShareLinkView";

export async function generateMetadata({ params }) {
  const record = await getShareLinkRecord(params.token).catch(() => null);

  if (!record) {
    return { title: "Link not found · Disk Drive" };
  }

  const title = record.redeemed
    ? "Link already used · Disk Drive"
    : `${record.filename} · Disk Drive`;

  return {
    title,
    description: "One-time secure file link — opens only once.",
    openGraph: {
      title: record.filename,
      description: "One-time secure file link on Disk Drive",
      type: "website",
    },
  };
}

export default async function Page({ params }) {
  const headerList = headers();

  if (shouldSkipShareRedeem(headerList)) {
    const record = await getShareLinkRecord(params.token);

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

    if (record.redeemed) {
      return (
        <ShareLinkView
          state={{
            status: "used",
            message: "One-time links expire after the first open.",
          }}
        />
      );
    }

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

  try {
    const data = await redeemShareLink(params.token);
    return <ShareLinkView state={{ status: "ready", ...data }} />;
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const status =
      statusCode === 410 ? "used" : statusCode === 404 ? "missing" : "error";

    return (
      <ShareLinkView
        state={{
          status,
          message: error.message || "Unable to open this link",
        }}
      />
    );
  }
}

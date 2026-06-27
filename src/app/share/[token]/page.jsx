import { redeemShareLink } from "@/lib/server/shareLinks";
import ShareLinkView from "@/components/share/ShareLinkView";

export default async function Page({ params }) {
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

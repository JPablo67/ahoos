import {
  reactExtension,
  useSettings,
  BlockStack,
  Heading,
  Text,
  Image,
  Link,
  Banner,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.thank-you.block.render",
  () => <ThankYouVideo />,
);

function ThankYouVideo() {
  const { video_url, heading, description } = useSettings() as {
    video_url?: string;
    heading?: string;
    description?: string;
  };

  const videoId = extractYouTubeId(video_url ?? "");

  if (!videoId) {
    return (
      <Banner status="warning">
        <Text>
          Thank-you video block: paste a valid YouTube URL in the block settings.
        </Text>
      </Banner>
    );
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // hqdefault.jpg (480×360) is generated for every YouTube video.
  // maxresdefault.jpg only exists for ≥720p uploads and 404s otherwise.
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <BlockStack spacing="base">
      {heading ? <Heading level={2}>{heading}</Heading> : null}
      {description ? <Text>{description}</Text> : null}
      <Link to={watchUrl} external accessibilityLabel="Play video on YouTube">
        <Image
          source={thumbnailUrl}
          accessibilityDescription="Video thumbnail"
          fit="cover"
          aspectRatio={16 / 9}
          loading="eager"
        />
      </Link>
      <Link to={watchUrl} external>
        Watch on YouTube
      </Link>
    </BlockStack>
  );
}

function extractYouTubeId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const ID_RE = /^[A-Za-z0-9_-]{11}$/;
  if (ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && ID_RE.test(v)) return v;
    const pathMatch = url.pathname.match(
      /^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/,
    );
    if (pathMatch) return pathMatch[1];
  }

  return null;
}

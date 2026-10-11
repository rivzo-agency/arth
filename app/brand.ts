export const brand = {
  name: "ARTH by ANTRIKSH",
  shortName: "ARTH",
  parentName: "ANTRIKSH",
  tagline: "Purpose, shaped into progress. An ANTRIKSH company.",
  descriptor: "An independent web, social media, campaign and brand studio",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "+91 98288 23210",
  phoneHref: process.env.NEXT_PUBLIC_CONTACT_PHONE_HREF?.trim() || "+919828823210",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "",
  wordmark: "/antriksh-word.png",
  mark: "/antriksh-mark.png",
};

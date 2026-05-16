import { brand } from "@/config/brand";
import { absoluteUrl } from "@/lib/seo";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: brand.clinicName,
    url: absoluteUrl("/el"),
    telephone: brand.phone,
    email: brand.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address,
      addressLocality: brand.city,
      addressCountry: "GR",
    },
    areaServed: brand.city,
    medicalSpecialty: "Dentistry",
    priceRange: "$$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import { brand } from "@/config/brand";
import { absoluteUrl } from "@/lib/seo";
import { type PublicClinicProfile } from "@/lib/public/clinic-profile";

export function StructuredData({
  clinicProfile,
}: {
  clinicProfile: PublicClinicProfile;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: clinicProfile.clinicName,
    url: absoluteUrl("/el"),
    telephone: clinicProfile.phone,
    email: clinicProfile.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinicProfile.address,
      addressLocality: clinicProfile.city,
      addressCountry: "GR",
    },
    areaServed: clinicProfile.city || brand.city,
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

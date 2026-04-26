import Link from "next/link";
import { PageHeader } from "./Demo";

const SECTIONS = [
  { href: "/design-system/tokens", title: "Tokens", desc: "Couleurs, ombres, radii, motion." },
  { href: "/design-system/typography", title: "Typography", desc: "Fraunces + Plus Jakarta Sans." },
  { href: "/design-system/buttons", title: "Buttons", desc: "CTA, secondaire, ghost, icône." },
  { href: "/design-system/cards", title: "Cards", desc: "Radii organiques + élévations papier." },
  { href: "/design-system/inputs", title: "Inputs", desc: "TextInput, NumberStepper, SegmentedControl." },
  { href: "/design-system/badges", title: "Badges", desc: "Urgent, soon, ok, info." },
  { href: "/design-system/bubbles", title: "Plant bubbles", desc: "La voix personnifiée de la plante." },
  { href: "/design-system/icons", title: "Icons", desc: "12 icônes line-art custom." },
  { href: "/design-system/motion", title: "Motion", desc: "Durations & easings." },
];

export default function DesignSystemHome() {
  return (
    <>
      <PageHeader
        title="Welcome to Violette DS"
        lead="Direction Herbier moderne — terracotta, mousse, papier, Fraunces. Module dev-only pour explorer chaque composant et son comportement."
      />

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="block rounded-organic-2 bg-white border border-paper-200 shadow-paper px-6 py-5 hover:shadow-lift transition-shadow duration-180 ease-organic"
            >
              <p className="font-serif text-lg text-ink-800">{s.title}</p>
              <p className="font-sans text-sm text-ink-600 mt-1">{s.desc}</p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 font-sans text-xs text-ink-400">
        Cette interface est uniquement disponible en <code>NODE_ENV=development</code>. Elle est exclue automatiquement du build de production.
      </p>
    </>
  );
}

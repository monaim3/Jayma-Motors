import { Container } from "@/components/ui/Container";
import { VEHICLE_BRANDS } from "@/lib/home-content";

/**
 * Brand → logo file in public/images/brands. Most are Simple Icons (CC0 SVG
 * data); Mercedes-Benz, Lexus, Land Rover and Proton are simplified versions
 * drawn in-house (not in Simple Icons). Logos are trademarks of their owners,
 * shown only to say which makes we service.
 */
const LOGOS = {
  Toyota: "toyota",
  Honda: "honda",
  Nissan: "nissan",
  Mitsubishi: "mitsubishi",
  Mazda: "mazda",
  Suzuki: "suzuki",
  Subaru: "subaru",
  Lexus: "lexus",
  Hyundai: "hyundai",
  Kia: "kia",
  "Mercedes-Benz": "mercedes-benz",
  BMW: "bmw",
  Audi: "audi",
  Volkswagen: "volkswagen",
  "Land Rover": "land-rover",
  Ford: "ford",
  Proton: "proton",
  Tata: "tata",
  MG: "mg",
};

const BRANDS = VEHICLE_BRANDS.filter((brand) => LOGOS[brand]);

/**
 * Home: slim "brands we service" strip — a label on the left and one slow row
 * of logos with names. The logo SVG is used as a CSS mask so it takes the text
 * colour (grey, white on hover). The track holds two identical halves and moves
 * by -50% so the loop is seamless; the copy is hidden from screen readers.
 */
export function BrandsMarquee() {
  const items = (copy) =>
    BRANDS.map((brand) => (
      <li
        key={`${copy}-${brand}`}
        aria-hidden={copy === 1 || undefined}
        className="flex shrink-0 items-center gap-3 pr-12 text-zinc-400 transition-colors hover:text-white sm:pr-14"
      >
        <span
          aria-hidden="true"
          className="block h-9 w-16 bg-current [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]"
          style={{ maskImage: `url(/images/brands/${LOGOS[brand]}.svg)` }}
        />
        <span className="text-sm font-bold tracking-[0.15em] whitespace-nowrap uppercase">{brand}</span>
      </li>
    ));

  return (
    <section aria-labelledby="brands-heading">
      <Container className="py-10 2xl:py-15">
        <div className="flex flex-col gap-6 rounded-card border border-white/10 bg-surface px-6 py-6 backdrop-blur-sm lg:flex-row lg:items-center lg:gap-10 lg:py-5">
          <div className="shrink-0 lg:border-r lg:border-white/10 lg:pr-10">
            <p className="text-xs font-semibold tracking-widest text-brand-500 uppercase">Brands we service</p>
            <h2 id="brands-heading" className="mt-1 font-display text-2xl font-medium whitespace-nowrap text-white">
              Every major make
            </h2>
          </div>

          <div className="group flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <ul className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
              {items(0)}
              {items(1)}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

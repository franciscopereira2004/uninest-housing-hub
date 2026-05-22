import { Link } from "react-router-dom";
import { Bath, Calendar, FileSignature, GraduationCap, MapPin, Receipt, Wifi } from "lucide-react";
import type { Listing } from "@/types";
import { PROPERTY_TYPE_LABELS } from "@/types";
import { FavouriteButton } from "@/components/listings/FavouriteButton";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.images[0]?.url ?? "";

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover && (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        )}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <FavouriteButton listingId={listing.id} />
          <div className="rounded-full bg-background/95 px-3 py-1 text-sm font-semibold text-foreground shadow-soft">
            {listing.monthlyPrice}€<span className="text-xs font-normal text-muted-foreground">/mês</span>
          </div>
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground shadow-soft">
          {PROPERTY_TYPE_LABELS[listing.propertyType]}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-1 font-display text-lg font-semibold">{listing.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {listing.address}, {listing.city}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            {listing.nearbyUniversity} · {listing.distanceToUniversity} km
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {listing.billsIncluded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-primary">
              <Receipt className="h-3 w-3" /> Despesas incl.
            </span>
          )}
          {listing.internetIncluded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-accent">
              <Wifi className="h-3 w-3" /> Internet
            </span>
          )}
          {listing.contractAvailable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              <FileSignature className="h-3 w-3" /> Com contrato
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              <Bath className="h-3 w-3" /> {listing.bathrooms} WC
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
            <Calendar className="h-3 w-3" /> {fmtDate(listing.availableFrom)}
          </span>
        </div>
      </div>
    </Link>
  );
}

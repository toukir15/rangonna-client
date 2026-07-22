import { ISuggestion } from "@/@interfaces/HeaderInterface/header.interface";
import Image from "next/image";

interface SuggestionListProps {
  suggestions: ISuggestion[];
  onSelect: (s: ISuggestion) => void;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  onSelect,
}) => {
  return (
    <div className="rongonaa-suggestions-panel max-h-72 overflow-y-auto p-2">
      <ul>
        {suggestions.map((s, index) => (
          <li key={index} onClick={() => onSelect(s)}>
            <div className="rongonaa-suggestion-item">
              <Image
                src={s?.featured_image?.src || "/no-image.png"}
                alt={s?.title || ""}
                height={44}
                width={52}
                loading="lazy"
                className="rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-secondary">
                  {s?.title}
                </p>
                {s?.pricing && (
                  <p className="mt-1 text-sm font-bold text-primary">
                    ৳{s.pricing.sale_price}{" "}
                    <del className="font-medium text-secondary/35">
                      ৳{s.pricing.regular_price}
                    </del>
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

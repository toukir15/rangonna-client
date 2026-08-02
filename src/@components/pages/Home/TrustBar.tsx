import Icon from "@/@components/core/Icon/Icon";

const items = [
  {
    title: "Cash on Delivery",
    text: "Pay when your order arrives",
    icon: "payments",
  },
  {
    title: "Nationwide Delivery",
    text: "Shipping across Bangladesh",
    icon: "local_shipping",
  },
  {
    title: "Easy Exchange",
    text: "Hassle-free size exchange",
    icon: "sync",
  },
  {
    title: "Secure Packaging",
    text: "Gift-ready & protected",
    icon: "verified_user",
  },
] as const;

export default function TrustBar() {
  return (
    <section className="rongonaa-trust-bar" aria-label="Why shop Rangonaa">
      <div className="rongonaa-trust-bar__grid">
        {items.map((item) => (
          <div key={item.title} className="rongonaa-trust-bar__item">
            <span className="rongonaa-trust-bar__icon" aria-hidden>
              <Icon name={item.icon} size={16} variant="outlined" />
            </span>
            <div>
              <p className="rongonaa-trust-bar__title">{item.title}</p>
              <p className="rongonaa-trust-bar__text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

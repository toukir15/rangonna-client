// app/privacy-policy/page.tsx  (Next.js App Router)
// or components/PrivacyPolicy.tsx (as a reusable component)
import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      <h1 className="md:text-3xl text-xl font-bold  text-start">
        Privacy Policy – Naviforce Authentic Watch
      </h1>

      <p className="text-[#777777]">
        Welcome to Naviforce Authentic Watch. We respect your privacy and want
        to protect your personal information. To learn more, please read this
        Privacy Policy. This Privacy Policy explains how we collect, use and
        (under certain conditions) disclose your personal information, the steps
        we take to secure it, and your options regarding its use and disclosure.
        By visiting the Site directly or through another site, you accept the
        practices described in this Policy.
      </p>

      <p className="text-[#777777] md:pt-3 pt-2">
        Data protection is a matter of trust and your privacy is important to
        us. We shall therefore only use your name and other information which
        relates to you in the manner set out in this Privacy Policy. We collect
        information only when necessary and only if it is relevant to our
        dealings with you. We keep your information only as long as required by
        law or as relevant for the purposes for which it was collected. You can
        browse the Site without providing personal details; you remain anonymous
        unless you log in to your account.
      </p>

      {/* Section 1 */}
      <h2
        id="data-we-collect"
        className="md:text-2xl text-xl font-semibold md:pt-8 pt-4 pb-2"
      >
        1. Data that we collect
      </h2>
      <p className="text-[#777777]">
        We may collect information if you place an order on the Site. We
        collect, store, and process your data to process purchases and possible
        later claims, and to provide services. This may include (without
        limitation): title, name, gender, date of birth, email, postal address,
        delivery address, telephone, mobile, fax, payment details, payment card
        details or bank account details.
      </p>
      <p className="text-[#777777] md:pt-3 pt-2">
        We use this information to: process orders; provide requested services
        and information; administer your account; verify and carry out payments;
        audit downloads; improve and customize the website; identify visitors;
        conduct demographic research; and send information you request or may
        find useful (including products and services), if you’ve not opted out.
        With consent, we may email you about other products/services. You can
        opt out anytime.
      </p>
      <p className="text-[#777777] md:pt-3 pt-2">
        We may pass your name and address to third parties to make delivery
        (e.g., couriers/suppliers). You must submit accurate information, keep
        it up to date, and inform us of changes.
      </p>
      <p className="text-[#777777] md:pt-3 pt-2">
        Your order details may be stored but cannot be retrieved directly for
        security reasons. You may access them by logging into your account to
        view orders (completed/open/dispatching) and manage addresses, bank
        details (for refunds), and newsletters. Treat your login credentials as
        confidential; we aren’t liable for password misuse unless due to our
        fault.
      </p>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2 lg:text-justify text-start">
        Other uses of your Personal Information
      </h3>
      <ul className="list-disc list-inside text-[#777777] space-y-1">
        <li>
          Opinion & market research (anonymous; statistical purposes). You can
          opt out anytime. Survey answers are stored separately from your email.
        </li>
        <li>
          We may send info about us, the Site, our other sites, products, sales,
          newsletters, group companies, or partners. To stop: click
          <em> unsubscribe</em> in any email. Within 7 working days (not Sunday
          or public holidays in Bangladesh) we will cease sending as requested.
        </li>
        <li>
          We may anonymize usage data (e.g., location trends, feature usage,
          link engagement) and share aggregated stats with third parties (e.g.,
          publishers). This data cannot identify you.
        </li>
      </ul>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2">Competitions</h3>
      <p className="text-[#777777]">
        For competitions, we use data to notify winners and advertise offers.
        Details (where applicable) are available in the competition’s terms of
        participation.
      </p>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2">
        Third Parties and Links
      </h3>
      <p className="text-[#777777]">
        We may pass your details to group companies, agents, or subcontractors
        (e.g., delivery, payment collection, data analysis, marketing, customer
        service). We may exchange information for fraud protection and credit
        risk reduction. If we sell the business (or a part), databases may be
        transferred. Other than as set out here, we do <strong>not</strong> sell
        or disclose your personal data to third parties without consent, unless
        required by law or necessary to provide services. The Site may contain
        third-party ads/links/frames; we are not responsible for their privacy
        practices or content.
      </p>

      {/* Section 2 */}
      <h2
        id="cookies"
        className="md:text-2xl text-xl font-semibold md:pt-8 pt-4 pb-2"
      >
        2. Cookies
      </h2>
      <p className="text-[#777777]">
        Cookies aren’t required to visit the Site, but the basket/ordering
        features need them. Cookies are small text files used to recognize your
        device and save time. We use them for convenience (e.g., remembering
        your cart/email) and not for targeted advertising. Disabling cookies may
        restrict Site functionality. Our cookies do not contain personal data
        and are virus-free. Learn more at{" "}
        <a
          className="underline"
          href="http://www.allaboutcookies.org"
          target="_blank"
          rel="noreferrer"
        >
          allaboutcookies.org
        </a>{" "}
        and cookie removal at{" "}
        <a
          className="underline"
          href="http://www.allaboutcookies.org/manage-cookies/index.html"
          target="_blank"
          rel="noreferrer"
        >
          Manage Cookies
        </a>
        .
      </p>

      <h4 className="text-lg font-semibold pt-4 pb-2">
        Google Analytics (Cookies)
      </h4>
      <p className="text-[#777777]">
        This site uses Google Analytics, which uses cookies to analyze website
        usage. The cookie-generated information (including your IP address) may
        be transmitted to and stored by Google in the U.S. Google uses it to
        evaluate usage, compile reports, and provide related services. Google
        may transfer this info to third parties where required by law or when
        processing on Google’s behalf. Google will not associate your IP with
        other data held by Google. You can refuse cookies in your browser, but
        some features may not work. By using this website, you consent to
        processing as described by Google.
      </p>

      {/* Section 3 */}
      <h2
        id="security"
        className="md:text-2xl text-xl font-semibold md:pt-8 pt-4 pb-2"
      >
        3. Security
      </h2>
      <p className="text-[#777777]">
        We use appropriate technical and organizational measures to protect your
        data against unauthorized or unlawful access, accidental loss,
        destruction, or damage. Personal details are collected on secure
        servers; firewalls are in place. We may request proof of identity before
        disclosing personal information. You are responsible for protecting your
        device from unauthorized access.
      </p>

      {/* Section 4 */}
      <h2
        id="your-rights"
        className="md:text-2xl text-xl font-semibold md:pt-8 pt-4 pb-2"
      >
        4. Your rights
      </h2>
      <p className="text-[#777777] md:pb-8 pb-4">
        You may request access to your personal data we hold or process, and ask
        us to correct inaccuracies free of charge. You can also instruct us at
        any time to stop using your personal data for direct marketing.
      </p>
    </div>
  );
};

export default PrivacyPolicy;

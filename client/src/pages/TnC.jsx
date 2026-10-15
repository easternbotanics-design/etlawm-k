import React from "react";
import NavBar from "../components/NavBar2.jsx";
import Footer from "../components/Footer.jsx";
import { colours, fonts } from "../theme/theme.js";

const TnC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: colours.background,
        color: colours.text,
        display: "flex",
        flexDirection: "column",
        fontFamily: fonts.secondary,
      }}
    >
      <NavBar />

      <main className="flex-1 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            {/* <span
              className="inline-block text-xs uppercase tracking-[0.25em] font-semibold px-3 py-1 rounded-full mb-3"
              style={{
                backgroundColor: colours.surface,
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              Legal Agreement
            </span>*/}
            <br />
            <h1
              className="text-3xl sm:text-5xl font-bold tracking-tight mb-4"
              style={{
                fontFamily: fonts.title || fonts.primary,
                color: colours.secondary,
              }}
            >
              TERMS & CONDITIONS
            </h1>
            <div
              className="w-16 h-[2px] mx-auto mb-5 rounded-full"
              style={{ backgroundColor: colours.accent }}
            />
            {/* <div
              className="flex items-center justify-center gap-6 text-xs sm:text-sm"
              style={{ color: colours.mutedText }}
            >
              <span>
                <strong className="font-medium text-stone-700">Effective Date:</strong> [??]
              </span>
              <span>•</span>
              <span>
                <strong className="font-medium text-stone-700">Last Updated:</strong> [??]
              </span>
            </div>*/}
          </div>

          {/* Document Content Card */}
          <article
            className="rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm border space-y-10 leading-relaxed"
            style={{
              backgroundColor: colours.subBackground || "#FFFFFF",
              borderColor: colours.border,
            }}
          >
            {/* Introduction */}
            <div
              className="space-y-4 text-sm sm:text-base border-b pb-8"
              style={{
                borderColor: colours.border,
                color: colours.text,
              }}
            >
              <p>
                Welcome to ETLAWM, an online platform operated by Eastern Botanics Pvt. Ltd. (“ETLAWM”, “we”, “us”, “our” or “Company”).
              </p>
              <p>
                These Terms & Conditions (“Terms”) govern your access to and use of the ETLAWM website, including the purchase of cosmetics, personal-care products, hair-care products, skincare products and other products offered through the website (collectively, the “Products”).
              </p>
              <p>
                By accessing, browsing or purchasing from the ETLAWM website, you acknowledge that you have read, understood and agreed to these Terms, together with our Privacy Policy, Shipping Policy, Return/Refund Policy and any other policies displayed on the website.
              </p>
              <p className="font-medium" style={{ color: colours.accent }}>
                If you do not agree with these Terms, please do not use the website or place an order.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                1. ABOUT ETLAWM
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM is a brand of Eastern Botanics Pvt. Ltd., a company incorporated under the applicable laws of India.
                </p>
                <p>
                  The Company reserves the right to modify, update, suspend or discontinue any part of the website, Product range, Product descriptions, pricing, offers or other website content at any time, subject to applicable law.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                2. ELIGIBILITY TO USE THE WEBSITE
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>By using this website or placing an order, you represent that:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>You are legally competent to enter into a binding contract under applicable Indian law.</li>
                  <li>The information provided by you during registration, checkout or communication with us is accurate and complete.</li>
                  <li>You will use the website only for lawful purposes.</li>
                  <li>You will not use the website for fraudulent, unlawful, abusive or unauthorized activities.</li>
                </ol>
                <p>
                  Where a person below the legally applicable age accesses the website, such access and purchases shall be made with the involvement and consent of a parent or lawful guardian.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                3. PRODUCT INFORMATION
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  We make reasonable efforts to ensure that Product descriptions, photographs, ingredients, quantities, directions for use, claims, prices and other information displayed on the website are accurate and current.
                </p>
                <p>However:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Actual Product packaging, colour, texture, fragrance or appearance may vary slightly from photographs displayed on the website.</li>
                  <li>Product images are for representation and may not always exactly reflect the latest packaging.</li>
                  <li>Product benefits and claims are based on the intended use and formulation of the Product and should not be interpreted as a guarantee of a particular result for every individual.</li>
                  <li>Cosmetic and personal-care Products may produce different results depending on an individual's skin type, hair type, usage, environmental conditions and other factors.</li>
                  <li>Minor variations in natural ingredients, colour, fragrance or texture do not necessarily constitute a Product defect.</li>
                </ul>
                <p>
                  We reserve the right to correct typographical, pricing, description or other inadvertent errors on the website.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                4. COSMETIC PRODUCT DISCLAIMER
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM Products are intended for their stated cosmetic or personal-care purposes and should be used strictly according to the directions provided on the Product packaging and/or website.
                </p>
                <p>Customers are advised to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Read the Product label and ingredients before use.</li>
                  <li>Follow the recommended method and frequency of use.</li>
                  <li>Perform a patch test where appropriate, particularly if they have sensitive skin or a history of cosmetic sensitivity.</li>
                  <li>Avoid contact with eyes unless the Product is specifically intended for use around the eyes.</li>
                  <li>Discontinue use if significant irritation, redness, itching, burning or other adverse reaction occurs and seek appropriate medical advice where necessary.</li>
                </ul>
                <p>
                  ETLAWM Products are not intended to diagnose, treat, cure or prevent any disease unless expressly permitted and represented under applicable law.
                </p>
                <p>
                  Product information available on the website should not be considered a substitute for professional medical advice.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                5. PRODUCT AVAILABILITY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>All Products displayed on the website are subject to availability.</p>
                <p>We reserve the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Limit the quantity of Products available for purchase.</li>
                  <li>Refuse or cancel an order where a Product is unavailable.</li>
                  <li>Discontinue a Product.</li>
                  <li>Correct inventory-related errors.</li>
                  <li>Restrict purchases where we reasonably suspect fraudulent or unauthorized activity.</li>
                </ul>
                <p>
                  If an order is cancelled by us because the ordered Product is unavailable or cannot reasonably be supplied, any amount received from the customer for that unavailable Product shall be dealt with in accordance with applicable law and the applicable refund policy.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                6. PRICES, TAXES AND CHARGES
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Product prices displayed on the website shall be the prices applicable at the time of placing the order, subject to inadvertent technical or pricing errors.
                </p>
                <p>Applicable taxes, including GST, shall be charged as required by law.</p>
                <p>
                  Shipping or delivery charges, where applicable, shall be displayed during the ordering process or otherwise communicated to the customer.
                </p>
                <p>
                  ETLAWM reserves the right to change Product prices, discounts and promotional offers at any time. Such changes shall not ordinarily affect an order that has already been accepted and confirmed, except where required to correct an obvious pricing or technical error.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                7. ORDER PLACEMENT
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  When you place an order through the website, you are making an offer to purchase the selected Products.
                </p>
                <p>
                  An order shall be considered accepted only when ETLAWM confirms the order, processes it for fulfilment, or otherwise communicates acceptance in accordance with its order-processing system.
                </p>
                <p>We reserve the right to cancel or decline an order, wholly or partially, in circumstances including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Product unavailability;</li>
                  <li>Incorrect pricing or Product information;</li>
                  <li>Suspected fraud or unauthorized transactions;</li>
                  <li>Incorrect or incomplete customer information;</li>
                  <li>Duplicate or unusually large orders;</li>
                  <li>Delivery restrictions;</li>
                  <li>Technical errors; or</li>
                  <li>Any other circumstances permitted by applicable law.</li>
                </ul>
                <p>
                  Where payment has already been received for an order that is cancelled by ETLAWM, the amount shall be refunded or otherwise dealt with in accordance with applicable law and the applicable refund policy.
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                8. PAYMENT
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Payments may be processed through third-party payment gateways or other payment service providers made available on the website.
                </p>
                <p>
                  ETLAWM does not ordinarily store complete card, banking or other sensitive payment credentials unless expressly permitted and required under applicable law.
                </p>
                <p>
                  Customers must ensure that the payment information provided by them is accurate and that they are authorized to use the selected payment method.
                </p>
                <p>
                  ETLAWM shall not be responsible for unauthorized transactions resulting from the customer's negligence, disclosure of credentials, failure to secure their account or actions outside the reasonable control of ETLAWM, subject to applicable law.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                9. SHIPPING AND DELIVERY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM will make reasonable efforts to dispatch and deliver Products within the estimated time communicated at the time of purchase.
                </p>
                <p>Delivery timelines are estimates and may be affected by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Courier or logistics delays;</li>
                  <li>Weather conditions;</li>
                  <li>Natural disasters;</li>
                  <li>Strikes or disruptions;</li>
                  <li>Government restrictions;</li>
                  <li>Public emergencies;</li>
                  <li>Incorrect or incomplete address information;</li>
                  <li>Customer unavailability;</li>
                  <li>Remote or restricted delivery locations; or</li>
                  <li>Other circumstances beyond the reasonable control of ETLAWM.</li>
                </ul>
                <p>
                  The customer is responsible for providing a complete and accurate delivery address, telephone number and other required information.
                </p>
                <p>
                  ETLAWM shall not be responsible for delivery failure caused by an incorrect address, incomplete information or repeated customer unavailability, subject to applicable law.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                10. INSPECTION OF PACKAGE AT DELIVERY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Customers are advised to inspect the external condition of the package at the time of delivery, wherever reasonably possible.
                </p>
                <p>
                  If the package appears materially damaged, tampered with, leaking or otherwise compromised, the customer should, where possible:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Record photographs or video of the package;</li>
                  <li>Note the condition of the package;</li>
                  <li>Contact ETLAWM/customer support as soon as reasonably practicable; and</li>
                  <li>Preserve the Product, packaging, shipping label and other relevant material until the matter is resolved.</li>
                </ol>
                <p>
                  Failure to record or immediately report damage shall not, by itself, extinguish any statutory rights available to the customer.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                11. RETURN, REFUND AND EXCHANGE POLICY
              </h2>
              <div className="space-y-4 text-sm sm:text-base" style={{ color: colours.text }}>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: colours.secondary }}>
                    11.1 General Policy
                  </h3>
                  <p className="mb-2">
                    Due to the nature of cosmetic, skincare, hair-care and personal-care Products, Products are generally non-returnable, non-exchangeable and non-refundable once delivered, particularly where the Product has been opened, unsealed, used, tested or tampered with.
                  </p>
                  <p className="mb-2">
                    This restriction is intended to protect product hygiene, safety, quality and authenticity.
                  </p>
                  <p>
                    However, this policy shall not exclude or restrict any right or remedy available to a consumer under applicable law.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: colours.secondary }}>
                    11.2 No Refund for Change of Mind
                  </h3>
                  <p className="mb-2">
                    Subject to applicable law, ETLAWM generally does not accept returns or provide refunds merely because a customer:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-2">
                    <li>Changes their mind after purchase;</li>
                    <li>Orders the wrong Product;</li>
                    <li>Orders the wrong quantity;</li>
                    <li>Does not like the fragrance, texture or appearance of a Product;</li>
                    <li>Finds the Product unsuitable for their personal preference;</li>
                    <li>Experiences a result different from their personal expectation; or</li>
                    <li>No longer requires the Product.</li>
                  </ul>
                  <p>
                    Customers should carefully review Product information, ingredients, quantity and directions before placing an order.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: colours.secondary }}>
                    11.3 Exceptions
                  </h3>
                  <p className="mb-2">
                    Notwithstanding the general non-returnable policy, ETLAWM may provide an appropriate remedy, including replacement, refund or other remedy as required by applicable law, where the Product is established to be:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mb-2">
                    <li>Defective;</li>
                    <li>Damaged during transit;</li>
                    <li>Incorrectly supplied;</li>
                    <li>Materially different from the Product ordered;</li>
                    <li>Spurious or counterfeit;</li>
                    <li>Missing from the delivered order;</li>
                    <li>Delivered in a materially compromised condition; or</li>
                    <li>Otherwise subject to a statutory consumer remedy.</li>
                  </ul>
                  <p>
                    Any such claim may require photographs, videos, order details, batch information, packaging, invoice and other reasonable evidence necessary to investigate the complaint.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: colours.secondary }}>
                    11.4 Opened or Used Products
                  </h3>
                  <p>
                    For hygiene and safety reasons, ETLAWM generally cannot accept the return of Products that have been opened, unsealed or used, except where a return or other remedy is required under applicable law.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1" style={{ color: colours.secondary }}>
                    11.5 Refund Method
                  </h3>
                  <p className="mb-2">
                    Where a refund is approved, it may ordinarily be processed through the original payment method or another lawful method communicated by ETLAWM.
                  </p>
                  <p>
                    The time taken for the amount to appear in the customer's account may depend on the payment gateway, bank or financial institution.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 12 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                12. PRODUCT QUALITY COMPLAINTS
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  A customer who believes that a Product is defective or otherwise does not conform to the order should contact ETLAWM customer support with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Order number;</li>
                  <li>Customer name and contact details;</li>
                  <li>Product name;</li>
                  <li>Batch/Lot number, where available;</li>
                  <li>Photographs and/or video;</li>
                  <li>Photographs of the outer packaging and shipping label;</li>
                  <li>Description of the issue; and</li>
                  <li>Any other information reasonably required for investigation.</li>
                </ul>
                <p>ETLAWM may investigate the complaint before determining the appropriate remedy.</p>
                <p>Nothing in this clause shall limit any statutory rights available to a consumer.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                13. ALLERGIES AND INDIVIDUAL SENSITIVITY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>Customers are responsible for reviewing the ingredient list and Product information before use.</p>
                <p>
                  Individuals may have allergies, sensitivities or individual reactions to cosmetic ingredients. ETLAWM cannot guarantee that a Product will be suitable for every individual.
                </p>
                <p>
                  If you have known allergies, sensitive skin, an existing skin condition, are undergoing treatment, are pregnant or breastfeeding, or have any other relevant medical concern, consult an appropriately qualified healthcare professional before using a Product where appropriate.
                </p>
                <p>
                  An individual reaction or dissatisfaction with a cosmetic Product does not automatically establish that the Product is defective.
                </p>
                <p>
                  Where a customer experiences a serious or unusual reaction, they should discontinue use and seek appropriate professional medical assistance.
                </p>
              </div>
            </section>

            {/* Section 14 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                14. PROMOTIONAL OFFERS AND DISCOUNTS
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Promotional offers, coupon codes, discounts and special schemes may be subject to additional terms and conditions.
                </p>
                <p>Unless expressly stated otherwise:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Promotional offers cannot be combined.</li>
                  <li>Offers may be available for a limited period.</li>
                  <li>Offers may be subject to minimum purchase requirements.</li>
                  <li>Offers may be limited to specified Products or customers.</li>
                  <li>ETLAWM may withdraw or modify an offer in accordance with applicable law.</li>
                </ul>
                <p>No promotional offer shall be interpreted as creating a permanent entitlement.</p>
              </div>
            </section>

            {/* Section 15 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                15. INTELLECTUAL PROPERTY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>All content available on the ETLAWM website, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Brand names;</li>
                  <li>Logos;</li>
                  <li>Product names;</li>
                  <li>Product photographs;</li>
                  <li>Graphics;</li>
                  <li>Packaging images;</li>
                  <li>Text;</li>
                  <li>Product descriptions;</li>
                  <li>Website design;</li>
                  <li>Videos;</li>
                  <li>Illustrations;</li>
                  <li>Trade dress; and</li>
                  <li>Other intellectual property</li>
                </ul>
                <p>is owned by or licensed to ETLAWM/Eastern Botanics Pvt. Ltd., unless otherwise stated.</p>
                <p>
                  Such content shall not be copied, reproduced, modified, distributed, published, commercially exploited or used without prior written permission, except where permitted by applicable law.
                </p>
              </div>
            </section>

            {/* Section 16 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                16. USER CONTENT AND REVIEWS
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Where the website permits customers to submit reviews, comments, photographs or other content, the customer represents that such content:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Is truthful to the best of their knowledge;</li>
                  <li>Does not violate any applicable law;</li>
                  <li>Does not infringe the rights of any third party;</li>
                  <li>Does not contain malicious software;</li>
                  <li>Is not defamatory, abusive or misleading; and</li>
                  <li>Does not contain confidential or sensitive information belonging to another person.</li>
                </ul>
                <p>
                  ETLAWM reserves the right to remove or decline to publish content that violates these requirements or applicable law.
                </p>
              </div>
            </section>

            {/* Section 17 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                17. WEBSITE USE AND PROHIBITED ACTIVITIES
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>Customers shall not:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Attempt to gain unauthorized access to the website or its systems.</li>
                  <li>Introduce viruses, malware or other harmful code.</li>
                  <li>Use automated systems to scrape or copy website content without authorization.</li>
                  <li>Engage in fraudulent transactions.</li>
                  <li>Use another person's identity or payment credentials.</li>
                  <li>Interfere with website security.</li>
                  <li>Use the website for unlawful activities.</li>
                  <li>Attempt to manipulate reviews, orders, discounts or promotional schemes.</li>
                  <li>Misrepresent their relationship with ETLAWM.</li>
                  <li>Use ETLAWM's intellectual property without authorization.</li>
                </ol>
                <p>
                  ETLAWM may suspend or terminate access to the website where permitted by law if it reasonably believes that a user has violated these Terms.
                </p>
              </div>
            </section>

            {/* Section 18 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                18. THIRD-PARTY SERVICES
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  The website may use third-party service providers, including payment gateways, logistics providers, technology providers, analytics services and other service providers.
                </p>
                <p>Third-party services may be governed by their own terms and privacy policies.</p>
                <p>
                  ETLAWM shall not be responsible for matters solely attributable to a third party, except to the extent liability is imposed upon ETLAWM under applicable law.
                </p>
              </div>
            </section>

            {/* Section 19 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                19. WEBSITE AVAILABILITY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM endeavours to maintain continuous availability of the website but does not guarantee that the website will always be available, uninterrupted, secure or error-free.
                </p>
                <p>
                  The website may occasionally be unavailable because of maintenance, upgrades, technical problems, server failures, cyber incidents or circumstances beyond the reasonable control of ETLAWM.
                </p>
              </div>
            </section>

            {/* Section 20 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                20. LIMITATION OF LIABILITY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  To the maximum extent permitted by applicable law, ETLAWM shall not be liable for indirect, incidental, consequential or special losses arising solely from the use of the website or Products.
                </p>
                <p>
                  Nothing in these Terms shall exclude, restrict or limit liability where such exclusion, restriction or limitation is prohibited by applicable law.
                </p>
                <p>
                  Nothing in these Terms shall affect a consumer's statutory rights or remedies under applicable consumer protection legislation.
                </p>
              </div>
            </section>

            {/* Section 21 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                21. FORCE MAJEURE
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM shall not be responsible for delay or failure in performing its obligations where such delay or failure results from circumstances beyond its reasonable control, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Natural disasters;</li>
                  <li>Floods;</li>
                  <li>Earthquakes;</li>
                  <li>Fire;</li>
                  <li>Epidemics or pandemics;</li>
                  <li>War;</li>
                  <li>Civil disturbance;</li>
                  <li>Government restrictions;</li>
                  <li>Strikes;</li>
                  <li>Transportation disruptions;</li>
                  <li>Internet or telecommunications failure;</li>
                  <li>Cyber incidents;</li>
                  <li>Supply-chain disruptions; or</li>
                  <li>Other events beyond the reasonable control of ETLAWM.</li>
                </ul>
                <p>
                  Where required by applicable law, customers shall retain their statutory rights notwithstanding such circumstances.
                </p>
              </div>
            </section>

            {/* Section 22 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                22. PRIVACY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  The collection, use, storage and processing of personal information submitted through the website shall be governed by ETLAWM's Privacy Policy and applicable Indian law.
                </p>
                <p>
                  Customers are advised to read the Privacy Policy before using the website or providing personal information.
                </p>
              </div>
            </section>

            {/* Section 23 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                23. GRIEVANCE REDRESSAL
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  If you have a complaint, concern or grievance regarding an order, Product or website service, you should first contact ETLAWM through the customer-support/grievance contact details published on the website.
                </p>
                <p>Please include your:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name;</li>
                  <li>Order number;</li>
                  <li>Contact details;</li>
                  <li>Nature of complaint; and</li>
                  <li>Supporting documents, photographs or other relevant information.</li>
                </ul>
                <p>ETLAWM will endeavour to examine and address legitimate complaints within the period prescribed by applicable law.</p>
                
                <div
                  className="p-4 sm:p-5 rounded-xl border mt-4 space-y-2 font-mono text-xs sm:text-sm"
                  style={{
                    backgroundColor: colours.primary || "#F7F3EC",
                    borderColor: colours.border,
                    color: colours.text,
                  }}
                >
                  <p><strong>Grievance Officer:</strong> [Insert Name]</p>
                  <p><strong>Email:</strong> [Insert Official Email]</p>
                  <p><strong>Phone:</strong> [Insert Phone Number]</p>
                  <p><strong>Registered/Correspondence Address:</strong> [Insert Full Address]</p>
                </div>
              </div>
            </section>

            {/* Section 24 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                24. GOVERNING LAW
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>These Terms shall be governed by and interpreted in accordance with the laws of India.</p>
                <p>
                  Nothing in these Terms shall deprive a consumer of any mandatory statutory right, remedy or forum available under applicable Indian law.
                </p>
              </div>
            </section>

            {/* Section 25 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                25. JURISDICTION
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Subject to applicable law and the jurisdiction conferred upon statutory authorities, consumer commissions, courts or other legally competent forums, the parties agree that courts having competent jurisdiction at Prayagraj, Uttar Pradesh shall have exclusive jurisdiction over disputes arising out of or relating to these Terms, the website or transactions with ETLAWM, to the extent such exclusive jurisdiction may legally be agreed upon.
                </p>
                <p>This clause shall not be interpreted as:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Restricting a consumer's statutory right to approach a competent Consumer Commission or other statutory authority;</li>
                  <li>Excluding any jurisdiction that cannot legally be excluded by contract; or</li>
                  <li>Preventing any remedy available to a consumer under applicable law.</li>
                </ul>
              </div>
            </section>

            {/* Section 26 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                26. SEVERABILITY
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  If any provision of these Terms is held to be invalid, unlawful or unenforceable by a competent authority, such provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall continue to remain valid and enforceable to the extent permitted by law.
                </p>
              </div>
            </section>

            {/* Section 27 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                27. WAIVER
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  Failure by ETLAWM to enforce any provision of these Terms shall not constitute a waiver of its right to enforce that provision in the future.
                </p>
              </div>
            </section>

            {/* Section 28 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                28. CHANGES TO THESE TERMS
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  ETLAWM may update or revise these Terms from time to time to reflect changes in Products, business practices, technology or applicable law.
                </p>
                <p>
                  The updated version shall be published on this website with the applicable effective date.
                </p>
                <p>Customers are advised to review these Terms periodically.</p>
                <p>
                  Continued use of the website after an update may constitute acceptance of the revised Terms to the extent permitted by applicable law.
                </p>
              </div>
            </section>

            {/* Section 29 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                29. ENTIRE AGREEMENT
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>
                  These Terms, together with the Privacy Policy, Shipping Policy, Return/Refund Policy and any other terms expressly incorporated by reference, constitute the terms governing your use of the ETLAWM website and purchase of Products, subject to applicable law.
                </p>
              </div>
            </section>

            {/* Section 30 */}
            <section className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-semibold"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                30. CUSTOMER ACKNOWLEDGEMENT
              </h2>
              <div className="space-y-3 text-sm sm:text-base" style={{ color: colours.text }}>
                <p>By placing an order on ETLAWM, the customer acknowledges that:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>They have reviewed the Product information available on the website;</li>
                  <li>They have provided accurate delivery and contact information;</li>
                  <li>They understand that cosmetic and personal-care Products are generally non-returnable once opened or used;</li>
                  <li>They understand that individual results may vary;</li>
                  <li>They agree to follow the Product's instructions and warnings;</li>
                  <li>They understand the applicable shipping and refund terms; and</li>
                  <li>They agree to these Terms subject to their statutory rights under applicable law.</li>
                </ul>
                <p>
                  Nothing contained in these Terms shall be construed as waiving or restricting any non-waivable right available to a consumer under applicable law.
                </p>
              </div>
            </section>

            {/* Bottom Copyright */}
            <div
              className="pt-8 border-t text-center text-xs sm:text-sm font-mono"
              style={{
                borderColor: colours.border,
                color: colours.mutedText,
              }}
            >
              © 2026 Eastern Botanics Pvt. Ltd. / ETLAWM. All Rights Reserved.
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TnC;
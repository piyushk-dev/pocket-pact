import { ArrowRight, Camera, Handshake, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
export function About() {
  return (
    <div className="page about-page">
      <header className="page-heading">
        <div>
          <h1>A pact, not a permission slip.</h1>
          <p>Money is easier to talk about when you have the same picture.</p>
        </div>
      </header>
      <div className="about-story">
        <h2>Meet Ananya and her dad, Kunal.</h2>
        <p>
          She’s figuring out college in a new city. He sends ₹1,000 for the
          week. Sometimes that means a mess meal and the bus. Sometimes it’s a
          lab manual nobody mentioned, or an auto after a late class.
        </p>
        <p>
          Pocket Pact gives them a plan, a simple way to keep track, and room to
          explain when life doesn’t fit a category.
        </p>
      </div>
      <div className="pact-principles">
        <div>
          <Handshake />
          <h3>Make a plan together.</h3>
          <p>
            Agree on meals, commute, study and a little money for whatever she
            chooses.
          </p>
        </div>
        <div>
          <Camera />
          <h3>Capture, then confirm.</h3>
          <p>
            Start with a photo, a receipt or your own words. Review the
            suggested details before saving.
          </p>
        </div>
        <div>
          <MessageCircle />
          <h3>Explain the unexpected.</h3>
          <p>
            A budget exception opens a conversation. It never blocks a purchase
            or takes money back.
          </p>
        </div>
      </div>
      <section className="faq-list">
        <h2>A few things to know.</h2>
        <details>
          <summary>Does Pocket Pact hold or transfer money?</summary>
          <p>
            No. This version records demo funds and expenses. It is not a
            wallet, payment account or banking service.
          </p>
        </details>
        <details>
          <summary>Can a photo prove how much I spent?</summary>
          <p>
            No. A readable receipt can suggest a total. A food or product photo
            cannot prove the price, who paid, or whether it came from your
            pocket money. You supply and confirm the missing details.
          </p>
        </details>
        <details>
          <summary>What does Dad get to see?</summary>
          <p>
            Your saved expenses, categories and notes. Attachments stay private
            unless you choose to share them. Exceptions appear in the Family
            inbox; there are no external email or WhatsApp notifications.
          </p>
        </details>
        <details>
          <summary>How does the demo work?</summary>
          <p>
            Ananya and Kunal are fictional. Switch perspectives in the top-right
            menu to explore both sides. This is a shared demo session, not two
            independently authenticated accounts. Sample expenses are labeled in
            their details.
          </p>
        </details>
        <details>
          <summary>What gets sent to AI providers?</summary>
          <p>
            AI providers are not connected in this UI preview. Planned
            integrations include Gemini for receipt suggestions and Sarvam for
            voice transcription. Use manual entry or sample expenses to explore
            the complete flow today.
          </p>
        </details>
        <details>
          <summary>Can either person change the agreement?</summary>
          <p>
            Either can propose moving money between categories. The other person
            must accept. Existing exception records stay unchanged, so earlier
            spending keeps its original context.
          </p>
        </details>
      </section>
      <Link className="button primary" to="/app">
        Back to your week <ArrowRight size={17} />
      </Link>
    </div>
  );
}

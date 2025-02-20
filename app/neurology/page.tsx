import NeurologyContent from "./NeurologyContent";
import ScrollHandler from "./ScrollHandler";

export default async function NeurologyPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Neurology Notes</h1>
      <ScrollHandler>
        <NeurologyContent />
      </ScrollHandler>
    </div>
  );
}

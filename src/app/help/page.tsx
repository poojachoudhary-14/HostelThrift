export default function HelpPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">How to Use HostelThrift</h1>

      <div className="space-y-5 text-gray-700">
        <div>
          <h2 className="font-semibold text-black mb-1">1. Sign Up</h2>
          <p className="text-sm">
            Use your college email (@cujammu.ac.in) to create an account.
            Add your hostel name and room number so buyers know where to
            find you.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-black mb-1">2. Browse or Sell</h2>
          <p className="text-sm">
            Browse items others are selling from the Home tab, or list your
            own from the Sell tab — add photos, price, and a short
            description.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-black mb-1">3. Message the Seller</h2>
          <p className="text-sm">
            Found something you like? Tap "Message Seller" on the item
            page to start chatting and arrange a time to meet up in the
            hostel.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-black mb-1">4. Meet Up & Pay</h2>
          <p className="text-sm">
            Since it's all within the hostel, just meet in person and pay
            however's easiest — cash or UPI.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-black mb-1">5. Mark as Sold</h2>
          <p className="text-sm">
            Once you've sold an item, go to your listing and mark it as
            "Sold" (or "Reserved" if it's set aside for someone) so others
            know it's no longer available.
          </p>
        </div>
      </div>

      <div className="border-t mt-8 pt-6">
        <h2 className="font-semibold text-black mb-2">Found a bug or issue?</h2>
        <p className="text-sm text-gray-700">
          This app is a student project and still improving! If something's
          not working, or you have a suggestion, reach out:
        </p>
        <p className="text-sm mt-2">
          Email: <a href="mailto:inquiry2407@gmail.com" className="underline font-medium">inquiry2407@gmail.com</a>
        </p>
      </div>
    </div>
  );
}
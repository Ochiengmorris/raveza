import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className=" border bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden">
        <div className="bg-jmprimary px-6 py-8 text-gray-900">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <p className="text-gray-900/95 text-sm mt-2">
            Create your event and start selling tickets
          </p>
        </div>

        <div className="p-6">
          <EventForm mode="create" />
        </div>
      </div>
    </div>
  );
}

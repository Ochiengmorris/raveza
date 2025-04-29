import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import EventForm from "../events/EventForm";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogTitle className="flex items-center justify-between px-4 py-2  border-b border-slate-200/50">
          <span className="text-lg font-semibold text-secondary-foreground">
            Create New Event
          </span>
        </DialogTitle>
        <DialogDescription className="px-6 text-sm text-slate-500">
          Create your event by filling out the form below. Once you submit, we
          will review your event and notify you once it&apos;s live. If you have
          any questions, please contact our support team.
        </DialogDescription>
        <div className="px-6 pb-6">
          <EventForm mode="create" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;

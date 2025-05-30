"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn, useStorageUrl } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea2";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { eventFormSchema, EventFormType } from "@/lib/validation";

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  imageStorageId?: Id<"_storage">;
  category?: string;
  time?: string;
  ticketTypes: {
    _id: Id<"ticketTypes">;
    name: string;
    price: number;
    totalTickets: number;
  }[];
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: InitialEventData;
}

export const categoryOptions = [
  "Music",
  "Sports",
  "Arts",
  "Food & Drink",
  "Technology",
  "Travel",
];

export default function EventForm({ mode, initialData }: EventFormProps) {
  const { user } = useUser();
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.updateEvent);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentImageUrl = useStorageUrl(initialData?.imageStorageId);
  const pathname = usePathname();

  const userDetails = useQuery(api.users.getUserById, {
    userId: user?.id || "",
  });

  // Image upload
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);

  const form = useForm<EventFormType>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      category: initialData?.category ?? "",
      eventDate: initialData ? new Date(initialData.eventDate) : new Date(),
      time: initialData?.time ?? "",
      ticketTypes: initialData?.ticketTypes ?? [
        { name: "", price: 0, totalTickets: 1 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ticketTypes",
  });

  async function onSubmit(values: EventFormType) {
    if (!user?.id) return;

    if (!userDetails) return;

    if (userDetails.isSeller !== true) {
      toast("Oops! You are not a seller", {
        description: "Only sellers can create or update events.",
      });
      return;
    }

    if (!values.ticketTypes || values.ticketTypes.length === 0) {
      toast("Ticket Type Required", {
        description: "At least one ticket type must be added.",
      });
      return;
    }

    startTransition(async () => {
      try {
        let imageStorageId = null;

        // Handle image changes
        if (selectedImage) {
          // Upload new image
          imageStorageId = await handleImageUpload(selectedImage);
        }

        // Handle image deletion/update in edit mode
        if (mode === "edit" && initialData?.imageStorageId) {
          if (removedCurrentImage || selectedImage) {
            // Delete old image from storage
            await deleteImage({
              storageId: initialData.imageStorageId,
            });
          }
        }

        if (mode === "create") {
          const eventId = await createEvent({
            ...values,
            userId: user.id,
            eventDate: values.eventDate.getTime(),
          });

          if (imageStorageId) {
            await updateEventImage({
              eventId,
              storageId: imageStorageId as Id<"_storage">,
            });
          }

          router.push(`/events/${eventId}`);
          toast.success("Event created", {
            description: "Your event has been successfully created.",
          });
        } else {
          // Ensure initialData exists before proceeding with update
          if (!initialData) {
            throw new Error("Initial event data is required for updates");
          }

          // Update event details
          await updateEvent({
            eventId: initialData._id,
            ...values,
            eventDate: values.eventDate.getTime(),
            // time: values.time,
            ticketTypes: values.ticketTypes.map((type, index) => ({
              id: initialData.ticketTypes[index]?._id,
              name: type.name,
              price: type.price,
              totalTickets: type.totalTickets,
            })),
          });

          // Update image - this will now handle both adding new image and removing existing image
          if (imageStorageId || removedCurrentImage) {
            await updateEventImage({
              eventId: initialData._id,
              // If we have a new image, we use its ID, otherwise if we're removing the image, pass null
              storageId: imageStorageId
                ? (imageStorageId as Id<"_storage">)
                : null,
            });
          }

          if (pathname.includes("seller")) {
            router.push(`/seller/events`);
          } else {
            router.push(`/events/${initialData._id}`);
          }
          toast.success("Event updated", {
            description: "Your event has been successfully updated.",
          });
        }
      } catch (error: unknown) {
        console.error("Failed to handle event:", error);
        const match = (error as { message?: string })?.message?.match(
          /Cannot reduce.*sold\)/,
        );
        const errorMessage = match ? match[0] : "An unexpected error occurred.";
        toast.error("Uh oh! Something went wrong.", {
          description: errorMessage,
        });
      }
    });
  }

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields */}
        <div className="">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel className={cn("text-muted-foreground")}>
                  Event Name
                </FormLabel> */}
                <FormControl>
                  {/* <Input
                    {...field}
                    className={cn(
                      "focus:ring-0 focus:border-0 text-2xl font-bold",
                    )}
                  /> */}
                  <input
                    {...field}
                    className={cn(
                      "focus:ring-0 focus:border-0 text-3xl font-bold w-full focus:border-gray-300 rounded-md p-2",
                    )}
                    placeholder="Event Name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                {/* <div className="flex items-center justify-between">
                  <FormLabel className={cn("text-muted-foreground")}>
                    Description
                  </FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={isGeneratingDescription}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div> */}
                <FormControl>
                  {/* <Textarea
                    {...field}
                    className={cn("focus:ring-0 focus:border-0")}
                  ></Textarea> */}
                  {/* <textarea
                    {...field}
                    className={cn(
                      "focus:ring-0 focus:border-0 resize-none w-full h-auto focus:border-gray-300 rounded-md p-2",
                    )}
                    placeholder="Event Description"
                  ></textarea> */}
                  <Textarea
                    {...field}
                    className={cn(
                      "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0",
                    )}
                    placeholder="Event Description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
            <div className="flex items-center gap-4">
              {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setRemovedCurrentImage(true);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInput}
                  className="block w-full aspect-square  text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-gray-950
                    hover:file:cursor-pointer hover:file:bg-primary/10  transition-colors "
                />
              )}
            </div>

            {/* Right side */}
            <div className="gap-4 flex flex-col">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn("text-muted-foreground")}>
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(
                          "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0",
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn("text-muted-foreground")}>
                      Category
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn("text-muted-foreground")}>
                        Event Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          onChange={(e) => {
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null,
                            );
                          }}
                          value={
                            field.value
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          min={new Date().toISOString().split("T")[0]} // Prevent past dates
                          className={cn(
                            "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 justify-end lg:justify-start text-sm lg:text-base",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={cn("text-muted-foreground")}>
                        Event Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          className={cn(
                            "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 justify-end lg:justify-start text-sm lg:text-base",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="text-card-foreground flex flex-col rounded-xl p-2 mt-2">
            <label
              htmlFor="ticketTypes"
              className="text-muted-foreground text-sm font-medium mb-2 p-2"
            >
              Ticket Types
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="bg-card text-card-foreground shadow-lg rounded-lg p-2 relative"
                >
                  <input
                    type="text"
                    className={cn(
                      "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 text-base font-bold w-full focus:border-gray-300 rounded-md p-2",
                    )}
                    {...form.register(`ticketTypes.${index}.name`)}
                    placeholder="Ticket Name"
                  />
                  <div className="grid grid-cols-2 gap-4 px-2">
                    <div className="flex items-center">
                      <span className="text-xs text-card-foreground font-extrabold">
                        KES
                      </span>
                      <input
                        type="number"
                        className={cn(
                          "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 text-lg font-bold w-full border-b focus:border-gray-300 rounded-md p-2",
                        )}
                        {...form.register(`ticketTypes.${index}.price`, {
                          valueAsNumber: true,
                        })}
                        placeholder="Price"
                      />
                    </div>

                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <input
                              type="number"
                              className={cn(
                                "focus:outline-none focus-within:outline-none focus-within:ring-0 focus-visible:ring-0 text-lg font-bold w-full border-b focus:border-gray-300 rounded-md p-2",
                              )}
                              {...form.register(
                                `ticketTypes.${index}.totalTickets`,
                                {
                                  valueAsNumber: true,
                                },
                              )}
                              placeholder="Total Tickets"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total Tickets</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute p-0 top-4 right-4 cursor-pointer"
                    aria-label="Remove Ticket Type"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => append({ name: "", price: 0, totalTickets: 1 })}
              className="mt-4 max-w-fit"
            >
              Add Ticket Type
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          onSubmit={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="place-self-end font-semibold py-6 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Creating Event..." : "Updating Event..."}
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </form>
    </Form>
  );
}

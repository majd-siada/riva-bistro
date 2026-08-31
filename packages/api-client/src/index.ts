import type { components } from "./schema";

export type { components, operations, paths } from "./schema";

type Schemas = components["schemas"];

/** Shared VAT pricing block on menu products and modifier options. */
export type Pricing = Schemas["ProductList"]["pricing"];

export type Category = Schemas["Category"];
export type ModifierOption = Schemas["ModifierOption"];
export type ModifierGroup = Schemas["ModifierGroup"];
export type Product = Schemas["ProductList"];
export type ProductDetail = Schemas["ProductDetail"];
export type OpeningHour = Schemas["OpeningHours"];
export type AvailabilitySlot = Schemas["AvailabilitySlot"];
export type Availability = Schemas["Availability"];
export type ReservationRequest = Schemas["ReservationCreate"];
export type Reservation = Schemas["ReservationCreateResponse"];
export type ContactMessageRequest = Schemas["Contact"];
export type EventInquiryRequest = Schemas["EventInquiry"];

export type AdminSession = Schemas["AdminSession"];
export type AdminReservation = Schemas["Reservation"];
export type AdminOverview = Schemas["AdminOverview"];
export type AdminOpeningHour = Schemas["OpeningHours"];
export type AdminClosure = Schemas["SpecialClosure"];
export type AdminSettings = Schemas["ReservationSettings"];
export type AdminCategory = Schemas["AdminCategory"];
export type AdminProduct = Schemas["AdminProduct"];

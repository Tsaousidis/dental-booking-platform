"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { useState } from "react";

type AppointmentTypeItem = {
  id: string;
  name_el: string;
  name_en: string;
  duration_minutes: number;
  is_active: boolean;
};

export function AppointmentTypesOrderList({
  appointmentTypes,
}: {
  appointmentTypes: AppointmentTypeItem[];
}) {
  const [items, setItems] = useState(appointmentTypes);

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="mt-6 grid gap-4">
      {items.map((type, index) => (
        <AppointmentTypeRow
          key={type.id}
          type={type}
          index={index}
        />
      ))}
    </Reorder.Group>
  );
}

function AppointmentTypeRow({
  type,
  index,
}: {
  type: AppointmentTypeItem;
  index: number;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={type}
      dragListener={false}
      dragControls={dragControls}
      whileDrag={{
        scale: 1.015,
        boxShadow: "0 18px 40px rgba(104, 92, 82, 0.18)",
        zIndex: 10,
      }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="grid gap-4 border border-line bg-background p-4 transition-colors hover:border-champagne lg:grid-cols-[34px_1fr_1fr_150px_120px_120px]"
    >
      <button
        type="button"
        aria-label="Σύρετε για αλλαγή σειράς"
        onPointerDown={(event) => dragControls.start(event)}
        className="flex h-11 w-8 cursor-grab items-center justify-center rounded-sm border border-line bg-surface text-muted transition hover:border-accent hover:bg-champagne/20 hover:text-accent active:cursor-grabbing"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>
      <input
        type="hidden"
        name={`appointment_type_${type.id}_sort_order`}
        value={(index + 1) * 10}
      />
      <AppointmentTextField
        label="Όνομα στα Ελληνικά"
        name={`appointment_type_${type.id}_name_el`}
        defaultValue={type.name_el}
      />
      <AppointmentTextField
        label="Όνομα στα Αγγλικά"
        name={`appointment_type_${type.id}_name_en`}
        defaultValue={type.name_en}
      />
      <AppointmentNumberField
        label="Διάρκεια"
        name={`appointment_type_${type.id}_duration_minutes`}
        defaultValue={type.duration_minutes}
        suffix="min"
      />
      <label className="flex items-end gap-3 pb-3 text-sm font-medium">
        <input
          type="checkbox"
          name={`appointment_type_${type.id}_is_active`}
          defaultChecked={type.is_active}
          className="h-5 w-5 accent-[var(--accent)]"
        />
        Ενεργό
      </label>
      <label className="flex items-end gap-3 pb-3 text-sm font-medium text-red-600">
        <input
          type="checkbox"
          name={`appointment_type_${type.id}_delete`}
          className="h-5 w-5 accent-red-600"
        />
        Διαγραφή
      </label>
    </Reorder.Item>
  );
}

function AppointmentTextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        required
        className="min-h-11 rounded-sm border border-line bg-background px-3 text-base outline-none transition focus:border-accent"
      />
    </label>
  );
}

function AppointmentNumberField({
  label,
  name,
  defaultValue,
  suffix,
}: {
  label: string;
  name: string;
  defaultValue: number;
  suffix: string;
}) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium">
      {label}
      <span className="flex min-h-11 w-full min-w-0 items-center rounded-sm border border-line bg-background focus-within:border-accent">
        <input
          name={name}
          type="number"
          min={1}
          defaultValue={defaultValue}
          required
          className="w-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
        />
        <span className="pr-3 text-sm text-muted">{suffix}</span>
      </span>
    </label>
  );
}

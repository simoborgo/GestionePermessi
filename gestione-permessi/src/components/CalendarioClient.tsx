"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";

export default function CalendarioClient() {
  return (
    <>
      <style>{`
        .fc .fc-button-primary {
          background-color: var(--color-primary) !important;
          border-color: var(--color-primary) !important;
          font-family: var(--font-ui) !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-size: 11px !important;
          border-radius: var(--radius-button) !important;
        }
        .fc .fc-button-primary:hover {
          background-color: var(--color-primary-dark) !important;
          border-color: var(--color-primary-dark) !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: var(--color-primary-dark) !important;
          border-color: var(--color-primary-dark) !important;
        }
        .fc .fc-toolbar-title {
          font-family: var(--font-display) !important;
          color: var(--color-black) !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
        }
        .fc .fc-col-header-cell-cushion,
        .fc .fc-daygrid-day-number {
          color: var(--color-grey-mid) !important;
          font-family: var(--font-ui) !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: #FEF3E4 !important;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={itLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        }}
        height="auto"
        events={async (info, successCallback, failureCallback) => {
          try {
            const res = await fetch(`/api/calendario?start=${info.startStr}&end=${info.endStr}`);
            const dati = await res.json();
            successCallback(dati.eventi);
          } catch (err) {
            failureCallback(err as Error);
          }
        }}
        eventDisplay="block"
        dayMaxEvents={3}
        buttonText={{ today: "Oggi", month: "Mese", week: "Settimana" }}
      />
    </>
  );
}

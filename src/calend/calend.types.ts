export type CalendarEventType = {
    start: {
        date: string;
    };
    summary: string;
    description?: string;
};

export type CalendarType = {
    items: CalendarEventType[];
};
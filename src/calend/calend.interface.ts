import { CalendarType } from "./calend.types";

export interface ICalendarService {
    getCalendarData(): Promise<CalendarType>;
}
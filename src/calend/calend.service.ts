import { Injectable } from "@nestjs/common";
import { CalendarType } from "./calend.types";
import { ICalendarService } from "./calend.interface";

@Injectable()
export class CalendService implements ICalendarService {
    async getCalendarData(): Promise<CalendarType> {
        if (!process.env.CALEND) {
            throw new Error(
                "Missing required environmental variables for Calendar",
            );
        }
        let apiCall = await fetch(process.env.CALEND as string); // add retry
        let apiResponse = await apiCall.json();
        // retry if error
        return apiResponse as CalendarType;
    }
}

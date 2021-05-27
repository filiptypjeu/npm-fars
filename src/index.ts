import moment from "moment";
import WebLoginManager from "web-login-manager";

export interface IFarsUser {
  username: string;
  first_name: string;
  last_name: string;
}

export interface IFarsBookingGroup {
  name: string;
}

export interface IFarsBooking {
  id: number;
  user: IFarsUser;
  booking_group: IFarsBookingGroup | null;
  start: string;
  end: string;
  comment: string;
  bookable: number;
  repeatgroup: number | null;
}

export interface IFarsSearchResult {
  start?: Date;
  end?: Date;
  bookable?: string;
  result: IFarsBooking[];
  url: string;
}

export class FARSManager extends WebLoginManager {
  /**
   * @param {string} baseURL - The base URL for FARS, with no ending '/'.
   * @param {string | undefined} username - The login username.
   * @param {string | undefined} password - The login password.
   */
  constructor(baseURL: string, username: string, password: string) {
    super({
      baseURL,
      username,
      password,
      loginPath: "/login/",
      sessionidCookieName: "sessionid",
      middlewaretokenName: "csrfmiddlewaretoken",
    })
  }

  /**
   * Request bookings for a specific bookable and for a specific time.
   *
   * @param {Date | undefined} dateFrom - The start date from which to search bookings.
   * @param {Date | undefined} dateTo - The end date to which to search bookings.
   * @param {string | undefined} bookable - The 'bookable' in string format.
   */
  public bookings = async (dateFrom?: Date, dateTo?: Date, bookable?: string): Promise<IFarsSearchResult> => {
    const path = this.createPath(dateFrom, dateTo, bookable);

    return this.fetch(path)
      .then(res => res.json())
      .then(b => {
        return {
          start: dateFrom,
          end: dateTo,
          bookable,
          result: b,
          url: path,
        };
      })
      .catch(error => {
        return Promise.reject(error);
      });
  };

  /**
   * Get FARS bookings starting from right now.
   *
   * @param days The amount of days forward/backwards to search for bookings.
   * @param bookable The bookable.
   */
  public bookingsFromNow = async (days: number, bookable?: string): Promise<IFarsSearchResult> => {
    const d1 = new Date();
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + days);

    if (d1 < d2) {
      return this.bookings(d1, d2, bookable);
    } else {
      return this.bookings(d2, d1, bookable);
    }
  };

  /**
   * Get FARS bookings starting from today at 00:00:00.
   *
   * @param days The amount of days forward/backwards to search for bookings.
   * @param bookable The bookable.
   */
  public bookingsFromToday = async (days: number, bookable?: string): Promise<IFarsSearchResult> => {
    const d1 = new Date();
    d1.setHours(0);
    d1.setMinutes(0);
    d1.setMilliseconds(0);

    const d2 = new Date(d1);
    d2.setMinutes(d2.getMinutes() - 1);

    if (days > 0) {
      d2.setDate(d2.getDate() + days);
    } else {
      d1.setDate(d1.getDate() + days);
    }

    return this.bookings(d1, d2, bookable);
  };

  /**
   * Helper method to group bookings by the bookable.
   *
   * @param reservations The bookings to group.
   */
  public groupByBookable = (reservations: IFarsBooking[]): Map<number, IFarsBooking[]> => {
    const m = new Map<number, IFarsBooking[]>();
    reservations.forEach(f => {
      m.set(f.bookable, (m.get(f.bookable) || []).concat(f));
    });

    return m;
  };

  /**
   * Helper method to group bookings by date. The date will be in the string format "YYYY-MM-DD".
   *
   * @param reservations The bookings to group.
   */
  public groupByDate = (reservations: IFarsBooking[]): Map<string, IFarsBooking[]> => {
    const m = new Map<string, IFarsBooking[]>();
    reservations.forEach(f => {
      const startDate = moment(new Date(f.start)).format("YYYY-MM-DD");
      m.set(startDate, (m.get(startDate) || []).concat(f));
    });

    return m;
  };

  /**
   * Create a path for a GET request.
   */
  private createPath = (dateFrom?: Date, dateTo?: Date, bookable?: string): string => {
    return (
      `/api/bookings?` +
      `bookable=${bookable ? bookable : ""}` +
      `&after=${dateFrom ? moment(dateFrom).format("YYYY-MM-DDTHH:mm:ss") : ""}` +
      `&before=${dateTo ? moment(dateTo).format("YYYY-MM-DDTHH:mm:ss") : ""}&format=json`
    );
  };
}

export default FARSManager;

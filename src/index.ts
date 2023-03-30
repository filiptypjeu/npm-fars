import moment from "moment";
import WebLoginManager from "web-login-manager";
import querystring from "node:querystring";

export interface IFarsUser {
  username: string;
  first_name: string;
  last_name: string;
}

export interface IFarsBookingGroup {
  name: string;
}

export interface IPage<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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

export interface IFarsBookingQueryParameters {
  limit?: number;
  offset?: number;
  bookable?: string;
  before?: Date;
  after?: Date;
  username?: string;
  booking_group?: string;
  ordering?: "id" | "-id" | "start" | "-start" | "end" | "-end";
}

export interface IFarsBookable {
  id: number;
  id_str: string;
  name: string;
  description: string;
  forward_limit_days: number;
  length_limit_hours: number;
}

export interface IFarsSearchResult {
  result: IFarsBooking[];
  queryParameters: IFarsBookingQueryParameters;
  url: string;
}

export class FARSManager extends WebLoginManager {
  protected m_bookables: IFarsBookable[] = [];

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
    });
  }

  public override toString = (user: IFarsUser): string => {
    const name = [user.first_name, user.last_name].join(" ").trim();

    if (name && user.username) {
      return `${name} (${user.username})`;
    }

    return [name, user.username].join(" ").trim();
  };

  public getBookables = async (forceUpdate = false): Promise<IFarsBookable[]> => {
    if (forceUpdate || !this.m_bookables.length) {
      this.m_bookables = await this.fetch(this.getApiPath("bookables"))
        .then(res => res.json())
        .catch(error => Promise.reject(error));
    }
    return this.m_bookables;
  };

  private isBookingsPage(page: any): page is IPage<IFarsBooking> {
    if ("results" in page && Array.isArray(page.results)) {
      if (page.results.length) {
        return "booking_group" in page.results[0];
      }
      return true;
    }
    return false;
  }

  /**
   * Fetch bookings.
   */
  public bookings = async (params?: IFarsBookingQueryParameters): Promise<IFarsSearchResult> => {
    const path = this.getApiPath("bookings", params);
    let url = "";

    return this.fetch(path)
      .then(res => {
        url = res.url;
        return res.json();
      })
      .then(page => {
        if (!this.isBookingsPage(page)) {
          throw new Error(`Failed to fetch bookings at ${url}`);
        }
        return {
          result: page.results,
          queryParameters: params || {},
          url,
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
  public bookingsFromNow = async (
    days: number,
    params?: Omit<IFarsBookingQueryParameters, "after" | "before">
  ): Promise<IFarsSearchResult> => {
    const newParams: IFarsBookingQueryParameters = { ...params };
    const d1 = new Date();
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + days);
    if (d1 < d2) {
      newParams.after = d1;
      newParams.before = d2;
    } else {
      newParams.after = d2;
      newParams.before = d1;
    }

    return this.bookings(newParams);
  };

  /**
   * Get FARS bookings starting from today at 00:00:00.
   *
   * @param days The amount of days forward/backwards to search for bookings. 0 = today, 1 += tomorrow, -1 += yesterday
   * @param bookable The bookable.
   */
  public bookingsFromToday = async (
    days: number,
    params?: Omit<IFarsBookingQueryParameters, "after" | "before">
  ): Promise<IFarsSearchResult> => {
    // Set start date today
    const d1 = new Date();
    d1.setHours(0);
    d1.setMinutes(0);
    d1.setSeconds(0);
    d1.setMilliseconds(0);

    // Set end date to end of today
    const d2 = new Date(d1);
    d2.setMilliseconds(d2.getMilliseconds() - 1);
    d2.setDate(d2.getDate() + 1);

    if (days > 0) {
      // Move end date forwards
      d2.setDate(d2.getDate() + days);
    } else {
      // Move start date backwards
      d1.setDate(d1.getDate() + days);
    }

    return this.bookings({ ...params, after: d1, before: d2 });
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
  public getApiPath(endpoint: "bookings", params?: IFarsBookingQueryParameters): string;
  public getApiPath(endpoint: "bookables"): string;
  public getApiPath(endpoint: "bookings" | "bookables", params?: IFarsBookingQueryParameters): string {
    const query: any = {
      ...params,
      format: "json",
    };
    if (params?.after) query.after = this.encodeDate(params.after);
    if (params?.before) query.before = this.encodeDate(params.before);

    return `/api/${endpoint}?` + querystring.stringify(query);
  }

  private encodeDate = (date?: Date) => date && moment(date).format("YYYY-MM-DDTHH:mm:ss");
}

export default FARSManager;

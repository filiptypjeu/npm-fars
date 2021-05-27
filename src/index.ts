import moment from "moment";
import fetch, { RequestInit, Response } from "node-fetch";

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

interface ICookie {
  name: string;
  value: string;
  expires: number;
}

export class FARSManager {
  private baseURL: string;
  private loginPath = "/login/";
  private apiPath = "/api/";
  private username: string;
  private password: string;
  private cookies: ICookie[] = [];

  /**
   * @param {string} baseURL - The base URL for FARS, with no ending '/'.
   * @param {string | undefined} username - The login username, if authenication is needed.
   * @param {string | undefined} password - The login password, if authenication is needed.
   */
  constructor(baseURL: string, username?: string, password?: string) {
    this.baseURL = baseURL;
    this.username = username || "";
    this.password = password || "";
  }

  /**
   * Request bookings for a specific bookable and for a specific time.
   *
   * @param {Date | undefined} dateFrom - The start date from which to search bookings.
   * @param {Date | undefined} dateTo - The end date to which to search bookings.
   * @param {string | undefined} bookable - The 'bookable' in string format.
   */
  public bookings = async (dateFrom?: Date, dateTo?: Date, bookable?: string): Promise<any> => {
    const path = this.createPath(dateFrom, dateTo, bookable);
    const url = this.baseURL + path;

    const cookies = this.getCookies();
    if (!cookies.includes("sessionid")) {
      await this.login();
    }

    return this.farsFetch(url, "GET")
      .then(res => res.json())
      .then(b => {
        return {
          start: dateFrom,
          end: dateTo,
          bookable,
          result: b,
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
      `${this.apiPath}bookings?` +
      `bookable=${bookable ? bookable : ""}` +
      `&after=${dateFrom ? moment(dateFrom).format("YYYY-MM-DDTHH:mm:ss") : ""}` +
      `&before=${dateTo ? moment(dateTo).format("YYYY-MM-DDTHH:mm:ss") : ""}&format=json`
    );
  };

  /**
   * Get the current, non-expired, cookies.
   */
  private getCookies = (): string => {
    const a: string[] = [];
    const d = Date.now();
    this.cookies.forEach(c => {
      if (d >= c.expires) {
        c.value = "";
      }
      a.push(`${c.name}=${c.value}`);
    });

    this.cookies = this.cookies.filter(c => c.value !== "");

    return a.join("; ");
  };

  /**
   * Update the current cookies based on the 'set-cookie' header in a fetch Response.
   */
  private updateCookies = (response: Response): void => {
    // Get the cookies to set from the header
    const cookies = response.headers.raw()["set-cookie"];

    if (!cookies) {
      return;
    }

    // Go through all new cookies
    cookies.forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      const value = cookie
        .split("=")[1]
        .split(";")[0]
        .trim();
      const expires = new Date(
        cookie
          .split("expires=")[1]
          .split(";")[0]
          .trim()
      ).valueOf();
      const oldCookie = this.cookies.find(c => c.name === name);

      if (oldCookie) {
        oldCookie.value = value;
        oldCookie.expires = expires;
      } else {
        this.cookies.push({
          name,
          value,
          expires,
        });
      }
    });
  };

  /**
   * Internal fetch that automatically uses and updates the cookies.
   */
  private farsFetch = async (url: string, method: string, body?: string): Promise<Response> => {
    const isPost = method.toLowerCase() === "post";

    const options: RequestInit = {
      method,
      redirect: "manual",
      headers: {
        cookie: this.getCookies(),
        "content-type": isPost ? "application/x-www-form-urlencoded" : "",
      },
    };

    if (isPost) {
      options.body = body || "";
    }

    return fetch(url, options).then(res => {
      this.updateCookies(res);
      return res;
    });
  };

  /**
   * Updates the sessionid cookie by logging in.
   */
  private login = async (): Promise<void> => {
    const loginUrl = this.baseURL + this.loginPath;

    const res = await this.farsFetch(loginUrl, "GET");

    // Find the CSRF middleware token in the form
    const token = (await res.text())
      .split("name='csrfmiddlewaretoken'")[1]
      .split("value='")[1]
      .split("'")[0];
    const body = `csrfmiddlewaretoken=${token}&username=${this.username}&password=${this.password}`; // &next=${next}`;

    await this.farsFetch(loginUrl, "POST", body);
  };
}

export default FARSManager;

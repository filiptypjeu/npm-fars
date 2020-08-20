import cheerio from "cheerio";
import moment from "moment";
import rp from "request-promise";

let farsBaseURL: string = "";
let farsLoginPath: string = "";
let farsApiPath: string = "";
let farsUsername: string = "";
let farsPassword: string = "";

interface IFarsUser {
  username: string;
  first_name: string;
  last_name: string;
}

interface IFarsBookingGroup {
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

interface IFarsSearchResult {
  start?: Date;
  end?: Date;
  bookable?: string;
  result: IFarsBooking[];
  url: string;
}

const getURL = (dateFrom?: Date, dateTo?: Date, bookable?: string): string => {
  return (
    `${farsApiPath}bookings?` +
    `bookable=${bookable ? bookable : ""}` +
    `&after=${dateFrom ? moment(dateFrom).format("YYYY-MM-DDTHH:mm:ss") : ""}` +
    `&before=${dateTo ? moment(dateTo).format("YYYY-MM-DDTHH:mm:ss") : ""}&format=json`
  );
};

const farsLogin = async (next: string) => {
  if (!farsUsername) {
    return Promise.reject(new Error("No username set."));
  }

  if (!farsPassword) {
    return Promise.reject(new Error("No password set."));
  }

  return rp({
    method: "GET",
    uri: farsBaseURL + farsLoginPath,
    followAllRedirects: true,
    jar: true,
  }).then(body => {
    const $ = cheerio.load(body);
    const token = $('[name="csrfmiddlewaretoken"]').val();

    return rp({
      method: "POST",
      uri: farsBaseURL + farsLoginPath,
      followAllRedirects: true,
      jar: true,
      form: { username: farsUsername, password: farsPassword, csrfmiddlewaretoken: token, next },
    });
  });
};

/**
 * @param {string} url - The base URL for FARS, with no ending '/'
 * @param {string | undefined} username - The login username, if authenication is needed.
 * @param {string | undefined} password - The login password, if authenication is needed.
 * @param {string | undefined} loginPath - Set a specific login path. The default is /login/.
 * @param {string | undefined} apiPath - Set a specific API path. The default is /api/.
 */
export const setFarsParams = (url: string, username?: string, password?: string, loginPath?: string, apiPath?: string) => {
  farsBaseURL = url;
  farsLoginPath = loginPath ? loginPath : "/login/";
  farsApiPath = apiPath ? apiPath : "/api/";
  farsUsername = username || "";
  farsPassword = password || "";
};

/**
 * Request bookings for a specific bookable and for a specific time.
 *
 * @param {Date | undefined} dateFrom - The start date from which to search bookings.
 * @param {Date | undefined} dateTo - The end date to which to search bookings.
 * @param {string | undefined} bookable - The 'bookable' in string format.
 */
export const bookings = async (dateFrom?: Date, dateTo?: Date, bookable?: string): Promise<any> => {
  if (!farsBaseURL) {
    return Promise.reject(new Error("No URL set."));
  }

  const path = getURL(dateFrom, dateTo, bookable);
  const url = farsBaseURL + path;

  return rp({
    method: "GET",
    uri: url,
    followAllRedirects: true,
    jar: true,
  })
    .then(body => {
      const b: IFarsBooking[] = JSON.parse(body);
      return {
        start: dateFrom,
        end: dateTo,
        bookable: bookable,
        result: b,
        url,
      };
    })
    .catch(async e => {
      // Check if login is required
      if (e.statusCode !== 403) {
        return Promise.reject(e);
      }

      return farsLogin(path)
        .then(body => {
          const b: IFarsBooking[] = JSON.parse(body);
          return {
            start: dateFrom,
            end: dateTo,
            bookable: bookable,
            result: b,
            url,
          };
        })
        .catch(async error => {
          return Promise.reject(error);
        });
    });
};

/**
 * Get FARS bookings starting from right now.
 *
 * @param days The amount of days forward/backwards to search for bookings.
 * @param bookable The bookable.
 */
export const bookingsFromNow = async (days: number, bookable?: string): Promise<IFarsSearchResult> => {
  const d1 = new Date();
  const d2 = new Date(d1);
  d2.setDate(d2.getDate() + days);

  if (d1 < d2) {
    return bookings(d1, d2, bookable);
  } else {
    return bookings(d2, d1, bookable);
  }
};

/**
 * Get FARS bookings starting from today at 00:00:00.
 *
 * @param days The amount of days forward/backwards to search for bookings.
 * @param bookable The bookable.
 */
export const bookingsFromToday = async (days: number, bookable?: string): Promise<IFarsSearchResult> => {
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

  return bookings(d1, d2, bookable);
};

/**
 * Helper method to group bookings by the bookable.
 *
 * @param reservations The bookings to group.
 */
export const groupByBookable = (reservations: IFarsBooking[]): Map<number, IFarsBooking[]> => {
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
export const groupByDate = (reservations: IFarsBooking[]): Map<string, IFarsBooking[]> => {
  const m = new Map<string, IFarsBooking[]>();
  reservations.forEach(f => {
    const startDate = moment(new Date(f.start)).format("YYYY-MM-DD");
    m.set(startDate, (m.get(startDate) || []).concat(f));
  });

  return m;
};

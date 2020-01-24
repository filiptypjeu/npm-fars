import moment = require('moment');
import rp = require('request-promise');

let farsBaseURL: string = '';

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
    `${farsBaseURL}/bookings?` +
    `bookable=${bookable ? bookable : ''}` +
    `&after=${dateFrom ? moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss') : ''}` +
    `&before=${dateTo ? moment(dateTo).format('YYYY-MM-DDTHH:mm:ss') : ''}`
  );
};

/**
 * Sets the API URL.
 *
 * @param url - URL for the API that shuld be used in future requests.
 */
export const setFarsURL = (url: string) => (farsBaseURL = url);

/**
 * Request bookings for a specific room and for a specific time.
 *
 * @param {Date | undefined} dateFrom - The start date from which to search bookings.
 * @param {Date | undefined} dateTo - The end date to which to search bookings.
 * @param {string | undefined} room - The 'bookable' in string format.
 */
export const bookings = async (dateFrom?: Date, dateTo?: Date, room?: string): Promise<IFarsSearchResult> => {
  if (!farsBaseURL) {
    return Promise.reject(new Error('The base URL for the API need to be set with setUrl(url).'));
  }

  const url = getURL(dateFrom, dateTo, room);

  return rp
    .get(url)
    .then(body => {
      const b: IFarsBooking[] = JSON.parse(body);
      return {
          start: dateFrom,
          end: dateTo,
          bookable: room,
          result: b,
          url: url,
        };
    })
    .catch(e => {
      return Promise.reject(e);
    });
};

type BookingTimestamp = `${number}-${number}-${number}T${number}:${number}:${number}+${number}:${number}` | string;
type TimeslotTimestamp = `${number}:${number}:${number}`;

export interface IFarsUser {
  username: string;
  first_name: string;
  last_name: string;
}

export interface IGkey {
  username: string;
  group_name?: string;
  start_date: Date;
  end_date: Date;
  unlock_door: boolean;
  restrict_keys: boolean;
  disable_sauna_heating: boolean;
  code?: string;
}

export interface API {
  bookings: {
    list: {
      id: number;
      user: IFarsUser;
      booking_group: {
        name: string;
      } | null;
      start: BookingTimestamp;
      end: BookingTimestamp;
      comment: string;
      bookable: number;
      repeatgroup: number | null;
    };
    list_paginated: true;
    list_filters: {
      search: string;
      ordering: ("id" | "-id" | "start" | "-start" | "end" | "-end")[];
      limit: number;
      offset: number;
      bookable: string;
      before: string;
      after: string;
      username: string;
      booking_group: string;
    };
  };
  bookables: {
    list: {
      id: number;
      id_str: string;
      name: string;
      description: string;
      forward_limit_days: number;
      length_limit_hours: number;
    };
  };
  timeslots: {
    list: {
      bookable: number;
      start_time: TimeslotTimestamp;
      start_weekday: string;
      end_time: TimeslotTimestamp;
      end_weekday: string;
    };
    list_filters: {
      bookable: string;
    };
  };
  gkey: {
    list: IGkey;
    list_filters: {
      bookable: string;
    };
  };
}

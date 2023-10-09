import { API, FARS } from "../..";

export interface Variables {
  apiBaseUrl: string;
  username: string;
  password: string;
  bookables: string[];
  specific_case: {
    run_this_test: boolean;
    query_parameters: Partial<API["bookings"]["list_filters"]>;
    result: API["bookings"]["list"];
  };
}

const variables: Variables = {
  /**
   * Login information
   */
  apiBaseUrl: "",
  username: "",
  password: "",

  /**
   * Bookables
   */
  bookables: [],

  /**
   * Test a specific case
   */
  specific_case: {
    run_this_test: false,
    query_parameters: {
      after: FARS.encodeDate("2020-01-01T00:00:00"),
      before: FARS.encodeDate("2020-01-02T00:00:00"),
      bookable: "myBookable1",
    },
    result: {
      id: 42,
      user: {
        username: "",
        first_name: "",
        last_name: "",
      },
      booking_group: null,
      start: "2020-01-01T00:00:00",
      end: "2020-01-02T00:00:00",
      comment: "",
      bookable: 1,
      repeatgroup: null,
    },
  },
};

export default variables;

import { IFarsBookable, IFarsBooking, IFarsBookingQueryParameters, IPage } from "../..";

export interface Variables {
  myBaseURL: string;
  myUsername: string;
  myPassword: string;
  myBookables: IFarsBookable[];
  mySpecificCase: {
    runThisTest: boolean;
    queryParameters: IFarsBookingQueryParameters;
    resultPage: IPage<IFarsBooking>;
  };
}

const variables: Variables = {
  /**
   * Login information
   */
  myBaseURL: "",
  myUsername: "",
  myPassword: "",

  /**
   * Bookables
   */
  myBookables: [],

  /**
   * Test a specific case
   */
  mySpecificCase: {
    runThisTest: false,
    queryParameters: {
      after: new Date("2020-01-01T00:00:00+02:00"),
      before: new Date("2020-01-02T00:00:00+02:00"),
      bookable: "myBookable1",
    },
    resultPage: {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 42,
          user: {
            username: "",
            first_name: "",
            last_name: "",
          },
          booking_group: null,
          start: "2020-01-01T00:00:00+02:00",
          end: "2020-01-02T00:00:00+02:00",
          comment: "",
          bookable: 1,
          repeatgroup: null,
        },
      ],
    },
  },
};

export default variables;
